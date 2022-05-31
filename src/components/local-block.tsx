import { useCallback, useEffect, useRef, useState } from "react";
// @ts-ignore
import loadable from "@loadable/component";
import {
  FileContext,
  FolderContext,
  RepoFiles,
  onRequestGitHubData as onRequestGitHubDataFetch,
} from "@utils";
import { ThemeProvider, BaseStyles } from "@primer/react";

interface Block {
  id: string;
  type: string;
  title: string;
  description: string;
  entry: string;
  extensions?: string[];
  owner?: string;
  repo?: string;
}
interface LocalBlockProps {
  block: Block;
  content?: string;
  tree?: RepoFiles;
  metadata?: any;
  context: FileContext | FolderContext;
}

const kvStore: any = {};

const getBlockKey = (block: Block) =>
  [block?.owner, block?.repo, block?.id || ""].join("__");

export const LocalBlock = (props: LocalBlockProps) => {
  const {
    block,
    content: originalContent,
    tree,
    metadata = {},
    context,
  } = props;
  const [content, setContent] = useState<string>(originalContent || "");
  const [Block, setBlock] = useState<React.ComponentType<any> | null>(null);
  const blockKey = getBlockKey(block);

  useEffect(() => {
    if (!(blockKey in kvStore)) {
      kvStore[blockKey] = {};
    }
  });

  const getContents = async () => {
    const importPrefix = "../../../../../";
    const imports = import.meta.glob(`../../../../../blocks/**`);
    const importPath = importPrefix + block.entry;
    const importContent = imports[importPath];
    const content = await loadable(importContent);
    setBlock(content);
  };
  useEffect(() => {
    getContents();
  }, [block.entry]);

  const onUpdateMetadata = (newMetadata: any) => {
    styledLog(`Triggered a request to update the file metadata`);
    styledLog("From:", metadata);
    styledLog("To:", newMetadata);
    window.postMessage(
      {
        type: "update-metadata",
        metadata: newMetadata,
      },
      "*"
    );
  };
  const onNavigateToPath = useCallback((path: string) => {
    styledLog(`Triggered a navigation to the file/folder: ${path}`);
    window.postMessage(
      {
        type: "navigate-to-path",
        path,
      },
      "*"
    );
  }, []);
  const onRequestGitHubData = async (
    path: string,
    params: Record<string, any> = {},
    id: string = ""
  ) => {
    styledLog(`Triggered a request to fetch data from GitHub: ${path}`);
    window.postMessage(
      {
        type: "github-data--request",
        id,
        path,
        params,
      },
      "*"
    );
    const PAT = import.meta.env.VITE_GITHUB_PAT;
    const data = await onRequestGitHubDataFetch(path, params, PAT);
    window.postMessage(
      {
        type: "github-data--response",
        id,
        data,
      },
      "*"
    );
    return data;
  };

  const onKVGet = async (key: string) => {
    styledLog(`Triggered KV get: ${key}`);
    window.postMessage(
      {
        type: "kv-get--request",
        key,
      },
      "*"
    );
    const value = kvStore[blockKey][key];
    window.postMessage(
      {
        type: "kv-get--response",
        value,
      },
      "*"
    );
    return value;
  };

  const onKVSet = async (key: string, value: any) => {
    styledLog(`Triggered KV set: ${key} = ${JSON.stringify(value)}`);
    window.postMessage(
      {
        type: "kv-set",
        key,
        value,
      },
      "*"
    );
    kvStore[blockKey][key] = JSON.parse(JSON.stringify(value));
  };

  const onKVDelete = async (key: string) => {
    styledLog(`Triggered KV delete: ${key}`);
    window.postMessage(
      {
        type: "kv-delete",
        key,
      },
      "*"
    );
    delete kvStore[blockKey][key];
  };

  if (!Block) return null;
  return (
    <ThemeProvider>
      <BaseStyles style={{ height: "100%" }}>
        <Block
          context={context}
          content={content}
          originalContent={originalContent}
          isEditable={true}
          tree={tree}
          metadata={metadata}
          onUpdateMetadata={onUpdateMetadata}
          onNavigateToPath={onNavigateToPath}
          onUpdateContent={setContent}
          onRequestGitHubData={onRequestGitHubData}
          onKVGet={onKVGet}
          onKVSet={onKVSet}
          onKVDelete={onKVDelete}
        />
      </BaseStyles>
    </ThemeProvider>
  );
};

function styledLog(...args: any[]) {
  const argsWithColor = args.reduce((acc, arg) => {
    if (typeof arg === "string") {
      return [
        ...acc,
        `%cℹ ${arg}`,
        "color: #444763; background-color: #e5eafe; padding: 0.2em; display: inline-block",
      ];
    }
    return [...acc, arg];
  }, [] as any[]);
  console.info(...argsWithColor);
}
