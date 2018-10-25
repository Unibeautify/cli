import {
  getSupportedLanguages,
  findInstalledBeautifiers,
  setupUnibeautify,
  getAllLanguages,
} from "../utils";
import { BaseCommand } from "./BaseCommand";

export class SupportCommand extends BaseCommand {
  public support(options: {
    json?: boolean;
    languages?: boolean;
    beautifiers?: boolean;
    all?: boolean;
  }): Promise<void> {
    const printer: (info: SupportInfo) => void = options.json
      ? this.jsonPrinter
      : this.listPrinter;
    const info: SupportInfo = {};
    return setupUnibeautify().then(async unibeautify => {
      if (options.languages) {
        if (options.all) {
          info["languages"] = getAllLanguages();
        } else {
          info["languages"] = getSupportedLanguages();
        }
      }
      if (options.beautifiers) {
        const beautifiers = await findInstalledBeautifiers();
        info["beautifiers"] = beautifiers;
      }
      if (Object.keys(info).length === 0) {
        this.writeError("Nothing to show");
        // this.exit(1);
        this.exitCode = 1;
      } else {
        printer(info);
        // this.exit(0);
      }
    });
  }

  private jsonPrinter = (info: SupportInfo) => {
    this.writeOut(JSON.stringify(info, null, 2));
    // unibeautify:ignore-next-line
  }

  private listPrinter = (info: SupportInfo) => {
    Object.keys(info).forEach(section => {
      this.writeOutHeading(`Supported ${section}`);
      const items = info[section];
      items.forEach((item, index) => this.writeOut(`${index + 1}. ${item}`));
    });
    // unibeautify:ignore-next-line
  }
}

interface SupportInfo {
  [section: string]: string[];
}
