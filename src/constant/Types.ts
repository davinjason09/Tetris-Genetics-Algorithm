export type Candidate = {
  heightWeight: number;
  linesWeight: number;
  holesWeight: number;
  bumpinessWeight: number;
  fitness: number;
};

export type TunerConfig = {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
};

export type TrainConfig = {
  gamesPerCandidate: number;
  maxMovesPerGame: number;
};
