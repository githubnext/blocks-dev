import type { Options } from "tsup";
export const tsup: Options = {
  clean: true,
  format: ["cjs", "esm"],
  entryPoints: ["utils/index.ts"],
  external: ["react", "react-dom"], // necessary to prevent "multiple React" errors in the dev env
};
