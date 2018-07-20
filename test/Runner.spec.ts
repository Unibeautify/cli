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
      test("supported languages", async () => {
        const runner = new CustomRunner();
        await runner.support({
          all: false,
          json: false,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
    test("error", async () => {
      const runner = new CustomRunner();
      await runner.support({
        all: false,
        beautifiers: false,
        json: false,
        languages: false,
      });
      expect(runner.toJSON()).toMatchSnapshot();
    });
  });
  describe("Beautify", () => {
    test("options in cmd", async () => {
      const runner = new CustomRunner();
      await runner.beautify({
        args: [],
        configJson: `{"JavaScript": {"beautifiers": ["ESLint"],"quotes": "double"}}`,
        filePath: "test/test.js",
        language: "JavaScript",
      });
      expect(runner.toJSON()).toMatchSnapshot();
    });
  });
});
