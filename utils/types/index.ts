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
  metadata: any;
  BlockComponent: any;
  onUpdateMetadata: (metadata: any) => void;
  onNavigateToPath: (path: string) => void;
  onRequestUpdateContent: (content: string) => void;
  onUpdateContent: (content: string) => void;
  onRequestGitHubData: (
    path: string,
    params?: Record<string, any>
  ) => Promise<any>;
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

export type RepoFiles = {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
}[];

export type LightFileData = {
  contents: string;
  path: string;
};
export type GetFileContent = (path: string) => Promise<string>;
export type UseFileContentParams = {
  path: string;
};
