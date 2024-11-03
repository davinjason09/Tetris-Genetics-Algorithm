export type Candidate = {
  heightWeight: number;
  linesWeight: number;
  holesWeight: number;
  bumpinessWeight: number;
  fitness: number;
};

export type TunerConfig = {
  generations: number;
  populationSize: number;
  mutationRate: number;
  mutationStep: number;
  patience: number;
};

export type TrainConfig = {
  gamesPerCandidate: number;
  maxMovesPerGame: number;
};
