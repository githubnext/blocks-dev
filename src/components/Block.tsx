import type {
  Block as BlockType,
  FileBlockProps,
  FolderBlockProps,
} from "@utils";
import loadable from "@loadable/component";
import { BaseStyles, ThemeProvider } from "@primer/react";
import { useCallback, useEffect, useState } from "react";
import {
  callbackFunctions,
  callbackFunctionsInternal,
  useHandleCallbacks,
} from "../utils";
import { BlockComponent } from "./BlockComponent";

export const Block = ({
  props,
  setProps,
}: {
  props: FileBlockProps | FolderBlockProps;
  setProps: (props: FileBlockProps | FolderBlockProps) => void;
}) => {
  const [Block, setBlock] = useState<BlockType>(undefined);

  const getContents = async () => {
    const importPrefix = "../../../../../";
    const imports = import.meta.glob("../../../../../blocks/**");
    const importPath = importPrefix + props.block.entry;
    const importContent = imports[importPath];
    const content = await loadable(importContent);
    setBlock(content);
  };
  useEffect(() => {
    getContents();
  }, [props.block.entry]);

  useHandleCallbacks("*");

  const onUpdateContent = useCallback(
    (content) => {
      // the app does not send async content updates back to the block that
      // originated them, to avoid overwriting subsequent changes; we update the
      // content locally so controlled components work. this doesn't overwrite
      // subsequent changes because it's synchronous.
      setProps({ ...props, content });
      callbackFunctions["onUpdateContent"](content);
    },
    [props, setProps]
  );

  const WrappedBlockComponent = useCallback(
    (nestedProps) => {
      let context = {
        ...props.context,
        ...nestedProps.context,
      };

      // clear sha if viewing content from another repo
      const parentRepo = [props.context.owner, props.context.repo].join("/");
      const childRepo = [context.owner, context.repo].join("/");
      const isSameRepo = parentRepo === childRepo;
      if (!isSameRepo) {
        context.sha = nestedProps.sha || "HEAD";
      }

      return <BlockComponent {...nestedProps} context={context} />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(props.context)]
  );

  const isInternal =
    (props as unknown as { block: BlockType }).block.owner === "githubnext";
  const filteredCallbackFunctions = isInternal
    ? callbackFunctionsInternal
    : callbackFunctions;

  return (
    <>
      {Block && props && (
        // @ts-ignore
        <ThemeProvider>
          <BaseStyles
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            {/* @ts-ignore */}
            <Block
              {...props}
              {...filteredCallbackFunctions}
              onUpdateContent={onUpdateContent}
              BlockComponent={WrappedBlockComponent}
            />
          </BaseStyles>
        </ThemeProvider>
      )}
    </>
  );
};
