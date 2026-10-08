import type { UnitDef } from '../../core/types';
import { g1PackNumbers } from './g1-pack-number';
import { g1PackWorld } from './g1-pack-world';

export const g1Pack: UnitDef[] = [...g1PackNumbers, ...g1PackWorld];
