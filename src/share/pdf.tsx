import { Circle, Document, Font, Line, Page, Path, Rect, Svg, Text, View, pdf } from '@react-pdf/renderer';
import { HARD_PERIOD_NOTE, SPIKEPRINT_CAPTION, SPIKEPRINT_FOOTER } from '../content/copy';
import {
  BAND_COUNT, bandPath, batterySegments, easePoint, easeRadius, groupBoundaries, outlinePath, polar, spokeAngle, wedgePath, wedgeStart, wheelGeometry,
} from '../charts/geometry/wheel';
import { SPOKE_BY_ID, SPOKE_GROUPS } from '../content/spokes';
import { SHARE_NAME } from '../config';
import lexend400 from '../design/fonts/pdf/lexend-latin-400-normal.woff?url';
import lexend500 from '../design/fonts/pdf/lexend-latin-500-normal.woff?url';
import lexend600 from '../design/fonts/pdf/lexend-latin-600-normal.woff?url';
import bricolage700 from '../design/fonts/pdf/bricolage-grotesque-latin-700-normal.woff?url';
import { wordBand } from '../results/describe';
import { PRESET_BY_ID } from './sections';
import { formatDate, } from './SpikeprintView';
import { has, ideaGroups, wheelProfile, type SpikeprintData } from './spikeprint';
import { resolveTokens } from './tokens';

Font.register({ family: 'Lexend', fonts: [{ src: lexend400, fontWeight: 400 }, { src: lexend500, fontWeight: 500 }, { src: lexend600, fontWeight: 600 }] });
Font.register({ family: 'Bricolage', src: bricolage700, fontWeight: 700 });
Font.registerHyphenationCallback((w) => [w]);

const TOKEN_NAMES = [
  'bg', 'surface', 'ink', 'ink-muted', 'outline', 'hatch', 'on-strong', 'butter-soft',
  ...['teal', 'plum', 'tomato', 'butter'].flatMap((h) => [`${h}-strong`, `${h}-band-1`, `${h}-band-2`, `${h}-band-3`, `${h}-band-4`]),
];
type C = Record<string, string>;

const BODY = 10.5;
const LH = 1.35;

function PdfWheel({ data, c, size }: { data: SpikeprintData; c: C; size: number }) {
  const g = wheelGeometry(560);
  const wp = wheelProfile(data);
  const spokes = wp.spokes;
  const typical = spokes.map((s, i) => (s.ease === undefined ? null : easePoint(g, i, s.ease)));
  const hard = spokes.map((s, i) => (s.ease === undefined ? null : easePoint(g, i, s.hard !== undefined && s.fluctuation !== undefined ? s.hard : s.ease)));
  const bounds = groupBoundaries(spokes.map((s) => SPOKE_BY_ID[s.spokeId].group));
  const middleR = wp.middle === undefined ? undefined : easeRadius(g, wp.middle);
  return (
    <Svg width={size} height={size} viewBox="0 0 560 560">
      {spokes.map((s, i) => {
        const hue = SPOKE_BY_ID[s.spokeId].hue;
        return s.ease === undefined
          ? <Path key={s.spokeId} d={wedgePath(g, i)} fill={c.hatch} stroke={c.bg} strokeWidth={1.5} />
          : <View key={s.spokeId}>{Array.from({ length: BAND_COUNT }, (_, k) => <Path key={k} d={bandPath(g, i, k)} fill={c[`${hue}-band-${k + 1}`]} stroke={c.bg} strokeWidth={1.5} />)}</View>;
      })}
      {[0, ...bounds].map((i) => {
        const a = polar(g, g.r0, wedgeStart(g, i));
        const b = polar(g, g.R, wedgeStart(g, i));
        return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.bg} strokeWidth={3} />;
      })}
      <Circle cx={g.cx} cy={g.cy} r={g.R} fill="none" stroke={c.outline} strokeWidth={2} />
      <Circle cx={g.cx} cy={g.cy} r={g.r0} fill={c.bg} stroke={c.outline} strokeWidth={2} />
      {middleR !== undefined && <Circle cx={g.cx} cy={g.cy} r={middleR} fill="none" stroke={c['ink-muted']} strokeWidth={2} strokeDasharray="2 5" />}
      <Path d={outlinePath(hard)} fill="none" stroke={c.ink} strokeWidth={2.5} strokeDasharray="8 5" strokeLinejoin="miter" />
      {spokes.map((s, i) => s.hard !== undefined && s.fluctuation !== undefined && hard[i] && <Circle key={`h${i}`} cx={hard[i]!.x} cy={hard[i]!.y} r={5.5} fill={c.bg} stroke={c.ink} strokeWidth={2.5} />)}
      <Path d={outlinePath(typical)} fill="none" stroke={c.ink} strokeWidth={4} strokeLinejoin="miter" />
      {typical.map((p, i) => p && <Circle key={`t${i}`} cx={p.x} cy={p.y} r={6.5} fill={c.ink} />)}
      {spokes.map((s, i) => {
        const a = spokeAngle(g, i);
        const bp = polar(g, g.R + 24, a);
        const np = polar(g, g.R + 60, a);
        const filled = batterySegments(s.cost);
        const hue = SPOKE_BY_ID[s.spokeId].hue;
        return (
          <View key={`b${i}`}>
            {s.ease !== undefined && (
              <>
                <Rect x={bp.x - 12} y={bp.y - 7} width={24} height={14} rx={3} fill={c.bg} stroke={c.ink} strokeWidth={1.8} />
                {Array.from({ length: filled ?? 0 }, (_, k) => <Rect key={k} x={bp.x - 10 + k * 5.2} y={bp.y - 5} width={3.8} height={10} fill={c.ink} />)}
              </>
            )}
            <Circle cx={np.x} cy={np.y} r={19} fill={c[`${hue}-strong`]} stroke={c.outline} strokeWidth={2} />
            <Text x={np.x} y={np.y + 7} textAnchor="middle" fill={c['on-strong']} style={{ fontFamily: 'Lexend', fontWeight: 600, fontSize: 22 }}>{String(s.num)}</Text>
          </View>
        );
      })}
    </Svg>
  );
}

