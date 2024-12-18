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

  private findBestPlacement(
    grid: Grid,
    workingPieces: Piece[],
    workingPieceIndex: number,
  ): { piece: Piece | null; score: number | null } {
    if (workingPieceIndex < 0 || workingPieceIndex >= workingPieces.length) {
      throw new Error("Invalid working piece index");
    }

    const currentPiece = workingPieces[workingPieceIndex];
    let bestPiece: Piece | null = null;
    let bestScore: number | null = null;

    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedPiece = currentPiece.clone();

      for (let i = 0; i < rotation; i++) {
        rotatedPiece.rotate(grid);
      }

      // Move piece to the leftmost position
      while (rotatedPiece.moveLeft(grid));

      while (grid.valid(rotatedPiece)) {
        const piecePlacement = rotatedPiece.clone();

        // Move piece down as far as possible
        while (piecePlacement.moveDown(grid));

        const simulatedGrid = grid.cloneGrid();
        simulatedGrid.addPiece(piecePlacement);

        let score: number | null = null;
        if (workingPieceIndex === workingPieces.length - 1) {
          score = this.evaluateGrid(simulatedGrid);
        } else {
          score = this.findBestPlacement(
            simulatedGrid,
            workingPieces,
            workingPieceIndex + 1,
          ).score;
        }

        if (score! > bestScore! || bestScore === null) {
          bestScore = score;
          bestPiece = rotatedPiece.clone();
        }

        // Move piece to the right
        rotatedPiece.column++;
      }
    }

    return { piece: bestPiece, score: bestScore };
  }

  public bestMove(grid: Grid, workingPieces: Piece[]): Piece | null {
    const result = this.findBestPlacement(grid, workingPieces, 0);
    return result.piece;
  }
}
