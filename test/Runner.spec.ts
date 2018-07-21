import { Runner } from "../src/Runner";
import { createMockWritableStream } from "./mockStreams";

describe("Runner", () => {
  class CustomRunner extends Runner {
    protected stdout = createMockWritableStream();
    protected stderr = createMockWritableStream();
    public exitCode: number = 0;
    protected readFromStdin() {
      return Promise.resolve("");
    }
    protected exit(exitCode: number) {
      this.exitCode = exitCode;
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
    test("options in config file", async () => {
      const runner = new CustomRunner();
      await runner.beautify({
        args: [],
        configFile: "test/.unibeautifyrc.yml",
        filePath: "test/test.js",
        language: "JavaScript",
      });
      expect(runner.toJSON()).toMatchSnapshot();
    });
    describe("Errors", () => {
      test("should throw error when cannot find text file", () => {
        const runner = new CustomRunner();
        const thenCb = jest.fn();
        const catchCb = jest.fn();
        return runner.beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          filePath: "test/test2.js",
          language: "JavaScript",
        }).then(thenCb, catchCb).then(() => {
          expect(thenCb).not.toBeCalled();
          expect(catchCb).toHaveBeenCalled();
          expect(catchCb.mock.calls).toHaveLength(1);
          expect(catchCb.mock.calls[0]).toHaveLength(1);
          expect((<any>catchCb.mock.calls[0][0]).message).toBe("ENOENT: no such file or directory, open 'test/test2.js'");
        });
      });
      test.only("should throw error when cannot find config", () => {
        const runner = new CustomRunner();
        const thenCb = jest.fn();
        const catchCb = jest.fn();
        const configFile = "test/.unibeautifyrc2.yml";
          return runner.beautify({
            args: [],
            configFile,
            filePath: "test/test.js",
            language: "JavaScript",
          }).then(thenCb, catchCb).then(() => {
            // tslint:disable-next-line:no-console
            console.log("Did you even get here?", thenCb.mock);
            expect(thenCb).not.toBeCalled();
            // tslint:disable-next-line:no-console
            console.log("here1?");
            expect(catchCb).toHaveBeenCalled();
            // tslint:disable-next-line:no-console
            console.log("here2?");
            expect(catchCb.mock.calls).toHaveLength(1);
            // tslint:disable-next-line:no-console
            console.log("here3?");
            expect(catchCb.mock.calls[0]).toHaveLength(1);
            // tslint:disable-next-line:no-console
            console.log("here4?");
            expect((<any>catchCb.mock.calls[0][0]).message).toBe(`Could not load configuration file ${configFile}`);
          });
      });
    });
  });
});
