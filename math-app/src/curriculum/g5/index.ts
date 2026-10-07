import type { GradeDef } from '../../core/types';
import { cargoHold } from './cargo-hold';
import { codes } from './codes';
import { decimalDock } from './decimal-dock';
import { engineRoom } from './engine-room';
import { fractionReactor } from './fraction-reactor';
import { fuelLab } from './fuel-lab';
import { gravityLab } from './gravity-lab';
import { missions } from './missions';
import { starMap } from './star-map';

export const g5: GradeDef[] = [
  {
    id: 'g5',
    title: 'Grade 5',
    ages: '10–12',
    units: [codes, decimalDock, fuelLab, engineRoom, fractionReactor, gravityLab, cargoHold, starMap, missions],
  },
];