function Heading({ children, c }: { children: string; c: C }) {
  return <Text style={{ fontFamily: 'Bricolage', fontWeight: 700, fontSize: 13, color: c.ink, marginTop: 6, marginBottom: 2 }}>{children}</Text>;
}
function Body({ children, c, bold, muted }: { children: React.ReactNode; c: C; bold?: boolean; muted?: boolean }) {
  return <Text style={{ fontFamily: 'Lexend', fontWeight: bold ? 600 : 400, fontSize: BODY, lineHeight: LH, color: muted ? c['ink-muted'] : c.ink }}>{children}</Text>;
}
function Marked({ text, c }: { text: string; c: C }) {
  return <Text style={{ fontFamily: 'Lexend', fontSize: BODY, lineHeight: LH, color: c.ink }}>{text.split('*').map((p, i) => <Text key={i} style={{ fontWeight: i % 2 ? 600 : 400 }}>{p}</Text>)}</Text>;
}
const meterLine = (l: string, v: number) => `${l}: ${wordBand(v).toLowerCase()}`;

export function SpikeprintPdf({ data, c }: { data: SpikeprintData; c: C }) {
  const preset = PRESET_BY_ID[data.p];
  const wp = wheelProfile(data);
  const ideas = ideaGroups(data);
  const stretch = wp.spokes.filter((s) => s.ease !== undefined && (s.relLabel === 'stretch' || s.flags.length > 0));
  const wide = has(data, 'wheel');

  // Ideas fill the left column first (under the key), then continue in the right column, which usually has room.
  const hasIdeas = has(data, 'adjustments') && ideas.length > 0;
  const LEFT_IDEAS = 4;
  const ideaLines = (list: typeof ideas) => list.map((g) => <Body key={g.title} c={c}><Text style={{ fontWeight: 600 }}>{g.title.replace(/^Ideas for /, '')}: </Text>{g.items[0]}</Body>);
  const ideasLeft = hasIdeas ? (
    <>
      <Heading c={c}>Ideas that might help</Heading>
      <Body c={c} muted>Ideas to try or ask about, not instructions.</Body>
      {ideaLines(wide ? ideas.slice(0, LEFT_IDEAS) : ideas)}
    </>
  ) : null;
  const ideasRight = hasIdeas && wide && ideas.length > LEFT_IDEAS ? (
    <>
      <Heading c={c}>More ideas that might help</Heading>
      {ideaLines(ideas.slice(LEFT_IDEAS))}
    </>
  ) : null;

  const sections = (
    <>
      {has(data, 'summary') && data.sm && (
        <View style={{ marginBottom: 2 }}>{data.sm.map((s, i) => <Marked key={i} text={s} c={c} />)}</View>
      )}
      {has(data, 'stretch') && stretch.length > 0 && (
        <>
          <Heading c={c}>Stretch and variable areas</Heading>
          {stretch.some((s) => s.relLabel === 'stretch') && <Body c={c}><Text style={{ fontWeight: 600 }}>Harder than my own middle: </Text>{stretch.filter((s) => s.relLabel === 'stretch').map((s) => s.label).join(', ')}.</Body>}
          {stretch.some((s) => s.flags.includes('varies')) && <Body c={c}><Text style={{ fontWeight: 600 }}>Varies on hard days: </Text>{stretch.filter((s) => s.flags.includes('varies')).map((s) => s.label).join(', ')}.</Body>}
          {stretch.some((s) => s.flags.includes('costly')) && <Body c={c}><Text style={{ fontWeight: 600 }}>Manageable but costly: </Text>{stretch.filter((s) => s.flags.includes('costly')).map((s) => s.label).join(', ')}.</Body>}
        </>
      )}
      {has(data, 'strengths') && data.st && (
        <>
          <Heading c={c}>Strengths</Heading>
          <Body c={c}>{data.st.map((s) => s.n).join(', ')}.</Body>
          {data.st.some((s) => s.c === 'o') && <Body c={c} muted>These cost me energy often: {data.st.filter((s) => s.c === 'o').map((s) => s.n).join(', ')}.</Body>}
          {data.st.some((s) => s.c === 's') && <Body c={c} muted>These sometimes do: {data.st.filter((s) => s.c === 's').map((s) => s.n).join(', ')}.</Body>}
        </>
      )}
      {has(data, 'drivers') && data.dr && <><Heading c={c}>What gets in the way</Heading><Body c={c}>{data.dr}</Body></>}
      {has(data, 'load') && data.ld && <><Heading c={c}>What I carry</Heading>{data.ld.map((l) => <Body key={l.l} c={c}>{meterLine(l.l, l.v)}</Body>)}</>}
      {has(data, 'energy') && data.en && (
        <>
          <Heading c={c}>Energy</Heading>
          {!!data.en.d?.length && <Body c={c}><Text style={{ fontWeight: 600 }}>Drains me: </Text>{data.en.d.join(', ')}.</Body>}
          {!!data.en.r?.length && <Body c={c}><Text style={{ fontWeight: 600 }}>Recharges me: </Text>{data.en.r.join(', ')}.</Body>}
        </>
      )}
      {has(data, 'adhd') && data.ad && (
        <>
          <Heading c={c}>Patterns often linked with ADHD</Heading>
          <Body c={c} muted>Shown beside the profile, not mixed into it. Many people without ADHD recognise some of these.</Body>
          {data.ad.m.map((l) => <Body key={l.l} c={c}>{meterLine(l.l, l.v)}</Body>)}
          {!!data.ad.t?.length && <Body c={c}>I recognise: {data.ad.t.join('; ')}.</Body>}
        </>
      )}
      {has(data, 'masking') && data.mk && (
        <>
          <Heading c={c}>Adjusting how I come across</Heading>
          {data.mk.m !== undefined && <Body c={c}>{meterLine('Adjusting how I come across', data.mk.m)}</Body>}
          {data.mk.c !== undefined && <Body c={c}>{meterLine('Cost of adjusting', data.mk.c)}</Body>}
          {!!data.mk.w?.length && <Body c={c}>Where: {data.mk.w.join(', ')}.</Body>}
          {!!data.mk.y?.length && <Body c={c}>Why: {data.mk.y.join(', ')}.</Body>}
        </>
      )}
      {has(data, 'burnout') && data.bo && (
        <>
          <Heading c={c}>Hard periods</Heading>
          {data.bo.v !== undefined && <Body c={c}>{meterLine('Hard-period signs', data.bo.v)}</Body>}
          {data.bo.h && <Body c={c}>A stretch of exhaustion that rest didn’t fix: {data.bo.h.toLowerCase()}.</Body>}
          {!!data.bo.s?.length && <Body c={c}>Early signs: {data.bo.s.join(', ')}.</Body>}
          {!!data.bo.k?.length && <Body c={c}>What contributed: {data.bo.k.join(', ')}.</Body>}
        </>
      )}
      {has(data, 'interests') && data.it && (
        <>
          <Heading c={c}>Interests</Heading>
          {data.it.t && <Body c={c}>“{data.it.t}”</Body>}
          {!!data.it.k?.length && <Body c={c}>{data.it.k.join(', ')}.</Body>}
          {data.it.r && <Body c={c}>{data.it.r}</Body>}
          {data.it.c && <Body c={c}>{data.it.c}</Body>}
        </>
      )}
      {has(data, 'eating') && data.ea && <><Heading c={c}>Eating and food</Heading><Body c={c}>Patterns I described: {data.ea.join(', ')}.</Body></>}
      {has(data, 'hormones') && data.ho && <><Heading c={c}>Hormones and life stage</Heading><Body c={c}>{data.ho}</Body></>}
      {has(data, 'autonomy') && data.au && (
        <>
          <Heading c={c}>Autonomy needs</Heading>
          {data.au.v !== undefined && <Body c={c}>{meterLine('Demands feel like pressure', data.au.v)}</Body>}
          {data.au.s && <Body c={c}>Having a say in how and when I do things helps me get them done.</Body>}
          {!!data.au.f?.length && <Body c={c}>What makes demands harder: {data.au.f.join(', ')}.</Body>}
        </>
      )}
      {has(data, 'medication') && data.me && <><Heading c={c}>Medication</Heading><Body c={c}>{data.me}</Body></>}
      {has(data, 'diagnoses') && data.dx && <><Heading c={c}>Diagnoses</Heading><Body c={c}>{data.dx.join('; ')}.</Body></>}
      {has(data, 'whatHelps') && data.nh && <><Heading c={c}>What helps me</Heading><Body c={c}>{data.nh}</Body></>}
      {has(data, 'wantPeopleToKnow') && data.nk && <><Heading c={c}>What I’d like people to know</Heading><Body c={c}>{data.nk}</Body></>}
    </>
  );

  return (
    <Document title={`${SHARE_NAME}: ${preset.title}`} author={data.n ?? ''} subject={`${SHARE_NAME} made with Spikeline`} creator="Spikeline" producer="Spikeline" language="en-GB">
      <Page size="A4" wrap style={{ padding: 30, paddingBottom: 50, backgroundColor: c.bg, fontFamily: 'Lexend', fontSize: BODY, color: c.ink }}>
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Bricolage', fontWeight: 700, fontSize: 15 }}>{SHARE_NAME}</Text>
            <Body c={c} muted>{data.n ? `${data.n} · ` : ''}{formatDate(data.d)}</Body>
          </View>
          <Text style={{ fontFamily: 'Bricolage', fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{preset.title}</Text>
          {data.ex && <Body c={c} bold>Example data, not a real person’s profile</Body>}
        </View>
        {data.hp && (
          <View style={{ backgroundColor: c['butter-soft'], borderWidth: 1.2, borderColor: c.outline, borderRadius: 6, padding: 6, marginBottom: 6 }}>
            <Body c={c} bold>{HARD_PERIOD_NOTE}</Body>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {wide && (
            <View style={{ width: 240 }}>
              <PdfWheel data={data} c={c} size={240} />
              {SPOKE_GROUPS.map((g) => (
                <View key={g.id} style={{ marginTop: 3 }}>
                  {wp.spokes.filter((s) => SPOKE_BY_ID[s.spokeId].group === g.id).map((s) => (
                    <Text key={s.spokeId} style={{ fontFamily: 'Lexend', fontSize: BODY, lineHeight: 1.25, color: c.ink }}>
                      {s.num}. {s.label}{s.ease === undefined ? ': not enough answers yet' : ''}
                    </Text>
                  ))}
                </View>
              ))}
              <Text style={{ fontFamily: 'Lexend', fontSize: BODY, lineHeight: 1.3, color: c['ink-muted'], marginTop: 4 }}>{SPIKEPRINT_CAPTION}</Text>
              {ideasLeft}
            </View>
          )}
          <View style={{ flex: 1 }}>{sections}{!wide && ideasLeft}{ideasRight}</View>
        </View>
        <Text fixed style={{ position: 'absolute', left: 30, right: 30, bottom: 16, fontFamily: 'Lexend', fontSize: BODY, lineHeight: 1.3, color: c['ink-muted'] }}>{SPIKEPRINT_FOOTER}</Text>
      </Page>
    </Document>
  );
}

export async function renderPdf(data: SpikeprintData, { theme }: { theme: string; allowSecondPage: boolean }): Promise<Uint8Array<ArrayBuffer>> {
  const c = resolveTokens(theme, TOKEN_NAMES);
  const blob = await pdf(<SpikeprintPdf data={data} c={c} />).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}
