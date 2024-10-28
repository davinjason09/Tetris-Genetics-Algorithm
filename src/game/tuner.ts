import { AI } from "./ai";
import { Grid } from "./grid";
import { RandomPieceGenerator } from "./piece_generator";
import { TunerConfig, TrainConfig, Candidate } from "./../constant/Types";

export class Tuner {
  candidates: Candidate[];
  config: TunerConfig;

  constructor(config: TunerConfig) {
    this.candidates = [];
    this.config = config;
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  private normalize(candidate: Candidate): Candidate {
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

  private generateRandomCandidate(): Candidate {
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

  private sortCandidates(candidates: Candidate[]): void {
    candidates.sort((a, b) => b.fitness - a.fitness);
  }

  private computeFitness(
    candidates: Candidate[],
    trainConfig: TrainConfig,
  ): void {
    candidates.forEach(candidate => {
      const ai = new AI(candidate);
      let totalScore = 0;

      console.log(`Computing fitness for candidate: ${JSON.stringify(candidate)}`);
      for (let i = 0; i < trainConfig.gamesPerCandidate; i++) {
        const grid: Grid = new Grid(22, 10);
        const rng = new RandomPieceGenerator();
        const workingPieces = [rng.nextPiece(), rng.nextPiece()];
        let currentPiece = workingPieces[0];
        let score = 0;
        let moves = 0;

        while (
          moves++ < trainConfig.maxMovesPerGame &&
          !grid.hasExceededTop()
        ) {
          currentPiece = ai.best(grid, workingPieces)!;
          while (currentPiece.moveDown(grid));

          grid.addPiece(currentPiece);
          score += grid.clearedLines();
          workingPieces.shift();
          workingPieces.push(rng.nextPiece());
          currentPiece = workingPieces[0];
        }

        totalScore += score;
        console.log(`Game ${i + 1} score: ${score}`);
      }

      candidate.fitness = totalScore;
      console.log(`Candidate fitness: ${candidate.fitness}`);
    });
  }

  private tournamentSelection(
    candidates: Candidate[],
    k: number,
  ): [Candidate, Candidate] {
    const indices = Array.from(candidates.keys());

    let fittestIndex1: number | null = null;
    let fittestIndex2: number | null = null;

    for (let i = 0; i < k; i++) {
      const idx = indices.splice(this.randomInteger(0, indices.length), 1)[0];

      if (fittestIndex1 === null || idx < fittestIndex1) {
        fittestIndex2 = fittestIndex1;
        fittestIndex1 = idx;
      } else if (fittestIndex2 === null || idx < fittestIndex2) {
        fittestIndex2 = idx;
      }
    }

    return [candidates[fittestIndex1!], candidates[fittestIndex2!]];
  }

  private crossover(parent1: Candidate, parent2: Candidate): Candidate {
    const child = {
      heightWeight:
        parent1.fitness! * parent1.heightWeight +
        parent2.fitness! * parent2.heightWeight,
      linesWeight:
        parent1.fitness! * parent1.linesWeight +
        parent2.fitness! * parent2.linesWeight,
      holesWeight:
        parent1.fitness! * parent1.holesWeight +
        parent2.fitness! * parent2.holesWeight,
      bumpinessWeight:
        parent1.fitness! * parent1.bumpinessWeight +
        parent2.fitness! * parent2.bumpinessWeight,
      fitness: 0,
    };

    this.normalize(child);
    return child;
  }

  private mutate(candidate: Candidate, chance: number[]): void {
    const quantity = Math.random() * 0.4 - 0.2;

    if (chance[0] < this.config.mutationRate) {
      candidate.heightWeight += quantity;
    }
    if (chance[1] < this.config.mutationRate) {
      candidate.linesWeight += quantity;
    }
    if (chance[2] < this.config.mutationRate) {
      candidate.holesWeight += quantity;
    }
    if (chance[3] < this.config.mutationRate) {
      candidate.bumpinessWeight += quantity;
    }
  }

  private deleteNWeakest(
    candidates: Candidate[],
    newCandidates: Candidate[],
  ): void {
    candidates.splice(
      -newCandidates.length,
      newCandidates.length,
      ...newCandidates,
    );
    this.sortCandidates(candidates);
  }

  public tune(trainConfig: TrainConfig): void {
    for (let i = 0; i < this.config.populationSize; i++) {
      this.candidates.push(this.generateRandomCandidate());
    }

    console.log("Initial candidates:");
    for (let i = 0; i < this.candidates.length; i++) {
      console.log(`Candidate ${i}: ${JSON.stringify(this.candidates[i])}`);
    }

    console.log("Computing fitness for initial candidate...");
    this.computeFitness(this.candidates, trainConfig);

    this.sortCandidates(this.candidates);

    let count = 0;
    while (true) {
      const newCandidates: Candidate[] = [];
      for (let i = 0; i < Math.floor(this.config.populationSize * 0.3); i++) {
        const [parent1, parent2] = this.tournamentSelection(
          this.candidates,
          Math.floor(this.config.populationSize * 0.1),
        );
        const child = this.crossover(parent1, parent2);

        const mutationChance = Array.from({ length: 4 }, () => Math.random());
        this.mutate(child, mutationChance);

        this.normalize(child);
        newCandidates.push(child);
      }

      console.log(`Computing fitnesses of new candidates. (${count})`);
      this.computeFitness(newCandidates, trainConfig);
      this.deleteNWeakest(this.candidates, newCandidates);

      const totalFitness = this.candidates.reduce((sum, c) => sum + (c.fitness || 0), 0);
      console.log(`Average fitness = ${totalFitness / this.candidates.length}`);
      console.log(`Highest fitness = ${this.candidates[0].fitness} (${count})`);
      console.log(`Fittest candidate: ${JSON.stringify(this.candidates[0])} (${count})`);
      count++;
    }
  }

};
