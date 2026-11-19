import { checklist, ease, easeCost, freq, like, opts, strengthItem } from './helpers';
import type { Item } from './types';

// Item bank, Appendix A.1. Wording is copied exactly (apostrophes converted to curly).
export const coreItems: Item[] = [
  // C1 Focus
  easeCost('C1.1', 'Keeping my attention on one task I’ve chosen for an hour or more', { hardDay: true, driverSet: 'distraction', scoresInto: { spoke: 'attention' } }),
  easeCost('C1.2', 'Following two things at once, such as listening to someone while reading a message', { hardDay: true, scoresInto: { spoke: 'attention' } }),
  easeCost('C1.3', 'Getting my focus back after an unexpected interruption', { hardDay: true, scoresInto: { spoke: 'attention' } }),
  freq('C1.4', 'When I’m absorbed in something, I stop noticing hunger, the time, or people talking to me', { scoresInto: { strength: 'Deep absorption', descriptive: 'absorption' } }),
  like('C1.5', 'When a topic interests me, I go into far more depth than people around me', { scoresInto: { strength: 'Depth' } }),

  // C2 Getting started and switching
  easeCost('C2.1', 'Starting a task I’ve decided to do, when there’s no deadline and nobody prompting me', { hardDay: true, driverSet: 'unfinished', scoresInto: { spoke: 'starting' } }),
  easeCost('C2.2', 'Stopping something I’m engaged in when it’s time to do something else', { hardDay: true, scoresInto: { spoke: 'starting' } }),
  easeCost('C2.3', 'Moving from one activity to the next, for example from work to cooking a meal', { hardDay: true, scoresInto: { spoke: 'starting' } }),
  freq('C2.4', 'I want to do something but can’t get myself going, and stay stuck for 30 minutes or more', { scoresInto: { load: 'stuck' } }),
  ease('C2.5', 'Getting going when someone gives me a clear first step or does it alongside me', { scoresInto: { insight: 'gettingStarted' } }),

  // C3 Planning and time
  easeCost('C3.1', 'Breaking a big task into steps and deciding the order', { hardDay: true, scoresInto: { spoke: 'planning' } }),
  ease('C3.2', 'Judging how long a task will take', { scoresInto: { spoke: 'planning' } }),
  easeCost('C3.3', 'Arriving at appointments on time', { scoresInto: { spoke: 'planning' } }),
  ease('C3.4', 'Knowing where everyday things are, such as keys, phone or important letters', { scoresInto: { spoke: 'planning' } }),
  easeCost('C3.5', 'Keeping on top of life admin, such as bills, forms and replying to messages', { hardDay: true, driverSet: 'unfinished', scoresInto: { spoke: 'planning' } }),

  // C4 Memory and keeping up (self-rated, not a cognitive test)
  easeCost('C4.1', 'Remembering a short set of spoken instructions long enough to follow them', { hardDay: true, scoresInto: { spoke: 'memory' } }),
  easeCost('C4.2', 'Keeping up when information comes quickly, such as a fast meeting or conversation', { hardDay: true, scoresInto: { spoke: 'memory' } }),
  easeCost('C4.3', 'Doing routine tasks at the speed others expect, such as timed tests or busy shifts', { scoresInto: { spoke: 'memory' } }),
  ease('C4.4', 'Remembering to do something later that I planned earlier, such as a call at 3pm', { scoresInto: { spoke: 'memory' } }),
  ease('C4.5', 'Remembering facts and details about subjects I care about', { scoresInto: { strength: 'Memory for detail' } }),

  // C5 Talking and writing
  easeCost('C5.1', 'Saying what I mean when I’m talking with someone', { hardDay: true, scoresInto: { spoke: 'language' } }),
  easeCost('C5.2', 'Explaining my ideas in writing', { scoresInto: { spoke: 'language' } }),
  easeCost('C5.3', 'Working out what someone means when they hint, joke or don’t say it directly', { scoresInto: { spoke: 'language' } }),
  easeCost('C5.4', 'Following what someone says in a noisy place', { hardDay: true, scoresInto: { spoke: 'language' } }),
  easeCost('C5.5', 'Phone or video calls with people I don’t know', { hardDay: true, scoresInto: { spoke: 'language' } }),
  freq('C5.6', 'When I’m stressed or overloaded, I find I can’t speak, or can only say a little, for a while', { scoresInto: { load: 'overload' } }),

  // C6 Social situations: wanting versus effort (two separate scores, never combined)
  like('C6.1', 'I want friendships or close relationships in my life', { scoresInto: { descriptive: 'socialMotivation' } }),
  like('C6.2', 'I enjoy time with people I know well', { scoresInto: { descriptive: 'socialMotivation' } }),
  easeCost('C6.3', 'Knowing when it’s my turn to speak in a group conversation', { hardDay: true, driverSet: 'social', scoresInto: { spoke: 'socialEase' } }),
  easeCost('C6.4', 'Small talk with people I don’t know well', { hardDay: true, scoresInto: { spoke: 'socialEase' } }),
  easeCost('C6.5', 'Keeping in touch with friends over time, such as messaging and arranging meet-ups', { scoresInto: { spoke: 'socialEase' } }),
  ease('C6.6', 'Telling how someone feels about me from the way they act', { scoresInto: { spoke: 'socialEase' } }),
  freq('C6.7', 'After seeing people, even when I enjoyed it, I need time alone to recover', { scoresInto: { load: 'socialRecovery' } }),

  // C7 Senses
  freq('C7.1', 'Everyday sounds, such as chewing, ticking or background chatter, feel painful or impossible to tune out', { scoresInto: { load: 'sensoryOver' } }),
  freq('C7.2', 'Bright, flickering or strongly patterned light bothers me or gives me a headache', { scoresInto: { load: 'sensoryOver' } }),
  freq('C7.3', 'Some clothing textures, labels or seams are hard to put up with', { scoresInto: { load: 'sensoryOver' } }),
  freq('C7.4', 'Smells other people barely notice feel strong or make me feel unwell', { scoresInto: { load: 'sensoryOver' } }),
  freq('C7.5', 'I don’t notice pain, heat or cold until it’s severe or someone points it out', { scoresInto: { load: 'sensoryUnder' } }),
  freq('C7.6', 'I misjudge where my body is, for example bumping into door frames or using too much force', { scoresInto: { load: 'sensoryUnder' } }),
  freq('C7.7', 'I look for strong sensations, such as deep pressure, loud music, spinning or strong flavours, to feel settled', { scoresInto: { load: 'sensorySeeking' } }),
  easeCost('C7.8', 'Spending an hour in a busy place such as a supermarket, station or open-plan office', { hardDay: true, scoresInto: { spoke: 'busyPlaces' } }),
  checklist('C7.9', 'Which senses affect you most?', {
    example: 'Choose all that apply. This isn’t scored.',
    options: opts('Sound', 'Light', 'Touch', 'Smell', 'Taste', 'Temperature', 'Movement or balance', 'Inner body signals'),
    scoresInto: { descriptive: 'modality' },
  }),

  // C8 Body signals and naming feelings
  freq('C8.1', 'I don’t realise I’m hungry, thirsty or need the toilet until it’s urgent', { scoresInto: { load: 'bodySignals' } }),
  freq('C8.2', 'I notice signs in my body, such as a racing heart, tears or a tight stomach, without knowing what feeling they mean', { scoresInto: { load: 'bodySignals' } }),
  easeCost('C8.3', 'Putting what I feel into words', { scoresInto: { spoke: 'feelings' } }),
  ease('C8.4', 'Telling whether I’m anxious, angry, tired or physically unwell', { scoresInto: { spoke: 'feelings' } }),
  freq('C8.5', 'I only work out how I felt about something hours or days later', { scoresInto: { load: 'bodySignals' } }),

  // C9 Overload and calming down
  freq('C9.1', 'Pressure builds during the day and comes out later, often at home, as tears, anger or withdrawing', { driverSet: 'overwhelm', driverTrigger: 'freq', scoresInto: { load: 'overload' }, signpost: true }),
  freq('C9.2', 'I get so overloaded that I can’t think, speak or respond for a while', { scoresInto: { load: 'overload' }, signpost: true }),
  // REVIEW: wording needs co-design review for stigma.
  freq('C9.3', 'I get so overloaded that I lose control of how I react', { scoresInto: { load: 'overload' }, signpost: true }),
  freq('C9.4', 'My frustration flares up fast and strongly, then fades within minutes', { scoresInto: { adhd: 'emotionalFlash' }, signpost: true }),
  easeCost('C9.5', 'Calming myself down after something upsetting', { hardDay: true, scoresInto: { spoke: 'feelings' }, signpost: true }),

  // C10 Predictability and change
  easeCost('C10.1', 'Coping when plans change at short notice', { hardDay: true, driverSet: 'change', scoresInto: { spoke: 'change' } }),
  easeCost('C10.2', 'Doing an unfamiliar task without clear instructions', { scoresInto: { spoke: 'change' } }),
  freq('C10.3', 'I need to know the details of an event (where, when, who, how long) before I can feel settled about it', { scoresInto: { load: 'predictability' } }),
  freq('C10.4', 'I do things in a set order or routine, and feel unsettled if it’s interrupted', { scoresInto: { load: 'predictability' } }),
  like('C10.5', 'Routines and familiar patterns help me get through my day', { scoresInto: { strength: 'Routines that work' } }),

  // C11 Movement and hand skills (no hard-day ratings)
  ease('C11.1', 'Handwriting that is quick and easy for others to read', { scoresInto: { spoke: 'movement' } }),
  easeCost('C11.2', 'Learning physical skills such as driving, a sport or dance steps', { scoresInto: { spoke: 'movement' } }),
  ease('C11.3', 'Fiddly hand tasks, such as buttons, opening packaging or using small tools', { scoresInto: { spoke: 'movement' } }),
  freq('C11.4', 'I trip, drop things or knock into furniture', { scoresInto: { load: 'bumps' } }),

  // C12 Reading, spelling and numbers (no hard-day ratings)
  easeCost('C12.1', 'Reading a long document and keeping hold of the meaning', { scoresInto: { spoke: 'literacy' } }),
  ease('C12.2', 'Spelling accurately without a spellchecker', { scoresInto: { spoke: 'literacy' } }),
  ease('C12.3', 'Everyday sums in my head, such as checking change or splitting a bill', { scoresInto: { spoke: 'literacy' } }),
  ease('C12.4', 'Making sense of tables, charts or timetables', { scoresInto: { spoke: 'literacy' } }),
  easeCost('C12.5', 'Reading aloud to other people', { scoresInto: { spoke: 'literacy' } }),

  // C13 Strengths and thinking style: LIKE, then "Does this ever cost you or cause problems?"
  strengthItem('C13.1', 'I notice small details, errors or changes that others miss', { strengthName: 'Eye for detail', scoresInto: { strength: 'Eye for detail' } }),
  strengthItem('C13.2', 'I spot patterns, rules or connections in information', { strengthName: 'Pattern spotting', scoresInto: { strength: 'Pattern spotting' } }),
  strengthItem('C13.3', 'I build deep, detailed knowledge in areas that interest me', { strengthName: 'Deep expertise', scoresInto: { strength: 'Deep expertise' } }),
  strengthItem('C13.4', 'I come up with original ideas or unusual ways to solve problems', { strengthName: 'Original thinking', scoresInto: { strength: 'Original thinking' } }),
  strengthItem('C13.5', 'I keep working on a problem long after other people would stop', { strengthName: 'Persistence', scoresInto: { strength: 'Persistence' } }),
  strengthItem('C13.6', 'I can picture objects, routes or designs clearly in my mind', { strengthName: 'Visual thinking', scoresInto: { strength: 'Visual thinking' } }),
  strengthItem('C13.7', 'I say what I honestly think, even when others would soften it', { strengthName: 'Honesty and directness', scoresInto: { strength: 'Honesty and directness' } }),
  strengthItem('C13.8', 'Unfairness, whether to me or to others, affects me strongly and stays with me', { strengthName: 'Strong sense of fairness', scoresInto: { strength: 'Strong sense of fairness' } }),
  strengthItem('C13.9', 'Once I commit to a person or project, I’m loyal and reliable', { strengthName: 'Loyalty', scoresInto: { strength: 'Loyalty' } }),

  // C14 Energy and recovery (a reflection, not a validated measure)
  freq('C14.1', 'At the end of a usual working, studying or caring day, I still have energy for things I enjoy', { scoresInto: { descriptive: 'energyLeft' } }),
  freq('C14.2', 'After a demanding event, such as a wedding, conference or long journey, I need a day or more to recover', { scoresInto: { load: 'recoveryAfterEvents' } }),
  checklist('C14.3', 'What drains you?', {
    example: 'Choose all that apply.',
    options: opts('Talking to people', 'Noise, light or crowds', 'Being misunderstood or criticised', 'Not knowing what will happen', 'Hiding how I really am', 'Switching between tasks', 'Paperwork and admin', 'Travel', 'Physical pain or illness'),
    allowOther: true,
    scoresInto: { descriptive: 'drains' },
  }),
  checklist('C14.4', 'What recharges you?', {
    example: 'Choose all that apply.',
    options: opts('Time alone', 'My interests', 'Movement or exercise', 'Stimming or repetitive movement', 'Nature or outdoors', 'Quiet and dim spaces', 'Time with trusted people', 'Sleep'),
    allowOther: true,
    scoresInto: { descriptive: 'recharges' },
  }),
];

