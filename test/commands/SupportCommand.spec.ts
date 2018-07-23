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
        const command = new CustomCommand();
        await command.support({
          all: true,
          json: true,
          languages: true,
        });
        expect(command.toJSON()).toMatchSnapshot();
      });
    });
    describe("without JSON", async () => {
      test("languages", async () => {
        const command = new CustomCommand();
        await command.support({
          all: true,
          json: false,
          languages: true,
        });
        expect(command.toJSON()).toMatchSnapshot();
      });
      test("supported languages", async () => {
        const command = new CustomCommand();
        await command.support({
          all: false,
          json: false,
          languages: true,
        });
        expect(command.toJSON()).toMatchSnapshot();
      });
      test("installed beautifiers", async () => {
        const command = new CustomCommand();
        await command.support({
          all: false,
          beautifiers: true,
          json: false,
        });
        expect(command.toJSON()).toMatchSnapshot();
      });
    });
    test("should exit with message 'nothing to show'", async () => {
      const command = new CustomCommand();
      await command.support({
        all: false,
        beautifiers: false,
        json: false,
        languages: false,
      });
      expect(command.toJSON()).toMatchSnapshot();
    });
  });
});
