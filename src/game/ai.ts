import { Grid } from "./grid";
import { Piece } from "./piece";

interface Weights {
  heightWeight: number;
  linesWeight: number;
  holesWeight: number;
  bumpinessWeight: number;
}

export class AI {
  heightWeight: number;
  linesWeight: number;
  holesWeight: number;
  bumpinessWeight: number;

  constructor(weights: Weights) {
    this.heightWeight = weights.heightWeight;
    this.linesWeight = weights.linesWeight;
    this.holesWeight = weights.holesWeight;
    this.bumpinessWeight = weights.bumpinessWeight;
  }

  private _best(
    grid: Grid,
    workingPieces: Piece[],
    workingPieceIndex: number,
  ): { piece: Piece | null; score: number | null } {
    let best: Piece | null = null;
    let bestScore: number | null = null;
    const workingPiece = workingPieces[workingPieceIndex];

    for (let rotation = 0; rotation < 4; rotation++) {
      const _piece = workingPiece.clone();
      for (let i = 0; i < rotation; i++) {
        _piece.rotate(grid);
      }

      // Move piece to the leftmost position
      while (_piece.moveLeft(grid));

      while (grid.valid(_piece)) {
        const _pieceSet = _piece.clone();
        while (_pieceSet.moveDown(grid));

        const _grid = grid.cloneGrid();
        _grid.addPiece(_pieceSet);

        let score: number | null = null;
        if (workingPieceIndex === workingPieces.length - 1) {
          score =
            this.heightWeight * _grid.calculateAggregateHeight() +
            this.linesWeight * _grid.calculateCompleteLines() +
            this.holesWeight * _grid.calculateHoles() +
            this.bumpinessWeight * _grid.calculateBumpiness();
        } else {
          score = this._best(_grid, workingPieces, workingPieceIndex + 1).score;
        }

        if (score! > bestScore! || bestScore === null) {
          bestScore = score;
          best = _piece.clone();
        }

        _piece.column++;
      }
    }

    return { piece: best, score: bestScore };
  }

  best(grid: Grid, workingPieces: Piece[]): Piece | null {
    return this._best(grid, workingPieces, 0).piece;
  }
}
