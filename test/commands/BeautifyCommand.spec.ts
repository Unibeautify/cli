import { BeautifyCommand } from "../../src/commands/BeautifyCommand";
import { createMockWritableStream } from "../mockStreams";

describe("BeautifyCommand", () => {
  class CustomCommand extends BeautifyCommand {
    protected stdout = createMockWritableStream();
    protected stderr = createMockWritableStream();
    protected readFromStdin() {
      return Promise.resolve("");
    }
    public toJSON() {
      return {
        exitCode: this.exitCode,
        stderr: this.stderr.rawData,
        stdout: this.stdout.rawData,
      };
    }
  }
  describe("Beautify", () => {
    test("should beautify using options passed in cmd", async () => {
      const runner = new CustomCommand();
      await runner.beautify({
        args: [],
        configJson: `{"JavaScript": {"beautifiers": ["ESLint"],"quotes": "double"}}`,
        filePath: "test/fixtures/test1.js",
        language: "JavaScript",
      });
      const json = runner.toJSON();
      expect(json.exitCode).toBe(0);
      expect(json).toMatchSnapshot();
    });
    test("should beautify using options in config file", async () => {
      const runner = new CustomCommand();
      await runner.beautify({
        args: [],
        configFile: "test/.unibeautifyrc.yml",
        filePath: "test/fixtures/test1.js",
        language: "JavaScript",
      });
      const json = runner.toJSON();
      expect(json.exitCode).toBe(0);
      expect(json).toMatchSnapshot();
    });
    describe("Errors", () => {
      test("should throw error when cannot find text file", () => {
        const runner = new CustomCommand();
        const thenCb = jest.fn();
        const catchCb = jest.fn();
        return runner
          .beautify({
            args: [],
            configFile: "test/.unibeautifyrc.yml",
            filePath: "test/test2.js",
            language: "JavaScript",
          })
          .then(thenCb)
          .catch(catchCb)
          .then(() => {
            expect(thenCb).not.toBeCalled();
            expect(catchCb).toHaveBeenCalled();
            expect(catchCb.mock.calls).toHaveLength(1);
            expect(catchCb.mock.calls[0]).toHaveLength(1);
            expect((<any>catchCb.mock.calls[0][0]).message).toBe(
              "ENOENT: no such file or directory, open 'test/test2.js'"
            );
          });
      });
      test("should throw error when cannot find config", () => {
        expect.assertions(5);
        const runner = new CustomCommand();
        const thenCb = jest.fn();
        const catchCb = jest.fn();
        const configFile = "test/.unibeautifyrc2.yml";
        return runner
          .beautify({
            args: [],
            configFile,
            filePath: "test/fixtures/test1.js",
            language: "JavaScript",
          })
          .then(thenCb)
          .catch(catchCb)
          .then(() => {
            expect(thenCb).not.toBeCalled();
            expect(catchCb).toHaveBeenCalled();
            expect(catchCb.mock.calls).toHaveLength(1);
            expect(catchCb.mock.calls[0]).toHaveLength(1);
            expect((<any>catchCb.mock.calls[0][0]).message).toBe(
              `Could not load configuration file ${configFile}`
            );
          });
      });
      test("should throw an error saying language is required", () => {
        const runner = new CustomCommand();
        const thenCb = jest.fn();
        const catchCb = jest.fn();
        return runner.beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          filePath: "test/fixtures/test1.js",
        })
        .then(thenCb)
        .catch(catchCb)
        .then(() => {
          expect(thenCb).not.toBeCalled();
          expect(catchCb).toHaveBeenCalled();
          expect(catchCb.mock.calls).toHaveLength(1);
          expect(catchCb.mock.calls[0]).toHaveLength(1);
          expect(catchCb).toHaveProperty(["mock", "calls", 0, 0, "message"], "A language is required.");
          const json = runner.toJSON();
          expect(json.exitCode).toBe(1);
          expect(json).toMatchSnapshot("json");
        });
      });
    });
  });
});
