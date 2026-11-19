// A single polite live region. Components call announce(); focus never moves.
type Listener = (message: string) => void;
let listener: Listener | null = null;

export function registerAnnouncer(fn: Listener | null) {
  listener = fn;
}

export function announce(message: string) {
  listener?.(message);
}
