import { Runner } from "../src/Runner";

describe("Runner", () => {
  class CustomRunner extends Runner {
    public stdout: string = "";
    public stderr: string = "";
    public exitCode: number = 0;
    protected readFromStdin() {
      return Promise.resolve("");
    }
    protected writeOut(text: string) {
      this.stdout += text + "\n";
    }
    protected writeError(text: string) {
      this.stderr += text + "\n";
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
    describe("with JSON", async () => {
      test("languages", async () => {
        const runner = new CustomRunner();
        await runner.support({
          all: true,
          json: true,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
    describe("without JSON", async () => {
      test("languages", async () => {
        const runner = new CustomRunner();
        await runner.support({
          all: true,
          json: false,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
  });
});
