import { Runner } from "../src/Runner";

describe("Runner", () => {
  class CustomRunner extends Runner {
    public stdout: string = "";
    public stderr: string = "";
    public exitCode: number;
    protected readFromStdin() {
      return Promise.resolve("");
    }
    protected writeOut(text: string) {
      this.stdout += text;
    }
    protected writeError(text: string) {
      this.stderr += text;
    }
    protected exit(exitCode: number) {
      this.exitCode = exitCode;
    }
    public toJSON(): object {
      return {
        exitCode: this.exitCode,
        stderr: this.stderr,
        stdout: this.stdout,
      };
    }
  }
  describe("Support", () => {
    describe("with JSON", () => {
      test("languages", () => {
        const runner = new CustomRunner();
        runner.support({
          json: true,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
    describe("without JSON", () => {
      test("languages", () => {
        const runner = new CustomRunner();
        runner.support({
          json: false,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
  });
});
