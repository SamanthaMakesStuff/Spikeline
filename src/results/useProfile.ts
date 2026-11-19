import { useMemo } from 'react';
import { computeProfile } from '../scoring/profile';
import { useStore } from '../storage/store';

export function useProfile() {
  const answers = useStore((s) => s.data.answers);
  return useMemo(() => computeProfile(answers), [answers]);
}
