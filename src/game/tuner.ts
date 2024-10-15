
class Tuner {
  candidates: Candidate[];
  config: TunerConfig;

  constructor(config: TunerConfig) {
    this.candidates = [];
    this.config = config;
  }

  normalize(candidate: Candidate): Candidate {
    const norm = Math.sqrt(
      candidate.heightWeight ** 2 +
      candidate.linesWeight ** 2 +
      candidate.holesWeight ** 2 +
      candidate.bumpinessWeight ** 2,
    );

    candidate.heightWeight /= norm;
    candidate.linesWeight /= norm;
    candidate.holesWeight /= norm;
    candidate.bumpinessWeight /= norm;

    return candidate;
  }

  generateRandomCandidate(): Candidate {
    const candidate = {
      heightWeight: Math.random() * 2 - 1,
      linesWeight: Math.random() * 2 - 1,
      holesWeight: Math.random() * 2 - 1,
      bumpinessWeight: Math.random() * 2 - 1,
      fitness: 0,
    };

    this.normalize(candidate);
    return candidate;
  }

  sortCandidates(candidates: Candidate[]): void {
    candidates.sort((a, b) => b.fitness - a.fitness);
  }

  computeFitness(
    candidates: Candidate[],
    trainConfig: TrainConfig
  ) {
    candidates.forEach(candidate => {
      const ai = new AI(candidate);
      let totalScore = 0;

      for (let i = 0; i < trainConfig.gamesPerCandidate; i++) {
        const grid = new Grid(22, 10);
        const rng = new RandomPieceGenerator();
        const workingPieces = [rng.nextPiece(), rng.nextPiece()];
        let currentPiece = workingPieces[0];
        let score = 0;
        let moves = 0;

        while ((moves++) < trainConfig.maxMovesPerGame && !grid.hasExceededTop()) {
          currentPiece = ai.best(grid, workingPieces);
          while (currentPiece.moveDown(grid));

          grid.addPiece(currentPiece);
          score += grid.clearedLines();
          workingPieces.shift();
          workingPieces.push(rng.nextPiece());
          currentPiece = workingPieces[0];
        }

        totalScore += score;
      }

      candidate.fitness = totalScore;
    });
  }

  tune(trainConfig: TrainConfig) {
    for (let i = 0; i < this.config.populationSize; i++) {
      this.candidates.push(this.generateRandomCandidate());
    }

    console.log("Computing fitness for initial candidate...");
    this.computeFitness(
      this.candidates,
      trainConfig
    );

    this.sortCandidates(this.candidates);

  }
};
