import { Endpoints } from "@octokit/types";

type RecursiveGitTree =
  Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"]["data"]["tree"];

type RecursiveGitTreeItem = RecursiveGitTree[number];

type ItemType = "blob" | "tree";

class TreeNode {
  path: string;
  type: ItemType;
  meta: RecursiveGitTreeItem;
  children: TreeNode[];

  constructor(
    path: string,
    meta: RecursiveGitTreeItem,
    type: ItemType,
    children: TreeNode[] = []
  ) {
    this.path = path;
    this.meta = meta;
    this.type = type;
    this.children = children;
  }

  getDirectoryFiles(
    path: string,
    opts?: {
      recursive?: boolean;
    }
  ): TreeNode[] {
    let options = opts || {
      recursive: false,
    };
    const parts = path.split("/");
    let currentNode = this as TreeNode;
    for (const part of parts) {
      if (!part) continue;
      let found = false;
      for (const child of currentNode.children) {
        if (child.path === part) {
          currentNode = child;
          found = true;
          break;
        }
      }
      if (!found) {
        return [];
      }
    }
    if (options.recursive) {
      return currentNode.children.flatMap((node) => {
        if (node.type === "blob") {
          return [node];
        } else {
          return node.getDirectoryFiles("", { recursive: true });
        }
      });
    } else {
      return currentNode.children.filter((node) => node.type === "blob");
    }
  }
}

export function buildTree(items: RecursiveGitTree) {
  const root = new TreeNode("/", { path: "/" }, "tree");
  const nodes = [root];

  for (const item of items) {
    // It's annoying that Octokit types "path" as optional, but it's never undefined in reality AFAICT.
    if (!item.path) throw new Error("Item has no path");
    const parts = item.path.split("/");
    let currentNode = root;
    for (const part of parts) {
      if (!part) continue;
      let found = false;
      for (const child of currentNode.children) {
        if (child.path === part) {
          currentNode = child;
          found = true;
          break;
        }
      }
      if (!found) {
        const newNode = new TreeNode(part, item, "tree");
        currentNode.children.push(newNode);
        currentNode = newNode;
        nodes.push(newNode);
      }
    }
    currentNode.type = item.type as ItemType;
  }
  return root;
}
