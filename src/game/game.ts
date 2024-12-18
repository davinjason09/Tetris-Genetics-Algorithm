import { Candidate, GAConfig, GameConfig } from '@/constant/Types';
import { colors, gameSpeed, tetrisScore } from '../constant/Contants';
import { AI } from './ai';
import { Genome } from './genome';
import { Grid } from './grid';
import { Piece } from './piece';
import { RandomPieceGenerator } from './piece_generator';

export class TetrisGame {
  private ai!: AI;
  private aiActive: boolean;
  private candidates!: Candidate[];
  private changeSpeed: boolean;
  private config: GAConfig;
  private currentGenome: number;
  private gameConfig: GameConfig;
  private gameInterval!: ReturnType<typeof setInterval>;
  private gamePlayed: number;
  private generation: number;
  private genomeUtils: Genome;
  private grid: Grid;
  private lines: number;
  private movePlayed: number;
  private movingPiece!: Piece;
  private pieces!: Piece[];
  private rng: RandomPieceGenerator;
  private score: number;
  private speedIndex: number;
  private togglePause: boolean;

  constructor(config: GAConfig) {
    this.aiActive = true;
    this.changeSpeed = false;
    this.config = config;
    this.currentGenome = -1;
    this.gamePlayed = 0;
    this.generation = 0;
    this.genomeUtils = new Genome(config);
    this.grid = new Grid(22, 10);
    this.lines = 0;
    this.movePlayed = 0;
    this.rng = new RandomPieceGenerator();
    this.score = 0;
    this.speedIndex = 3;
    this.togglePause = false;
    this.gameConfig = {
      gamesPerCandidate: 2,
      maxMovesPerGame: 200,
    };
  }

  public Init(): void {
    this.candidates = this.genomeUtils.createPopulation();
    this.evaluateNextGenome();

    this.updateScore();
    document.addEventListener('keydown', this.onKeyDown.bind(this));

    this.gameInterval = setInterval(() => this.loop(), gameSpeed[this.speedIndex]);
  }

  public loop(): void {
    if (this.changeSpeed) {
      clearInterval(this.gameInterval);
      this.gameInterval = setInterval(() => this.loop(), gameSpeed[this.speedIndex]);
      this.changeSpeed = false;
      this.updateScore();
    }

    this.update();
  }

  public drawGrid() {
    const output = document.getElementById('grid')!;
    let html = '<pre>const grid = [';
    const space = '&nbsp;'.repeat(14);
    const grid = this.grid.cells;

    for (let i = 2; i < this.grid.rows; i++) {
      const cells = grid[i];
      let rowHTML = cells
        .map((value) => `<span style="color: ${colors[value]}">${value ? ' ' : '  '}</span>`)
        .join('');

      html += i === 2 ? `[${rowHTML}]` : `<br />${space}[${rowHTML}]`;
    }
    html += ']</pre>';

    output.innerHTML = html;
  }

  public updateScore(): void {
    const scoreDetails = document.getElementById('score')!;
    const genomeDetails = document.getElementById('genome')!;
    const space = '&nbsp;'.repeat(7);
    let scoreHTML = `<br /><br /><h2>&nbsp;</h2><h2>Score: ${this.score}</h2>`;

    scoreHTML += '<br /><b>--Upcoming Shape--</b></br><pre>';
    const upcomingShape = this.pieces[1].cells;

    for (const row of upcomingShape) {
      scoreHTML +=
        space +
        row
          .map((value) => `<span style="color: ${colors[value]}">${value ? ' ' : '  '}</span>`)
          .join('') +
        '<br/>';
    }

    for (let i = 0; i < 4 - upcomingShape.length; i++) {
      scoreHTML += '<br/>';
    }

    scoreHTML += '</pre>';

    genomeDetails.innerHTML = `Drop time: ${gameSpeed[this.speedIndex]}ms<br/>`;
    if (this.aiActive) {
      const candidate = this.candidates[this.currentGenome];
      const bestGenome = this.candidates[0];

      genomeDetails.innerHTML += `
      Game: ${this.gamePlayed + 1}/${this.gameConfig.gamesPerCandidate}<br/>
      Moves: ${this.movePlayed}/${this.gameConfig.maxMovesPerGame}<br/>
      Lines cleared: ${this.lines}<br/>
      Generation: ${this.generation}/${this.config.generations}<br/>
      Individual: ${this.currentGenome + 1}/${this.config.populationSize}<br/>
      Current Genome:<pre style="font-size: 0.75rem">${JSON.stringify(candidate, null, 2)}</pre>
      ${this.generation ? `Best Genome:<pre style="font-size: 0.75rem">${JSON.stringify(bestGenome, null, 2)}</pre>` : ''}
    `;
    }

    scoreDetails.innerHTML = scoreHTML;
  }

