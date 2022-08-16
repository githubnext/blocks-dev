import { TreeItem } from "../types";
import untypedExtensionToLanguage from "../extensionToLanguage.json";
const extensionToLanguage: Record<string, string> = untypedExtensionToLanguage;

export function getLanguageFromFilename(filename: string) {
  const extension = filename.split(".").pop();
  if (!extension) return "text";

  const match = extensionToLanguage[extension] as string;
  return match || "text";
}

interface NestedFileTree {
  children: NestedFileTree[];
  name: string;
  path: string;
  parent: string;
  size: number;
  type: string;
}

const getNestedChildren = (
  files: NestedFileTree[],
  rootPath = ""
): NestedFileTree[] => {
  const nextItems = files.filter((d) => d.parent === rootPath);
  const nextFolderNames = [
    // @ts-ignore
    ...new Set(
      files
        .filter((d) => d.parent.startsWith(rootPath ? rootPath + "/" : ""))
        .map(
          (d) =>
            d.path.slice(rootPath.length + (rootPath ? 1 : 0)).split("/")[0]
        )
    ),
  ].filter((name) => {
    const path = rootPath ? `${rootPath}/${name}` : (name as string);
    return !nextItems.find((d) => d.path === path);
  });
  const nextFolders = nextFolderNames.map((name = "") => {
    const newRootPath = rootPath ? `${rootPath}/${name}` : (name as string);
    return {
      name,
      path: newRootPath,
      parent: rootPath,
      type: "tree",
      size: 0,
      children: getNestedChildren(
        files.filter((d) => d.path.startsWith(newRootPath)),
        newRootPath
      ),
    };
  }) as any;
  return [
    ...nextFolders,
    ...nextItems.map((d) => {
      if (d.type !== "tree") return d;
      const newRootPath = rootPath ? `${rootPath}/${d.name}` : d.name;
      return {
        ...d,
        children: getNestedChildren(
          files.filter((d) => d.path.startsWith(newRootPath)),
          newRootPath
        ),
      };
    }),
  ].sort((a, b) => {
    if (a.type === b.type)
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    return a.type === "tree" ? -1 : 1;
  });
};

export function getNestedFileTree(files: TreeItem[]): NestedFileTree[] {
  const parsedItems: NestedFileTree[] = files.map((d) => ({
    name: d.path?.split("/").pop() || "",
    path: d.path || "",
    parent: d.path?.split("/").slice(0, -1).join("/") || "",
    type: d.type || "",
    size: d.size || 0,
    children: [],
  }));
  const tree = {
    name: "",
    path: "",
    parent: "",
    size: 0,
    type: "tree",
    children: getNestedChildren(parsedItems),
  };
  return [tree];
}
