export type Candidate = {
  heightWeight: number;
  linesWeight: number;
  holesWeight: number;
  bumpinessWeight: number;
  fitness: number;
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
