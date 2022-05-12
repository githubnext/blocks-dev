import type { Options } from "tsup";
export const tsup: Options = {
  clean: true,
  format: ["cjs", "esm"],
  entryPoints: ["utils/index.ts"],
};
