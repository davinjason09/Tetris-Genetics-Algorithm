import { Candidate, GAConfig } from "../constant/Types";

export class Genome {
  config: GAConfig;

  constructor(config: GAConfig) {
    this.config = config;
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public normalize(candidate: Candidate): Candidate {
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

  public createPopulation(): Candidate[] {
    const candidates: Candidate[] = [];
    const size = this.config.populationSize;

    for (let i = 0; i < size; i++) {
      candidates.push(this.generateRandomCandidate());
    }

    return candidates;
  }

  public sortCandidates(candidates: Candidate[]): void {
    candidates.sort((a, b) => b.fitness - a.fitness);
  }

  public tournamentSelection(
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

  public crossover(parent1: Candidate, parent2: Candidate): Candidate {
    const CROSSOVER_BIAS = 1; // prevent multiplicaiton by 0
    const child = {
      heightWeight:
        (parent1.fitness! + CROSSOVER_BIAS) * parent1.heightWeight +
        (parent2.fitness! + CROSSOVER_BIAS) * parent2.heightWeight,
      linesWeight:
        (parent1.fitness! + CROSSOVER_BIAS) * parent1.linesWeight +
        (parent2.fitness! + CROSSOVER_BIAS) * parent2.linesWeight,
      holesWeight:
        (parent1.fitness! + CROSSOVER_BIAS) * parent1.holesWeight +
        (parent2.fitness! + CROSSOVER_BIAS) * parent2.holesWeight,
      bumpinessWeight:
        (parent1.fitness! + CROSSOVER_BIAS) * parent1.bumpinessWeight +
        (parent2.fitness! + CROSSOVER_BIAS) * parent2.bumpinessWeight,
      fitness: 0,
    };

    this.normalize(child);
    return child;
  }

  public mutate(candidate: Candidate): void {
    const mutationRate = this.config.mutationRate;
    const mutationStep = this.config.mutationStep;
    const quantity = Math.random() * (mutationStep * 2) - mutationStep;

    if (Math.random() < mutationRate) {
      candidate.heightWeight += quantity;
    }
    if (Math.random() < mutationRate) {
      candidate.linesWeight += quantity;
    }
    if (Math.random() < mutationRate) {
      candidate.holesWeight += quantity;
    }
    if (Math.random() < mutationRate) {
      candidate.bumpinessWeight += quantity;
    }
  }

  public deleteNWeakest(
    candidates: Candidate[],
    newCandidates: Candidate[],
  ): void {
    candidates.splice(
      -newCandidates.length,
      newCandidates.length,
      ...newCandidates,
    );
  }
}
