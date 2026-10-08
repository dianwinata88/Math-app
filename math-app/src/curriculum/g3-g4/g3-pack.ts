import type { UnitDef } from '../../core/types';
import { g3PackNumbers } from './g3-pack-numbers';
import { g3PackWorld } from './g3-pack-world';

export const g3Pack: UnitDef[] = [...g3PackNumbers, ...g3PackWorld];
