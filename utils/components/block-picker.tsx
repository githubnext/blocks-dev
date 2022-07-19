import { tw } from "twind";
import {
  InfoIcon,
  LinkExternalIcon,
  RepoIcon,
  SearchIcon,
  VerifiedIcon,
} from "@primer/octicons-react";
import { ActionList, ActionMenu, Box, Link, Text, TextInput } from "@primer/react";
import React, { useRef } from "react" // we need to import this for proper bundling
import { useEffect, useState, ReactNode } from "react"
import { Block, BlocksRepo, CommonBlockProps } from "../types"
import { useDebounce } from "use-debounce";

type BlockPickerProps = {
  value: Block,
  onChange: (block: Block) => void,
  onRequestBlocksRepos: CommonBlockProps["onRequestBlocksRepos"],
  children: ReactNode,
}
export const BlockPicker = ({
  value,
  onChange,
  onRequestBlocksRepos,
  children,
}: BlockPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const currentSearchTerm = useRef(searchTerm);
  const [blocks, setBlocks] = useState([])
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("loading");

  const lowerSearchTerm = searchTerm.toLowerCase();
  let [debouncedSearchTerm] = useDebounce(lowerSearchTerm, 300);

  // allow user to search for Blocks on a specific repo
  const isSearchTermUrl = debouncedSearchTerm.includes("github.com");
  const [searchTermOwner, searchTermRepo] = (debouncedSearchTerm || "")
    .split("/")
    .slice(3);

  useEffect(() => { currentSearchTerm.current = searchTerm; }, [searchTerm]);

  const fetchBlocks = async () => {
    setStatus("loading");
    const blocksRepos = await onRequestBlocksRepos(
      debouncedSearchTerm.includes("github.com")
        ? { repoUrl: debouncedSearchTerm }
        : { searchTerm: debouncedSearchTerm }
    )
    // make sure we're not updating with stale data
    if (currentSearchTerm.current !== debouncedSearchTerm) return;
    if (!blocksRepos) {
      setBlocks([]);
      setStatus("error");
      return;
    }
    const blocks = blocksRepos.reduce((acc: Block[], repo: BlocksRepo) => {
      return [...acc, ...repo.blocks.map(block => ({ ...block, owner: repo.owner, repo: repo.repo }))]
    }, [])
    // @ts-ignore
    setBlocks(blocks)
    setStatus("success")
  }
  useEffect(() => { fetchBlocks() }, [onRequestBlocksRepos, debouncedSearchTerm])

  return (
    <ActionMenu open={isOpen} onOpenChange={setIsOpen}>
      <ActionMenu.Button aria-expanded={isOpen} disabled={!blocks}>
        {children || `Block: ${value?.title || value?.id || "..."}`}
      </ActionMenu.Button>

      <ActionMenu.Overlay width="large">
        <div className={tw("px-3 pt-3 w-full")}>
          <TextInput
            value={searchTerm}
            leadingVisual={SearchIcon}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blocks or paste repo URL"
            className={tw("!pl-2 w-full")}
          />
        </div>
        {status === "loading" ? (
          <div className={tw("px-3 py-6 mb-1 w-full text-center italic")}>
            <Text color="fg.muted" className={tw("px-5 pb-3")}>
              {isSearchTermUrl ? (
                <>
                  Loading Blocks from the{" "}
                  <strong>
                    {searchTermOwner}/{searchTermRepo}
                  </strong>{" "}
                  repository
                </>
              ) : "Loading..."}
            </Text>
          </div>
        ) : status === "error" ? (
          <div className={tw("py-5 mb-1 w-full text-center flex flex-col items-center")}>
            <Text color="fg.muted" className={tw("px-5 pb-3")}>
              {isSearchTermUrl ? (
                <>
                  We weren't able to find the{" "}
                  <strong>
                    {searchTermOwner}/{searchTermRepo}
                  </strong>{" "}
                  repo. If it's private, make sure our GitHub App has access to it.
                </>
              ) : "We weren't able to find any Blocks matching your search."}
            </Text>
          </div>
        ) : !blocks?.length ? (
          <div className={tw("pt-5 pb-3 w-full text-center flex flex-col items-center")}>
            <Text color="fg.muted" className={tw("px-5")}>
              {isSearchTermUrl ? (
                <>
                  We weren't able to find any Blocks in{" "}
                  <strong>
                    {searchTermOwner}/{searchTermRepo}
                  </strong>
                  .
                </>
              ) : "We weren't able to find any Blocks matching your search."}
            </Text>
          </div>
        ) : (
          <ActionList>
            {/* @ts-ignore */}
            <ActionList.Group title="Blocks" selectionVariant="single">
              <div className={tw("max-h-[22em] overflow-auto")}>
                {blocks.map((block) => {
                  return (
                    <BlockItem
                      // @ts-ignore
                      key={block.entry}
                      block={block}
                      value={value}
                      onChange={(block) => {
                        onChange(block);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                    />
                  );
                })}
              </div>
            </ActionList.Group>
          </ActionList>
        )}
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

const BlockItem = ({
  block,
  value,
  onChange,
}: {
  block: Block;
  value: Block;
  onChange: (newType: Block) => void;
}) => {
  const repoFullName = `${block.owner}/${block.repo}`;
  const isExampleBlock = repoFullName === `githubnext/blocks-examples`;
  const isSelected = block.id === value?.id;
  return (
    <ActionList.Item
      selected={isSelected}
      className={tw("group py-2")}
      onSelect={() => {
        onChange(block);
      }}
    >
      <div className={tw("flex justify-between")}>
        <div className={tw("font-semibold")}>{block.title}</div>

        <Link
          href={`https://github.com/${repoFullName}`}
          className={tw("text-xs mt-[2px] opacity-0 focus:opacity-100 group-hover:opacity-100")}
          target="_blank"
          rel="noopener noreferrer"
          color="fg.muted"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Text className={tw("flex items-center")} color="fg.muted">
            View code
            <LinkExternalIcon className={tw("ml-1 opacity-50")} />
          </Text>
        </Link >
      </div >
      {/* @ts-ignore */}
      < ActionList.Description variant="block" >
        <Box className={tw("flex items-center mt-1")}>
          <Text className={tw("mr-1")} color="fg.muted">
            <RepoIcon />
          </Text>
          <Text color="fg.muted">
            {repoFullName}
            {isExampleBlock && (
              <Text ml={1} color="ansi.blue">
                <VerifiedIcon />
              </Text>
            )}
          </Text>
        </Box>
        <div className={tw("flex items-start mt-1")}>
          <div className={tw("mr-1")}>
            <InfoIcon />
          </div>
          {block.description}
        </div>
      </ActionList.Description >
    </ActionList.Item >
  );
};

