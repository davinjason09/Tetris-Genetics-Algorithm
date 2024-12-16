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
    const output = document.getElementById("grid")!;
    let html = "<pre>const grid = [";
    const space =
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    const grid = this.grid;

    for (let i = 2; i < grid.rows; i++) {
      let rowHtml = "";
      const cells = grid.cells[i];
      for (let j = 0; j < cells.length; j++) {
        const cellValue = cells[j];
        rowHtml += `<span style="color: ${colors[cellValue]}">${cellValue > 0 ? " " : "  "}</span>`;
      }
      if (i === 2) {
        html += `[${rowHtml}]`;
      } else {
        html += `<br />${space}[${rowHtml}]`;
      }
    }
    html += "]</pre>";

    output.innerHTML = html;
  }

  public updateScore(): void {
    const scoreDetails = document.getElementById("score")!;
    const genomeDetails = document.getElementById("genome")!;
    const space = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
    let scoreHTML =
      "<br /><br /><h2>&nbsp;</h2><h2>Score: " + this.score + "</h2>";
    scoreHTML += "<br /><b>--Upcoming Shape--</b></br><pre>";

    const upcomingShape = this.pieces[1].cells;
    for (let i = 0; i < upcomingShape.length; i++) {
      let rowHTML = "";
      const cells = upcomingShape[i];

      for (let j = 0; j < cells.length; j++) {
        const cellValue = cells[j];
        rowHTML += `<span style="color: ${colors[cellValue]}">${cellValue > 0 ? " " : "  "}</span>`;
      }

      scoreHTML += space + rowHTML + "<br/>";
    }

    for (let i = 0; i < 4 - upcomingShape.length; i++) {
      scoreHTML += "<br/>";
    }

    scoreHTML += "</pre>";

    let genomeHTML = `<br/>Drop time: ${gameSpeed[this.speedIndex]}ms`;
    if (this.aiActive) {
      genomeHTML += `<br/>Game: ${this.gamePlayed + 1}/${this.gameConfig.gamesPerCandidate}`;
      genomeHTML += `<br/>Moves: ${this.movePlayed}/${this.gameConfig.maxMovesPerGame}`;
      genomeHTML += `<br/>Lines cleared: ${this.lines}`;
      genomeHTML += `<br/>Generation: ${this.generation}/${this.config.generations}`;
      genomeHTML += `<br/>Individual: ${this.currentGenome + 1}/${this.config.populationSize}`;
      genomeHTML += `<br/><pre style="font-size: 12px">${JSON.stringify(this.candidates[this.currentGenome], null, 2)}</pre>`;
    }

    scoreDetails.innerHTML = scoreHTML;
    genomeDetails.innerHTML = genomeHTML;
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

  private evolve(config: GAConfig): void {
    const utils = new Genome(config);
    const newCandidates: Candidate[] = [];

    utils.sortCandidates(this.candidates);
    const newCandidateSize = Math.floor(
      config.deletionRate * config.populationSize,
    );
    const selectionSize = Math.max(
      Math.floor(config.selectionSize * config.populationSize),
      2,
    );
    console.log(newCandidateSize, selectionSize);
    for (let i = 0; i < newCandidateSize; i++) {
      const [parent1, parent2] = utils.tournamentSelection(
        this.candidates,
        selectionSize,
      );
      console.log(parent1, parent2);
      const child = utils.crossover(parent1, parent2);
      utils.mutate(child);
      utils.normalize(child);
      newCandidates.push(child);
    }

    utils.deleteNWeakest(this.candidates, newCandidates);
    this.currentGenome = config.populationSize - newCandidates.length - 1;
  }

  private evaluateNextGenome(): void {
    this.currentGenome++;

    if (this.currentGenome >= this.config.populationSize) {
      this.evolve(this.config);
      this.generation++;
    }

    this.ai = new AI(this.candidates[this.currentGenome]);
    this.gamePlayed = 0;
    this.rng = new RandomPieceGenerator();
    this.pieces = [this.rng.nextPiece(), this.rng.nextPiece()];
    this.makeNextMove();
  }

  private movePieceDown(): boolean {
    this.grid.removePiece(this.movingPiece);
    const result = this.movingPiece.moveDown(this.grid);
    this.grid.addPiece(this.movingPiece);

    return result;
  }

  private movePieceRight(): void {
    this.grid.removePiece(this.movingPiece);
    this.movingPiece.moveRight(this.grid);
    this.grid.addPiece(this.movingPiece);
  }

  private movePieceLeft(): void {
    this.grid.removePiece(this.movingPiece);
    this.movingPiece.moveLeft(this.grid);
    this.grid.addPiece(this.movingPiece);
  }

  private rotatePiece(): void {
    this.grid.removePiece(this.movingPiece);
    this.movingPiece.rotate(this.grid);
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
