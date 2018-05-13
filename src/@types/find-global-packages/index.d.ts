declare function FindGlobalPackages(callback: (err: Error, dirs: string[]) => void): void;

declare module "find-global-packages" {
  export = FindGlobalPackages;
}