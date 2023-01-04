import { describe, expect, it } from "vitest";
import stubTree from "./githubnext-blocks-stub.json";
import { buildTree } from "../utils/lib/tree";

describe("buildTree", () => {
  it("converts the flattened tree into a nested data structure", async () => {
    const tree = buildTree(stubTree.tree);

    let rootFiles = tree.getDirectoryFiles("");
    expect(rootFiles.length).toBe(1);
    expect(rootFiles[0].path).toBe("README.md");

    let baseDotGithubFiles = tree.getDirectoryFiles(".github");
    expect(baseDotGithubFiles.length).toBe(0);

    let nestedDotGithubFiles = tree.getDirectoryFiles(".github/blocks");
    expect(nestedDotGithubFiles.length).toBe(1);
    expect(nestedDotGithubFiles[0].path).toBe("all.json");
    expect(nestedDotGithubFiles[0].meta.type).toBe("blob");

    let recursiveDotGithubFiles = tree.getDirectoryFiles(".github", {
      recursive: true,
    });

    expect(recursiveDotGithubFiles.length).toBe(4);
    expect(recursiveDotGithubFiles[0].meta.path).toBe(
      ".github/blocks/all.json"
    );
    expect(recursiveDotGithubFiles[1].meta.path).toBe(
      ".github/blocks/file/githubnext__blocks-examples__chart-block/examples%2Fweather.csv.json"
    );
    expect(recursiveDotGithubFiles[2].meta.path).toBe(
      ".github/blocks/file/githubnext__blocks-examples__chart/examples%2Fweather.csv.json"
    );
    expect(recursiveDotGithubFiles[3].meta.path).toBe(
      ".github/blocks/file/githubnext__blocks-examples__react-feedback-block/examples%2FMyComponent.jsx.json"
    );

    let examplesDir = tree.getDirectoryFiles("examples");
    expect(examplesDir.length).toBe(9);

    let framerExamples = tree.getDirectoryFiles("examples/framer motion docs");
    expect(framerExamples.length).toBe(6);
    expect(framerExamples[0].meta.path).toBe(
      "examples/framer motion docs/example1.js"
    );
  });
});
