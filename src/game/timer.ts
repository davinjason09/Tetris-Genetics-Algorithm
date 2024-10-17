export class Timer {
  private callback: () => void;
  private delay: number;
  private lastUpdate: number | null;
  private isRunning: boolean;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.lastUpdate = null;
    this.isRunning = false;

    this.loop();
  }

  private loop(): void {
    requestAnimationFrame(() => {
      const now = Date.now();

      if (!this.isRunning) {
        this.lastUpdate = now;
        this.loop();
      } else {
        const elapsed = now - (this.lastUpdate || now);

        if (this.lastUpdate === null || elapsed > this.delay) {
          this.callback();
          this.lastUpdate = now - (elapsed % this.delay);
        }

        this.loop();
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;

    this.lastUpdate = Date.now();
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public reset(newDelay?: number): void {
    this.lastUpdate = Date.now();

    if (newDelay !== undefined) this.delay = newDelay;
    this.start();
  }

  public resetForward(newDelay?: number): void {
    this.callback();

    if (newDelay !== undefined) this.delay = newDelay;

    this.lastUpdate = Date.now();
    this.start();
  }
}
