import chalk from "chalk";

export abstract class BaseCommand {
  protected stdout: NodeJS.WriteStream = process.stdout;
  protected stderr: NodeJS.WriteStream = process.stderr;

  protected writeOut(text: string): void {
    this.stdout.write(text + "\n");
  }

  protected writeOutHeading(text: string): void {
    this.writeOut(this.stdout.isTTY ? chalk.blue(text) : text);
  }

  protected writeError(text: string): void {
    this.stderr.write((this.stderr.isTTY ? chalk.red(text) : text) + "\n");
  }

  protected set exitCode(exitCode: number) {
    process.exitCode = exitCode;
  }

  protected get exitCode(): number {
    return process.exitCode || 0;
  }

  protected handleError(error: Error, exitCode: number): Promise<never> {
    this.writeError(error.message);
    this.exitCode = exitCode;
    return Promise.reject(error);
  }
}
