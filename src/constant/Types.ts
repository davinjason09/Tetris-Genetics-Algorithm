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

export type GAConfig = {
  generations: number;
  populationSize: number;
  selectionSize: number;
  mutationRate: number;
  mutationStep: number;
  deletionRate: number;
};

export type GameConfig = {
  gamesPerCandidate: number;
  maxMovesPerGame: number;
};
