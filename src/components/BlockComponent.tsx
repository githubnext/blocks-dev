import { useEffect, useState } from "react";
import type { Block, FileContext, FolderContext } from "@utils";
import { makeRequest } from "../utils";

export type BlockComponentProps = {
  context: FileContext | FolderContext;
  block: Block;
};
export const BlockComponent = ({
  block: { owner, repo, id },
  context,
}: BlockComponentProps) => {
  const block = { owner, repo, id };

  const [url, setUrl] = useState<string | undefined>(
    (block as any).__blockComponentUrl
  );
  useEffect(() => {
    if (!url) {
      makeRequest("__onFetchBlockComponentUrl", { block }).then((url) =>
        setUrl(url as string)
      );
    }
  }, [JSON.stringify(block)]);
  if (!url) return null;

  const hash = encodeURIComponent(JSON.stringify({ block, context }));
  return (
    <iframe
      src={`${url}#${hash}`}
      sandbox={"allow-scripts allow-same-origin allow-forms allow-downloads"}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  );
};
