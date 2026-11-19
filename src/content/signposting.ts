// VERIFY BEFORE LAUNCH AND EVERY 6 MONTHS. Numbers and wording below have not been checked by the build.
export const SIGNPOSTING_LAST_VERIFIED = '2026-11-18';

export interface SupportService {
  id: string;
  name: string;
  what: string;
  phone?: { label: string; tel: string }[];
  href?: string;
  note?: string;
}

export const SUPPORT_SERVICES: SupportService[] = [
  { id: 'emergency', name: 'Emergency', what: 'Call 999 if you’re in danger or might act on thoughts of harming yourself.', phone: [{ label: '999', tel: '999' }] },
  { id: 'samaritans', name: 'Samaritans', what: 'Free, any time of day or night.', phone: [{ label: '116 123', tel: '116123' }] },
  // VERIFY: exact option wording for England, Wales and Scotland.
  { id: 'nhs111', name: 'NHS 111', what: 'For urgent mental health help, call 111 and choose the mental health option.', phone: [{ label: '111', tel: '111' }] },
  { id: 'beat', name: 'Beat (eating difficulties)', what: 'Adult helpline.', phone: [{ label: 'England 0808 801 0677', tel: '08088010677' }, { label: 'Wales 0808 801 0433', tel: '08088010433' }] },
];

export const SUPPORT_INLINE = {
  general: { title: 'Need to talk to someone?', body: 'These questions can bring things up. Support is always one tap away.' },
  eating: { title: 'Support with eating', body: 'Beat has a helpline for adults with eating difficulties.' },
  eatingProminent: { title: 'Please think about talking to someone', body: 'Beat is a UK charity for people with eating difficulties. You can call their helpline.' },
};
