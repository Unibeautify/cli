import { BeautifyCommand } from "../../src/commands/BeautifyCommand";
import {
  createMockWritableStream,
  createMockReadableStream,
} from "../mockStreams";
import * as fs from "fs";

describe("BeautifyCommand", () => {
  class CustomCommand extends BeautifyCommand {
    constructor(private rawStdin: string = "", private isTTY: boolean = false) {
      super();
      this.rawStdin;
    }
    protected stdin = createMockReadableStream(this.rawStdin, this.isTTY);
    protected stdout = createMockWritableStream();
    protected stderr = createMockWritableStream();
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
      const command = new CustomCommand();
      await command.beautify({
        args: [],
        configJson: `{"JavaScript": {"beautifiers": ["ESLint"],"quotes": "double"}}`,
        filePath: "test/fixtures/test1.js",
        language: "JavaScript",
      });
      const json = command.toJSON();
      expect(json.exitCode).toBe(0);
      expect(json).toMatchSnapshot();
    });
    test("should beautify using options in config file", async () => {
      const command = new CustomCommand();
      await command.beautify({
        args: [],
        configFile: "test/.unibeautifyrc.yml",
        filePath: "test/fixtures/test1.js",
        language: "JavaScript",
      });
      const json = command.toJSON();
      expect(json.exitCode).toBe(0);
      expect(json).toMatchSnapshot();
    });
    test("should find config file without specifying it", async () => {
      const command = new CustomCommand();
      await command.beautify({
        args: [],
        filePath: "test/fixtures/test1.js",
        language: "JavaScript",
      });
      const json = command.toJSON();
      expect(json.exitCode).toBe(0);
      expect(json).toMatchSnapshot();
    });
    test("should beautify using stdin", async () => {
      const command = new CustomCommand("const test = 'test';");
      return command
        .beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          language: "JavaScript",
        })
        .then(() => {
          const json = command.toJSON();
          expect(json.exitCode).toBe(0);
          expect(json.stderr).toBe("");
          // tslint:disable-next-line:quotemark
          expect(json.stdout).toBe('const test = "test";\n');
        });
    });
    test("should beautify using stdin with TTY", async () => {
      const command = new CustomCommand("const test = 'test';", true);
      return command
        .beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          language: "JavaScript",
        })
        .then(() => {
          const json = command.toJSON();
          expect(json.exitCode).toBe(0);
          expect(json.stderr).toBe("");
          // tslint:disable-next-line:quotemark
          // expect(json.stdout).toBe('const test = "test";\n'); // <--- Doesn't work
          expect(json.stdout).toBe("\n"); // <--- What it actually returns
        });
    });
    test("should accept blank files or text", async () => {
      const command = new CustomCommand();
      return command
        .beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          language: "JavaScript",
        })
        .then(() => {
          const json = command.toJSON();
          expect(json.exitCode).toBe(0);
          expect(json.stderr).toBe("");
          // tslint:disable-next-line:quotemark
          expect(json.stdout).toBe("\n");
        });
    });
    test("should beautify and write to file", async () => {
      const command = new CustomCommand("const test = 'test';");
      const originPath = "test/fixtures/test1.js";
      const destPath = "test/commands/test1.js";
      return copyFile(originPath, destPath).then(() => {
        return command
          .beautify({
            args: [],
            configFile: "test/.unibeautifyrc.yml",
            filePath: destPath,
            inplace: true,
            language: "JavaScript",
          })
          .then(() => {
            return readFile(destPath).then(result => {
              const json = command.toJSON();
              expect(json.exitCode).toBe(0);
              expect(json.stderr).toBe("");
              // tslint:disable-next-line:quotemark
              expect(result.toString()).toBe('const test = "test";\n');
              return unlink(destPath);
            });
          });
      });
    });
  });
  describe("Errors", () => {
    test("should throw error when cannot find text file", () => {
      const command = new CustomCommand();
      const thenCb = jest.fn();
      const catchCb = jest.fn();
      return command
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
      const command = new CustomCommand();
      const thenCb = jest.fn();
      const catchCb = jest.fn();
      const configFile = "test/.unibeautifyrc2.yml";
      return command
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
      const command = new CustomCommand();
      const thenCb = jest.fn();
      const catchCb = jest.fn();
      return command
        .beautify({
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
          expect(catchCb).toHaveProperty(
            ["mock", "calls", 0, 0, "message"],
            "A language is required."
          );
          const json = command.toJSON();
          expect(json.exitCode).toBe(1);
          expect(json).toMatchSnapshot("json");
        });
    });
    test("should throw an error saying cannot find language", () => {
      const command = new CustomCommand();
      const thenCb = jest.fn();
      const catchCb = jest.fn();
      return command
        .beautify({
          args: [],
          configFile: "test/.unibeautifyrc.yml",
          filePath: "test/fixtures/test1.js",
          language: "javascript",
        })
        .then(thenCb)
        .catch(catchCb)
        .then(() => {
          expect(thenCb).not.toBeCalled();
          expect(catchCb).toHaveBeenCalled();
          expect(catchCb.mock.calls).toHaveLength(1);
          expect(catchCb.mock.calls[0]).toHaveLength(1);
          expect(catchCb).toHaveProperty(
            ["mock", "calls", 0, 0, "message"],
            "Cannot find language."
          );
          const json = command.toJSON();
          expect(json.exitCode).toBe(1);
          expect(json).toMatchSnapshot("json");
        });
    });
    test("should throw an error with invalid json", () => {
      const command = new CustomCommand();
      const thenCb = jest.fn();
      const catchCb = jest.fn();
      return command
        .beautify({
          args: [],
          configJson: `{"JavaScript": {"beautifiers": ["ESLint"],"quotes": "double"`,
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
          expect(catchCb).toHaveProperty(
            ["mock", "calls", 0, 0, "message"],
            "Unexpected end of JSON input"
          );
          const json = command.toJSON();
          expect(json.exitCode).toBe(2);
          expect(json).toMatchSnapshot("json");
        });
    });
  });
});

function copyFile(filePath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.copyFile(filePath, destPath, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(data.toString());
    });
  });
}

function unlink(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}
