import { Candidate } from '@/constant/Types';
import { Grid } from './grid';
import { Piece } from './piece';

export class AI {
  private heightWeight: number;
  private linesWeight: number;
  private holesWeight: number;
  private bumpinessWeight: number;

  constructor(weights: Candidate) {
    this.heightWeight = weights.heightWeight;
    this.linesWeight = weights.linesWeight;
    this.holesWeight = weights.holesWeight;
    this.bumpinessWeight = weights.bumpinessWeight;
  }

  private evaluateGrid(grid: Grid): number {
    const aggregateHeight = grid.calculateAggregateHeight();
    const completeLines = grid.calculateCompleteLines();
    const holes = grid.calculateHoles();
    const bumpiness = grid.calculateBumpiness();

    return (
      this.heightWeight * aggregateHeight +
      this.linesWeight * completeLines +
      this.holesWeight * holes +
      this.bumpinessWeight * bumpiness
    );
  }

  private findOptimalPlacement(
    grid: Grid,
    workingPieces: Piece[],
    pieceIndex: number,
  ): { piece: Piece | null; score: number } {
    if (pieceIndex >= workingPieces.length) {
      return { piece: null, score: this.evaluateGrid(grid) };
    }

    const currentPiece = workingPieces[pieceIndex];
    let bestPiece: Piece | null = null;
    let bestScore = -Infinity;

    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedPiece = currentPiece.clone();

      for (let i = 0; i < rotation; i++) {
        rotatedPiece.rotate(grid);
      }

      while (rotatedPiece.moveLeft(grid));

      while (grid.isValidMove(rotatedPiece)) {
        const piecePlacement = rotatedPiece.clone();

        while (piecePlacement.moveDown(grid));

        const simulationGrid = grid.cloneGrid();
        simulationGrid.addPiece(piecePlacement);
        const score =
          pieceIndex === workingPieces.length - 1
            ? this.evaluateGrid(simulationGrid)
            : this.findOptimalPlacement(simulationGrid, workingPieces, pieceIndex + 1).score;

        if (score > bestScore) {
          bestScore = score;
          bestPiece = rotatedPiece.clone();
        }

        rotatedPiece.column++;
      }
    }

    return { piece: bestPiece, score: bestScore };
  }

  public bestMove(grid: Grid, workingPieces: Piece[]): Piece | null {
    const result = this.findOptimalPlacement(grid, workingPieces, 0);
    return result.piece;
  }
}
