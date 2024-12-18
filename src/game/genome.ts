import { Candidate, GAConfig } from "../constant/Types";

export class Genome {
  private config: GAConfig;

  constructor(config: GAConfig) {
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

  public createPopulation(): Candidate[] {
    return Array.from({ length: this.config.populationSize }, () => this.generateRandomCandidate());
  }

    for (let i = 0; i < size; i++) {
      candidates.push(this.generateRandomCandidate());
    }

    return candidates;
  }

  private sortCandidates(candidates: Candidate[]): void {
    candidates.sort((a, b) => b.fitness - a.fitness);
  }

  private tournamentSelection(candidates: Candidate[], k: number): [Candidate, Candidate] {
    const selected: Candidate[] = new Array(k);

    for (let i = 0; i < k; i++) {
      selected[i] = candidates[this.randomInteger(0, candidates.length)];
    }

    selected.sort((a, b) => b.fitness! - a.fitness!);
    return [selected[0], selected[1]];
  }

  private crossover(parent1: Candidate, parent2: Candidate): Candidate {
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

    return this.normalize(child);
  }

  private mutate(candidate: Candidate): void {
    const { mutationRate, mutationStep } = this.config;

    const mutateValue = () => Math.random() * (mutationStep * 2) - mutationStep;

    if (Math.random() < mutationRate) candidate.heightWeight += mutateValue();
    if (Math.random() < mutationRate) candidate.linesWeight += mutateValue();
    if (Math.random() < mutationRate) candidate.holesWeight += mutateValue();
    if (Math.random() < mutationRate) candidate.bumpinessWeight += mutateValue();

    this.normalize(candidate);
  }

  private replaceWeakest(candidates: Candidate[], newCandidates: Candidate[]): void {
    candidates.splice(-newCandidates.length, newCandidates.length, ...newCandidates);
  }
}