  private update(): void {
    const result = this.movePieceDown();
    this.drawGrid();

    if (!result) {
      const clearedLines = this.grid.clearCompleteLines();
      this.score += tetrisScore[clearedLines];
      this.lines += clearedLines;

      const gameEnd =
        this.grid.hasExceededTop() ||
        (this.aiActive && this.movePlayed >= this.gameConfig.maxMovesPerGame);

      if (gameEnd) {
        if (this.aiActive) {
          this.gamePlayed++;
          this.candidates[this.currentGenome].fitness += this.lines;
        }

        this.grid.resetGrid();
        this.movePlayed = 0;
        this.lines = 0;
        this.score = 0;
      }

      this.updateScore();
      this.makeNextMove();
    }
  }

  private makeNextMove(): void {
    const { gamesPerCandidate } = this.gameConfig;
    this.movePlayed++;

    if (this.gamePlayed >= gamesPerCandidate) {
      this.evaluateNextGenome();
    } else {
      this.pieces.shift();
      this.pieces.push(this.rng.nextPiece(this.grid));

      if (this.aiActive) {
        this.movingPiece = this.ai.bestMove(this.grid, this.pieces)!;
      } else {
        this.movingPiece = this.pieces[0];
      }

      this.grid.addPiece(this.movingPiece);
      this.drawGrid();
      this.updateScore();
    }
  }

  private evaluateNextGenome(): void {
    this.currentGenome++;

    if (this.currentGenome >= this.config.populationSize) {
      const { deletionRate, populationSize } = this.config;
      this.genomeUtils.evolve(this.candidates);
      this.currentGenome = populationSize - Math.floor(deletionRate * populationSize);
      this.generation++;
    }

    this.ai = new AI(this.candidates[this.currentGenome]);
    this.gamePlayed = 0;
    this.reset();
  }

  private movePieceDown(): boolean {
    this.grid.removePiece(this.movingPiece);
    const result = this.movingPiece.moveDown(this.grid);
    this.grid.addPiece(this.movingPiece);

    return result;
  }

  private movePieceRight(): void {
    this.movePiece(() => this.movingPiece.moveRight(this.grid));
  }

  private movePieceLeft(): void {
    this.movePiece(() => this.movingPiece.moveLeft(this.grid));
  }

  private rotatePiece(): void {
    this.movePiece(() => this.movingPiece.rotate(this.grid));
  }

  private movePiece(action: () => void): void {
    this.grid.removePiece(this.movingPiece);
    action();
    this.grid.addPiece(this.movingPiece);
  }

  private reset(): void {
    this.grid.resetGrid();
    this.score = 0;
    this.movePlayed = 0;
    this.pieces = [this.rng.nextPiece(this.grid), this.rng.nextPiece(this.grid)];
    this.makeNextMove();
    this.update();
    this.updateScore();
  }

  private pause(): void {
    this.togglePause = !this.togglePause;

    if (this.togglePause) {
      clearInterval(this.gameInterval);
    } else {
      this.gameInterval = setInterval(() => this.loop(), gameSpeed[this.speedIndex]);
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    const speedLength = gameSpeed.length;
    const pressedKey = event.key;

    if (pressedKey === ' ') {
      if (!this.aiActive) this.rotatePiece();
    } else if (pressedKey === 'ArrowDown') {
      if (!this.aiActive) this.movePieceDown();
    } else if (pressedKey === 'ArrowLeft') {
      if (!this.aiActive) this.movePieceLeft();
    } else if (pressedKey === 'ArrowRight') {
      if (!this.aiActive) this.movePieceRight();
    } else if (pressedKey.toLowerCase() === 'r') {
      this.reset();
    } else if (pressedKey.toLowerCase() === 'p') {
      this.pause();
    } else if (pressedKey.toLowerCase() === 'a') {
      this.aiActive = !this.aiActive;
    } else if (pressedKey === '-' || pressedKey === '_') {
      this.speedIndex++;

      if (this.speedIndex >= speedLength) this.speedIndex = 0;
      this.changeSpeed = true;
    } else if (pressedKey === '=' || pressedKey === '+') {
      this.speedIndex--;

      if (this.speedIndex < 0) this.speedIndex = speedLength - 1;
      this.changeSpeed = true;
    }

    this.drawGrid();
    this.updateScore();
  }
}
