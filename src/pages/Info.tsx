import { Link } from 'react-router-dom';
import { SupportContent } from '../app/SupportPanel';
import { usePageTitle } from '../app/usePageTitle';
import { APP_NAME, SHARE_NAME } from '../config';
import { GLOSSARY, IPSATIVE_EXPLAINER, NOT_DIAGNOSTIC } from '../content/copy';
import { SIGNPOSTING_LAST_VERIFIED } from '../content/signposting';

export function Support() {
  usePageTitle('Support now');
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>Support now</h1>
      <SupportContent />
      <p className="small muted">Last checked {SIGNPOSTING_LAST_VERIFIED}.</p>
    </div>
  );
}

// VERIFY links and wording before launch. Rules differ across England, Wales, Scotland and Northern Ireland.
export function NextSteps() {
  usePageTitle('Next steps');
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>Next steps</h1>
      <p className="lead">{APP_NAME} can’t tell you whether you are autistic or have ADHD. If you want to find out more, these are some ways to take it further.</p>

      <section className="stack" aria-labelledby="gp">
        <h2 id="gp" style={{ fontSize: '1.5rem' }}>Talking to your GP</h2>
        <p className="prose">You can ask your GP about an NHS assessment for autism or ADHD. Many people find it easier to bring notes. Your {SHARE_NAME} can be a starting point for that conversation.</p>
        <ul className="prose stack-sm" style={{ paddingLeft: '1.2rem' }}>
          <li>Say what is hard, how often, and what it costs you.</li>
          <li>Give a few examples from the last few months, and from childhood if you can.</li>
          <li>It’s fine to bring someone with you or write things down first.</li>
          <li>In England you may be able to choose an assessment provider (called “Right to Choose”). Other UK nations work differently.</li>
        </ul>
        <p>
          <a href="https://www.nhs.uk/conditions/autism/getting-diagnosed/" rel="noopener noreferrer">NHS: getting an autism assessment</a>{' · '}
          <a href="https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/diagnosis/" rel="noopener noreferrer">NHS: getting an ADHD assessment</a>
        </p>
      </section>

      <section className="stack" aria-labelledby="work">
        <h2 id="work" style={{ fontSize: '1.5rem' }}>At work</h2>
        <p className="prose">You can ask your employer for changes that help, called reasonable adjustments. You don’t need a diagnosis to ask. A workplace needs assessment looks at what would help you do your job.</p>
        <p className="prose">Access to Work is a UK government scheme that can pay for support at work, such as equipment or a coach. You can apply yourself.</p>
        <p><a href="https://www.gov.uk/access-to-work" rel="noopener noreferrer">GOV.UK: Access to Work</a></p>
      </section>

      <p><Link to="/hub" className="btn">Back to sections</Link></p>
    </div>
  );
}

export function AboutTool() {
  usePageTitle('How this works');
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>How this works</h1>
      <section className="stack" aria-labelledby="what">
        <h2 id="what" style={{ fontSize: '1.5rem' }}>What {APP_NAME} does</h2>
        <p className="prose">You answer questions about the last 3 months at your own pace. {APP_NAME} shows where each area is easier or harder for you, what it costs in energy, and how it changes on hard days.</p>
        <p className="prose">{IPSATIVE_EXPLAINER}</p>
      </section>
      <section className="stack" aria-labelledby="scoring">
        <h2 id="scoring" style={{ fontSize: '1.5rem' }}>How your profile is made</h2>
        <ul className="prose stack-sm" style={{ paddingLeft: '1.2rem' }}>
          <li>Each area is the average of your answers to its questions, shown from 0 to 100. Questions you mark “Doesn’t apply” or skip are left out, never counted as zero.</li>
          <li>“Your middle” is the average of your own areas. An area is a relative strength if it is 15 or more above your middle, and a stretch area if it is 15 or more below. That 15 is a rule of thumb to make the chart easy to read. It isn’t a scientific cut-off.</li>
          <li>Things you experience (like sensory load or overload) are shown separately from how easy things are. They are never put on the same scale.</li>
          <li>There is no total score, no likelihood of any condition, and no comparison with other people.</li>
        </ul>
      </section>
      <section className="stack" aria-labelledby="limits">
        <h2 id="limits" style={{ fontSize: '1.5rem' }}>What it can’t do</h2>
        <p className="prose">The questions are new. They haven’t been tested for reliability, and they haven’t been checked in a research study. They were written from published research on autistic and ADHD adults and need review by people with lived experience.</p>
        <div className="callout"><p className="prose">{NOT_DIAGNOSTIC}</p></div>
      </section>
      <section className="stack" aria-labelledby="gloss">
        <h2 id="gloss" style={{ fontSize: '1.5rem' }}>Words we use</h2>
        <dl className="stack-sm prose">
          {GLOSSARY.map((g) => (
            <div key={g.term}><dt style={{ fontWeight: 600 }}>{g.term}</dt><dd style={{ margin: 0 }}>{g.meaning}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function Privacy() {
  usePageTitle('Privacy');
  return (
    <div className="page page-narrow" style={{ marginInline: 0 }}>
      <h1>Privacy</h1>
      <section className="stack" aria-labelledby="stored">
        <h2 id="stored" style={{ fontSize: '1.5rem' }}>What is stored, and where</h2>
        <p className="prose">Your answers, notes and settings are stored in this browser, on this device. They are never sent to a server. {APP_NAME} has no accounts, no analytics and no cookies, and it doesn’t load anything from other websites.</p>
        <p className="prose">Because the answers live in this browser, private browsing, clearing your browser data or using a different device will lose them. Save a backup file now and then. A backup is your full set of answers. Keep it to yourself.</p>
      </section>
      <section className="stack" aria-labelledby="share">
        <h2 id="share" style={{ fontSize: '1.5rem' }}>Sharing a {SHARE_NAME}</h2>
        <p className="prose">A {SHARE_NAME} contains only the summary sections you choose, never your raw answers. A private link holds that summary inside the link itself. We don’t store it anywhere, so we can’t delete it. Only send it to people you trust.</p>
      </section>
      <section className="stack" aria-labelledby="delete-h">
        <h2 id="delete-h" style={{ fontSize: '1.5rem' }}>Deleting everything</h2>
        <p className="prose">You can delete everything from this device in <Link to="/settings#delete">Settings</Link>. If you’re on a shared computer, do this before you leave.</p>
      </section>
    </div>
  );
}
