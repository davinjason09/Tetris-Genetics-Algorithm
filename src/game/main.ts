import { GAConfig } from '../constant/Types';
import { TetrisGame } from './game';

const config: GAConfig = {
  generations: 25,
  populationSize: 15,
  selectionSize: 0.2,
  mutationRate: 0.05,
  mutationStep: 0.2,
  deletionRate: 0.3,
};

const game = new TetrisGame(config);
game.Init();
