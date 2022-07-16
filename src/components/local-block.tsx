import { useCallback, useEffect, useState } from "react";
import { operations } from "@octokit/openapi-types";
// @ts-ignore
import loadable from "@loadable/component";
import {
  FileContext,
  FolderContext,
  RepoFiles,
  onRequestGitHubData as onRequestGitHubDataFetch,
  CommonBlockProps,
} from "@utils";
import { ThemeProvider, BaseStyles } from "@primer/react";
// @ts-ignore
import pm from "picomatch-browser";

interface Block {
  id: string;
  type: string;
  title: string;
  description: string;
  entry: string;
  extensions?: string[];
  matches?: string[];
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

const PAT = import.meta.env.VITE_GITHUB_PAT;

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
  }, [blockKey]);

  const getContents = async () => {
    const importPrefix = "../../../../../";
    const imports = import.meta.glob("../../../../../blocks/**");
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
  const onRequestBlocksRepos = async (params: Parameters<CommonBlockProps["onRequestBlocksRepos"]>[0] = {}) => {
    styledLog(`Triggered a request to fetch blocks repos`);

    let repos = []
    // allow user to search for Blocks on a specific repo
    const isSearchTermUrl = !!params.repoUrl
    if (isSearchTermUrl) {
      const [searchTermOwner, searchTermRepo] = (params.repoUrl || "")
        .split("/")
        .slice(3);
      const repo = await onRequestGitHubData(`/repos/${searchTermOwner}/${searchTermRepo}`, {}, PAT)
      repos = [repo];
    } else {
      type searchData = operations["search/repos"]["responses"][200]["content"]["application/json"]
      const query = [
        "topic:github-blocks",
        // we'll need to filter the search when the list is longer than a page
        // params.searchTerm ? `${params.searchTerm} in:readme` : "",
      ].filter(Boolean).join(" ");
      const data: searchData = await onRequestGitHubDataFetch("/search/repositories", {
        q: query,
        order: "desc",
        sort: "updated",
        per_page: params.searchTerm ? 10 : 50,
      }, PAT);
      repos = data.items
    }
    const blocksRepos = await Promise.all(repos.map(async (repo) => {
      const { owner, name } = repo;
      if (!owner) return null
      let blocks = null as Block[] | null
      try {
        const blocksConfig = await onRequestGitHubDataFetch(`/repos/${owner.login}/${name}/contents/blocks.config.json/`, {
          ref: "HEAD"
        }, PAT);
        blocks = JSON.parse(atob(blocksConfig.content));
      } catch (e) {
        try {
          const packageJSONConfig = await onRequestGitHubDataFetch(`/repos/${owner.login}/${name}/contents/package.json/`, {
            ref: "HEAD"
          }, PAT);
          blocks = JSON.parse(atob(packageJSONConfig.content)).blocks;
        } catch (e) {
          return null;
        }
      }
      if (!blocks) return null;
      return {
        owner: owner.login,
        repo: name,
        full_name: repo.full_name,
        id: repo.id,
        html_url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        watchers: repo.watchers_count,
        language: repo.language,
        topics: repo.topics,

        blocks: blocks
          .filter((block: Block) => {
            if (params.type && block.type !== params.type) return false;

            if (params.searchTerm) {
              const lowerSearchTerm = params.searchTerm.toLowerCase();
              if (![block.title, block.description].join("\n").toLocaleLowerCase().includes(lowerSearchTerm)) {
                return false;
              }
            }

            if (params.path === undefined) return true;
            if (!!block.matches) {
              return pm(block.matches, { bash: true, dot: true })(params.path);
            }

            if (block.extensions) {
              const extension = params.path.split(".").pop();
              return (
                block.extensions.includes("*") || block.extensions.includes(extension || "")
              );
            }

            return true;

          })
          .map((block: Block) => ({
            ...block,
            owner: repo.owner?.login,
            repo: repo.name,
            repoId: repo.id,
          })),
      };
    }))
    return blocksRepos.filter(Boolean);
  };

  const onStoreGet = async (key: string) => {
    styledLog(`Triggered store get: ${key}`);
    window.postMessage(
      {
        type: "store-get--request",
        key,
      },
      "*"
    );
    const value = kvStore[blockKey][key];
    window.postMessage(
      {
        type: "store-get--response",
        value,
      },
      "*"
    );
    return value;
  };

  const onStoreSet = async (key: string, value: any) => {
    styledLog(`Triggered store set: ${key} = ${JSON.stringify(value)}`);
    window.postMessage(
      {
        type: "store-set",
        key,
        value,
      },
      "*"
    );
    if (value === undefined) delete kvStore[blockKey][key];
    else kvStore[blockKey][key] = JSON.parse(JSON.stringify(value));
  };

  if (!Block) return null;
  return (
    // @ts-ignore
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
          onRequestBlocksRepos={onRequestBlocksRepos}
          onStoreGet={onStoreGet}
          onStoreSet={onStoreSet}
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
