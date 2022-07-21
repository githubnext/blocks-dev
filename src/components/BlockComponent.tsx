import type { Block, FileContext, FolderContext } from "@utils";

export type BlockComponentProps = {
  context: FileContext | FolderContext;
  block: Block;
};
export const BlockComponent = ({ block, context }: BlockComponentProps) => {
  const { owner, repo, id, type } = block;
  const hash = encodeURIComponent(
    JSON.stringify({ block: { owner, repo, id, type }, context })
  );
  return (
    <iframe
      src={`/#${hash}`}
      sandbox={"allow-scripts allow-same-origin allow-forms allow-downloads"}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
