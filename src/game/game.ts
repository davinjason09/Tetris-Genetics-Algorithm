import { colors, gameSpeed, tetrisScore } from "../constant/Contants";
import { Candidate, GAConfig, GameConfig } from "../constant/Types";
import { AI } from "./ai";
import { Genome } from "./genome";
import { Grid } from "./grid";
import { Piece } from "./piece";
import { RandomPieceGenerator } from "./piece_generator";

export class Game {
  ai: AI;
  aiActive: boolean;
  candidates: Candidate[];
  changeSpeed: boolean;
  config: GAConfig;
  currentGenome: number;
  grid: Grid;
  gameConfig: GameConfig;
  gameInterval: ReturnType<typeof setInterval>;
  gamePlayed: number;
  generation: number;
  lines: number;
  movePlayed: number;
  movingPiece: Piece;
  togglePause: boolean;
  pieces: Piece[];
  rng: RandomPieceGenerator;
  score: number;
  speedIndex: number;

  constructor(config: GAConfig) {
    this.grid = new Grid(22, 10);
    this.aiActive = true;
    this.changeSpeed = false;
    this.speedIndex = 3;
    this.score = 0;
    this.lines = 0;
    this.gamePlayed = 0;
    this.movePlayed = 0;
    this.togglePause = false;
    this.generation = 0;
    this.config = config;
    this.currentGenome = -1;
    this.rng = new RandomPieceGenerator();
    this.gameConfig = {
      gamesPerCandidate: 2,
      maxMovesPerGame: 200,
    };
  }

  public Init(): void {
    const utils = new Genome(this.config);
    this.candidates = utils.createPopulation();
    this.evaluateNextGenome();

    this.updateScore();
    document.addEventListener("keydown", this.onKeyDown.bind(this));

    this.gameInterval = setInterval(
      () => this.loop(),
      gameSpeed[this.speedIndex],
    );
  }

  public loop(): void {
    console.log("Hey");

    if (this.changeSpeed) {
      clearInterval(this.gameInterval);
      this.gameInterval = setInterval(
        () => this.loop(),
        gameSpeed[this.speedIndex],
      );
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

  public update(): void {
    const result = this.movePieceDown();
    this.drawGrid();

    if (!result) {
      const { maxMovesPerGame } = this.gameConfig;
      this.grid.addPiece(this.movingPiece);

      const clearedLines = this.grid.clearedLines();
      this.score += tetrisScore[clearedLines];
      this.lines += clearedLines;

      const gameEnd =
        this.grid.hasExceededTop() ||
        (this.aiActive && this.movePlayed >= maxMovesPerGame);

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
      this.pieces.push(this.rng.nextPiece());

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
    this.pieces = [this.rng.nextPiece(), this.rng.nextPiece()];
    this.makeNextMove();
    this.update();
    this.updateScore();
  }

  private pause(): void {
    this.togglePause = !this.togglePause;

    if (this.togglePause) {
      clearInterval(this.gameInterval);
    } else {
      this.gameInterval = setInterval(
        () => this.loop(),
        gameSpeed[this.speedIndex],
      );
    }
  }

  // TODO: handle key events
  private onKeyDown(event: KeyboardEvent) {
    const speedLength = gameSpeed.length;

    switch (event.key) {
      case " ":
        if (!this.aiActive) this.rotatePiece();
        break;
      case "ArrowDown":
        if (!this.aiActive) this.movePieceDown();
        break;
      case "ArrowLeft":
        if (!this.aiActive) this.movePieceLeft();
        break;
      case "ArrowRight":
        if (!this.aiActive) this.movePieceRight();
        break;
      case "R":
      case "r":
        this.reset();
        break;
      case "P":
      case "p":
        this.pause();
        break;
      case "-":
      case "_":
        this.speedIndex++;

        if (this.speedIndex >= speedLength) this.speedIndex = 0;
        this.changeSpeed = true;
        break;
      case "=":
      case "+":
        this.speedIndex--;

        if (this.speedIndex < 0) this.speedIndex = speedLength - 1;
        this.changeSpeed = true;
        break;
      case "A":
      case "a":
        this.aiActive = !this.aiActive;
        break;
    }

    this.drawGrid();
    this.updateScore();
  }
}
