export class Stopwatch {
  private isStopped: boolean;
  private startTime: number;
  private callback: (elapsed: number) => void;

  constructor(callback: (elapsed: number) => void) {
    this.isStopped = false;
    this.startTime = Date.now();
    this.callback = callback;

    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    requestAnimationFrame(this.onAnimationFrame);
  }

  private onAnimationFrame(): void {
    if (this.isStopped) return;

    const elapsed = Date.now() - this.startTime;
    this.callback(elapsed);
    requestAnimationFrame(this.onAnimationFrame);
  }

  public stop(): void {
    this.isStopped = true;
  }
}
