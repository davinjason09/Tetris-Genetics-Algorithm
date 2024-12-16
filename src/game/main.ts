import { GAConfig } from "../constant/Types";
import { Game } from "./game";

const config: GAConfig = {
  generations: 25,
  populationSize: 10,
  selectionSize: 0.1,
  mutationRate: 0.05,
  mutationStep: 0.2,
  deletionRate: 0.3,
};

const game = new Game(config);
game.Init();
