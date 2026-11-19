import type { Lens, SpokeId } from './items/types';

// REVIEW: all adjustment wording needs co-design review before launch.
export interface Idea { work: string; everyday: string }

export const SPOKE_IDEAS: Record<SpokeId, Idea[]> = {
  attention: [
    { work: 'A quiet workspace or noise-cancelling headphones, and fewer interruptions during focus time', everyday: 'Protect blocks of quiet time and turn off notifications.' },
    { work: 'One task at a time; avoid asking me to listen and read at once', everyday: 'Do one thing at a time where you can.' },
    { work: 'A short note of where I was when I’m interrupted', everyday: 'Leave yourself a “where I was” note before stopping.' },
  ],
  starting: [
    { work: 'A clear first step and a start time agreed with my manager', everyday: 'Write down just the first tiny step.' },
    { work: 'Body doubling or a check-in at the start of tasks', everyday: 'Work alongside someone, in person or online.' },
    { work: 'Warning before I need to switch tasks, and transition time between meetings', everyday: 'Set a 10-minute “wrap up” alarm before switching.' },
  ],
  planning: [
    { work: 'Written task lists with priorities and deadlines', everyday: 'Use one list or app, with the next action visible.' },
    { work: 'Reminders for appointments and deadlines', everyday: 'Calendar alerts at 1 day and 1 hour before.' },
    { work: 'Help breaking large projects into stages', everyday: 'Ask someone to help split big jobs into steps.' },
  ],
  memory: [
    { work: 'Instructions in writing as well as spoken', everyday: 'Ask people to send key details by message.' },
    { work: 'Agendas before meetings and notes after', everyday: 'Ask for the plan in advance.' },
    { work: 'Extra time for timed tasks where possible', everyday: 'Allow extra time and don’t rush yourself.' },
  ],
  language: [
    { work: 'Questions sent in advance; time to answer in writing', everyday: 'Say “Can I get back to you on that?”' },
    { work: 'Direct, literal instructions with no hints', everyday: 'Ask people to say exactly what they mean.' },
    { work: 'Email or chat instead of phone calls with unfamiliar people', everyday: 'Use text-based contact where you can.' },
  ],
  socialEase: [
    { work: 'Optional rather than expected social events', everyday: 'It’s OK to leave early or skip.' },
    { work: 'Clear turn-taking in meetings (agenda, chairing, hand-raise)', everyday: 'Agree signals with friends in groups.' },
    { work: 'Recovery time after heavy people days', everyday: 'Plan quiet time after social plans.' },
  ],
  feelings: [
    { work: 'A quiet space I can use to reset, no questions asked', everyday: 'Know your nearest quiet spot.' },
    { work: 'Agreed signal for “I need a break”', everyday: 'Agree a simple signal with people close to you.' },
    { work: 'Time to process before responding to difficult news', everyday: 'It’s OK to say “I need time to think about this.”' },
  ],
  busyPlaces: [
    { work: 'Quieter desk, flexible hours or working from home on busy days', everyday: 'Shop or travel at quiet times.' },
    { work: 'Permission to wear headphones, sunglasses or a cap', everyday: 'Carry ear defenders or sunglasses.' },
  ],
  change: [
    { work: 'Advance notice of changes, and the reason for them', everyday: 'Ask for plans as early as possible.' },
    { work: 'Clear written expectations for new tasks', everyday: 'Ask for an example of what “done” looks like.' },
    { work: 'A named person to ask when things change', everyday: 'Have a go-to person for questions.' },
  ],
  movement: [
    { work: 'Typing instead of handwriting; tools that are easier to grip', everyday: 'Use voice notes or typing.' },
    { work: 'Extra time and practice for physical tasks', everyday: 'Learn new physical skills in small steps.' },
  ],
  literacy: [
    { work: 'Spellcheck, text-to-speech and readable fonts', everyday: 'Use read-aloud and spellcheck tools.' },
    { work: 'Summaries of long documents; calculators allowed', everyday: 'Ask for the key points first.' },
  ],
};

export const LENS_IDEAS: Record<Lens, Idea> = {
  A: { work: 'Reduce sensory load; give clear and predictable plans', everyday: 'Plan the senses side of your day.' },
  D: { work: 'Short deadlines, variety, and making tasks more interesting', everyday: 'Add novelty, timers or a reward.' },
  S: { work: 'Fewer demands at once; feedback given privately and kindly', everyday: 'Ask for feedback in writing.' },
  W: { work: 'Review workload; build in recovery time', everyday: 'Look after energy first; this may be a hard period.' },
};

export const SENSE_IDEAS: Record<string, string> = {
  sound: 'Sound: headphones, a quiet room.',
  light: 'Light: a desk away from windows, lights dimmed, screen filters.',
  touch: 'Touch: flexibility about uniform or clothing.',
  smell: 'Smell: a fragrance-free space.',
  temperature: 'Temperature: control over heating, fans or layers.',
};

export const AUTONOMY_IDEA: Idea = {
  work: 'Offer choices about how and when; explain the reason for requests; frame tasks collaboratively',
  everyday: 'Turn “have to” into “choose to” where you can.',
};

export const IDEAS_DISCLAIMER = 'Ideas to try or ask about, not instructions.';
