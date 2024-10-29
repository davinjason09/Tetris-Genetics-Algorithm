import { AI } from "./ai";
import { Grid } from "./grid";
import { Piece } from "./piece";
import { RandomPieceGenerator } from "./piece_generator";
import { Stopwatch } from "./stopwatch";
import { Timer } from "./timer";

export class Game {
  private gridCanvas: HTMLCanvasElement;
  private nextCanvas: HTMLCanvasElement;
  private scoreContainer: HTMLElement;
  private resetButton: HTMLElement;
  private aiButton: HTMLElement;
  private gridContext: CanvasRenderingContext2D;
  private nextContext: CanvasRenderingContext2D;
  private grid: Grid;
  private rng: RandomPieceGenerator;
  private ai: AI;
  private workingPieces: (Piece | null)[];
  private workingPiece: Piece | null;
  private isAIActive: boolean;
  private isKeyEnabled: boolean;
  private gravityTimer: Timer;
  private score: number;
  private workingPieceDropAnimationStopwatch: Stopwatch | null;

  constructor() {
    this.gridCanvas = document.getElementById(
      "grid-canvas",
    ) as HTMLCanvasElement;
    this.nextCanvas = document.getElementById(
      "next-canvas",
    ) as HTMLCanvasElement;
    this.scoreContainer = document.getElementById("score-container")!;
    this.resetButton = document.getElementById("reset-button")!;
    this.aiButton = document.getElementById("ai-button")!;
    this.gridContext = this.gridCanvas.getContext("2d")!;
    this.nextContext = this.nextCanvas.getContext("2d")!;
    document.addEventListener("keydown", this.onKeyDown.bind(this));

    this.grid = new Grid(22, 10);
    this.rng = new RandomPieceGenerator();
    this.ai = new AI({
      heightWeight: -0.4790820241086245,
      linesWeight: 0.3964888767434276,
      holesWeight: -0.7460483825589502,
      bumpinessWeight: -0.23809408996422596,
    });
    this.workingPieces = [null, this.rng.nextPiece()];
    this.workingPiece = null;
    this.isAIActive = true;
    this.isKeyEnabled = true;
    this.gravityTimer = new Timer(this.onGravityTimerTick.bind(this), 500);
    this.score = 0;
    this.workingPieceDropAnimationStopwatch = null;

    this.aiButton.onclick = this.toggleAI.bind(this);
    this.resetButton.onclick = this.resetGame.bind(this);

    this.aiButton.style.backgroundColor = "#E9E9FF";
    this.startTurn();
  }

  private intToRGB(i: number): string {
    return `rgb(${(i >> 16) & 0xff}, ${(i >> 8) & 0xff}, ${i & 0xff})`;
  }

  private redrawGridCanvas(workingPiecesVerticalOffset: number = 0): void {
    this.gridContext.save();
    this.gridContext.clearRect(
      0,
      0,
      this.gridCanvas.width,
      this.gridCanvas.height,
    );

    for (let row = 2; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        if (this.grid.cells[row][col] !== 0) {
          this.gridContext.fillStyle = this.intToRGB(this.grid.cells[row][col]);
          this.gridContext.fillRect(20 * col, 20 * (row - 2), 20, 20);
          this.gridContext.strokeStyle = "#FFFFFF";
          this.gridContext.strokeRect(20 * col, 20 * (row - 2), 20, 20);
        }
      }
    }

    if (this.workingPiece) {
      for (let row = 0; row < this.workingPiece.dimension; row++) {
        for (let col = 0; col < this.workingPiece.dimension; col++) {
          if (this.grid.cells[row][col] !== 0) {
            this.gridContext.fillStyle = this.intToRGB(
              this.grid.cells[row][col],
            );
            this.gridContext.fillRect(
              20 * (col + this.workingPiece.dimension),
              20 * (row + this.workingPiece.dimension - 2) +
                workingPiecesVerticalOffset,
              20,
              20,
            );
            this.gridContext.strokeStyle = "#FFFFFF";
            this.gridContext.strokeRect(
              20 * (col + this.workingPiece.dimension),
              20 * (row + this.workingPiece.dimension - 2) +
                workingPiecesVerticalOffset,
              20,
              20,
            );
          }
        }
      }
    }

