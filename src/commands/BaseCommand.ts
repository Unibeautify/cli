export abstract class BaseCommand {
  protected stdout: NodeJS.WriteStream = process.stdout;
  protected stderr: NodeJS.WriteStream = process.stderr;

  protected writeOut(text: string): void {
    this.stdout.write(text + "\n");
  }

  protected writeError(text: string): void {
    this.stderr.write(text + "\n");
  }

  protected set exitCode(exitCode: number) {
    process.exitCode = exitCode;
  }

  protected get exitCode(): number {
    return process.exitCode || 0;
  }

  protected handleError(error: Error, exitCode: number) {
    this.writeError(error.message);
    this.exitCode = 1;
    return Promise.reject(error);
  }
}
