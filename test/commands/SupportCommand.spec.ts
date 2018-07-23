import { SupportCommand } from "../../src/commands/SupportCommand";
import { createMockWritableStream } from "../mockStreams";

describe("SupportCommand", () => {
  class CustomCommand extends SupportCommand {
    protected stdout = createMockWritableStream();
    protected stderr = createMockWritableStream();
    protected readFromStdin() {
      return Promise.resolve("");
    }
    public toJSON(): object {
      return {
        exitCode: this.exitCode,
        stderr: this.stderr.rawData,
        stdout: this.stdout.rawData,
      };
    }
  }
  describe("Support", () => {
    describe("with JSON", async () => {
      test("languages", async () => {
        const runner = new CustomCommand();
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
        const runner = new CustomCommand();
        await runner.support({
          all: true,
          json: false,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
      test("supported languages", async () => {
        const runner = new CustomCommand();
        await runner.support({
          all: false,
          json: false,
          languages: true,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
      test("installed beautifiers", async () => {
        const runner = new CustomCommand();
        await runner.support({
          all: false,
          beautifiers: true,
          json: false,
        });
        expect(runner.toJSON()).toMatchSnapshot();
      });
    });
    test("should exit with message 'nothing to show'", async () => {
      const runner = new CustomCommand();
      await runner.support({
        all: false,
        beautifiers: false,
        json: false,
        languages: false,
      });
      expect(runner.toJSON()).toMatchSnapshot();
    });
  });
});
