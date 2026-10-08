import type { UnitDef } from '../../core/types';
import { g4PackNumbers } from './g4-pack-numbers';
import { g4PackWorld } from './g4-pack-world';

export const g4Pack: UnitDef[] = [...g4PackNumbers, ...g4PackWorld];