    this.gridContext.restore();
  }

  private redrawNextCanvas(): void {
    this.nextContext.save();
    this.nextContext.clearRect(
      0,
      0,
      this.nextCanvas.width,
      this.nextCanvas.height,
    );

    const next = this.workingPieces[1];
    if (next) {
      const xOffset =
        next.dimension === 2
          ? 20
          : next.dimension === 3
            ? 10
            : next.dimension === 4
              ? 0
              : null;
      const yOffset =
        next.dimension === 2
          ? 20
          : next.dimension === 3
            ? 20
            : next.dimension === 4
              ? 10
              : null;

      for (let r = 0; r < next.dimension; r++) {
        for (let c = 0; c < next.dimension; c++) {
          if (next.cells[r][c] !== 0) {
            this.nextContext.fillStyle = this.intToRGB(next.cells[r][c]);
            this.nextContext.fillRect(
              xOffset! + 20 * c,
              yOffset! + 20 * r,
              20,
              20,
            );
            this.nextContext.strokeStyle = "#FFFFFF";
            this.nextContext.strokeRect(
              xOffset! + 20 * c,
              yOffset! + 20 * r,
              20,
              20,
            );
          }
        }
      }
    }

    this.nextContext.restore();
  }

  private updateScoreContainer(): void {
    this.scoreContainer.innerHTML = this.score.toString();
  }

  private startWorkingPieceDropAnimation(
    callback: () => void = () => {},
  ): void {
    let animationHeight = 0;
    let _workingPiece = this.workingPiece!.clone();

    while (_workingPiece.moveDown(this.grid)) animationHeight++;

    const stopwatch = new Stopwatch((elapsed: number) => {
      if (elapsed >= animationHeight * 20) {
        stopwatch.stop();
        this.redrawGridCanvas(20 * animationHeight);
        callback();
        return;
      }

      this.redrawGridCanvas(20 * (elapsed / 20));
    });

    this.workingPieceDropAnimationStopwatch = stopwatch;
  }

  private cancelWorkingPieceDropAnimation(): void {
    if (this.workingPieceDropAnimationStopwatch === null) return;

    this.workingPieceDropAnimationStopwatch.stop();
    this.workingPieceDropAnimationStopwatch = null;
  }

  private startTurn(): void {
    this.workingPieces.shift();
    this.workingPieces.push(this.rng.nextPiece());
    this.workingPiece = this.workingPieces[0];

    this.redrawGridCanvas();
    this.redrawNextCanvas();

    if (this.isAIActive) {
      this.isKeyEnabled = false;
      this.workingPiece = this.ai.best(
        this.grid,
        this.workingPieces as Piece[],
      );
      this.startWorkingPieceDropAnimation(() => {
        while (this.workingPiece!.moveDown(this.grid));

        if (!this.endTurn()) {
          alert("Game Over!");
          return;
        }

        this.startTurn();
      });
    } else {
      this.isKeyEnabled = true;
      this.gravityTimer.resetForward(500);
    }
  }

  private endTurn(): boolean {
    this.grid.addPiece(this.workingPiece!);
    this.score += this.grid.clearedLines();
    this.redrawGridCanvas();
    this.updateScoreContainer();

    return !this.grid.hasExceededTop();
  }

  private onGravityTimerTick(): void {
    if (this.workingPiece!.canMoveDown(this.grid)) {
      this.workingPiece!.moveDown(this.grid);
      this.redrawGridCanvas();
      return;
    }

    this.gravityTimer.stop();

    if (!this.endTurn()) {
      this.isKeyEnabled = false;
      alert("Game Over!");
      return;
    }

    this.startTurn();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.isKeyEnabled) return;

    switch (event.key) {
      case " ": // Space
        this.isKeyEnabled = false;
        this.gravityTimer.stop();
        this.startWorkingPieceDropAnimation(() => {
          while (this.workingPiece!.canMoveDown(this.grid));

          if (!this.endTurn()) {
            alert("Game Over!");
            return;
          }

          this.startTurn();
        });
        break;
      case "ArrowDown":
        this.gravityTimer.resetForward(500);
        break;
      case "ArrowLeft":
        if (this.workingPiece!.canMoveLeft(this.grid)) {
          this.workingPiece!.moveLeft(this.grid);
          this.redrawGridCanvas;
        }
        break;
      case "ArrowRight":
        if (this.workingPiece!.canMoveRight(this.grid)) {
          this.workingPiece!.moveRight(this.grid);
          this.redrawGridCanvas;
        }
        break;
      case "ArrowUp":
        this.workingPiece!.rotate(this.grid);
        this.redrawGridCanvas();
        break;
    }
  }

  private toggleAI(): void {
    this.isAIActive = !this.isAIActive;
    this.aiButton.style.backgroundColor = this.isAIActive
      ? "#E9E9FF"
      : "#FF3232";
  }

  private resetGame(): void {
    this.grid = new Grid(22, 10);
    this.rng = new RandomPieceGenerator();
    this.score = 0;
    this.workingPieces = [null, this.rng.nextPiece()];
    this.workingPiece = null;
    this.cancelWorkingPieceDropAnimation();
    this.isAIActive = true;
    this.isKeyEnabled = true;
    this.aiButton.style.backgroundColor = "#E9E9FF";
    this.startTurn();
  }
}
