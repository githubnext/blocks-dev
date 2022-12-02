import { onRequestGitHubData } from "../../src/utils";

export interface Block {
  id: string;
  type: string;
  title: string;
  description: string;
  entry: string;
  extensions?: string[];
  matches?: string[];
  owner: string;
  repo: string;
}

export interface BlocksRepo {
  owner: string;
  repo: string;
  full_name: string;
  html_url: string;
  description: string;
  stars: number;
  watchers: number;
  language: string;
  topics: string[];

  blocks: Block[];
}

export type FileContext = {
  file: string;
  path: string;
  repo: string;
  owner: string;
  sha: string;
};

export type FolderContext = {
  folder: string;
  path: string;
  repo: string;
  owner: string;
  sha: string;
};

export type CommonBlockProps = {
  block: Block;

  metadata: any;
  onUpdateMetadata: (_: any) => void;
  onNavigateToPath: (_: string) => void;
  onRequestUpdateContent: (_: string) => void;
  onUpdateContent: (_: string) => void;
  onRequestGitHubData: typeof onRequestGitHubData;
  onRequestBlocksRepos: (params?: {
    path?: string;
    searchTerm?: string;
    repoUrl?: string;
    type?: "file" | "folder";
  }) => Promise<BlocksRepo[]>;

  BlockComponent: ({
    block,
    context,
  }: {
    block: { owner: string; repo: string; id: string };
    context?: {
      owner?: string;
      repo?: string;
      path?: string;
      sha?: string;
    };
  }) => JSX.Element;

  onStoreGet: (key: string) => Promise<any>;
  onStoreSet: (key: string, value: any) => Promise<void>;
};

export type FileContent = {
  content: string;
  context: FileContext;
};

export type FileData = {
  content: string;
  originalContent: string;
  isEditable: boolean;
  context: FileContext;
};
export type FileBlockProps = FileData & CommonBlockProps;

export type TreeItem =
  import("@octokit/openapi-types").components["schemas"]["git-tree"]["tree"][number];

export type FolderData = {
  tree: TreeItem[];
  context: FolderContext;
};
export type FolderBlockProps = FolderData & CommonBlockProps;

export type FileImport = {
  moduleName: string;
  starImport: string;
  namedImports: {
    name: string;
    alias: string;
  }[];
  defaultImport: string;
  sideEffectOnly: boolean;
};

export type RepoFiles = TreeItem[];

export type LightFileData = {
  contents: string;
  path: string;
};
export type GetFileContent = (path: string) => Promise<string>;
export interface UseFileContentParams {
  path: string;
}
