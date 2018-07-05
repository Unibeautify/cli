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
  }
  test("sanity", () => {
    expect(true).toBe(true);
  });
});
