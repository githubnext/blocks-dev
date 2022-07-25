import type {
  Block as BlockType,
  FileBlockProps,
  FolderBlockProps,
} from "@utils";
import loadable from "@loadable/component";
import * as PrimerReact from "@primer/react";
import { BaseStyles, ThemeProvider } from "@primer/react";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  callbackFunctions,
  callbackFunctionsInternal,
  useHandleCallbacks,
} from "../utils";
import { BlockComponentProps, BlockComponent } from "./BlockComponent";

const Bundle = ({ bundle }: { bundle: Asset[] }) => {
  useEffect(() => {
    const elements: HTMLElement[] = [];

    bundle.forEach((asset) => {
      if (asset.name.endsWith(".js")) {
        const jsElement = document.createElement("script");
        jsElement.textContent = `
var BlockBundle = ({ React, ReactDOM, PrimerReact }) => {
  function require(name) {
    switch (name) {
      case "react":
        return React;
      case "react-dom":
        return ReactDOM;
      case "@primer/react":
      case "@primer/components":
          return PrimerReact;
      default:
        console.log("no module '" + name + "'");
        return null;
    }
  }
${asset.content}
  return BlockBundle;
};`;

        elements.push(jsElement);
      } else if (asset.name.endsWith(".css")) {
        const cssElement = document.createElement("style");
        cssElement.textContent = asset.content;
        elements.push(cssElement);
      }
    });

    for (const el of elements) {
      document.body.appendChild(el);
    }
    return () => {
      for (const el of elements) {
        document.body.removeChild(el);
      }
    };
  }, [bundle]);

  return null;
};

export const Block = ({
  bundle,
  props,
  setProps,
}: {
  bundle: Asset[];
  props: FileBlockProps | FolderBlockProps;
  setProps: (props: FileBlockProps | FolderBlockProps) => void;
}) => {
  const [Block, setBlock] = useState<BlockType | undefined>(undefined);

  useEffect(() => {
    if (bundle.length === 0) {
      const importPrefix = "../../../../../";
      const imports = import.meta.glob("../../../../../blocks/**");
      const importPath = importPrefix + props.block.entry;
      const importContent = imports[importPath];
      // @ts-ignore
      const content = loadable(importContent);
      // @ts-ignore
      setBlock(content);
    } else {
      setBlock(
        () => window.BlockBundle({ React, ReactDOM, PrimerReact }).default
      );
    }
  }, []);

  useHandleCallbacks("*");

  const onUpdateContent = useCallback(
    (content: string) => {
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
    (nestedProps: BlockComponentProps) => {
      let context = {
        ...props.context,
        ...nestedProps.context,
      };

      // clear sha if viewing content from another repo
      const parentRepo = [props.context.owner, props.context.repo].join("/");
      const childRepo = [context.owner, context.repo].join("/");
      const isSameRepo = parentRepo === childRepo;
      if (!isSameRepo) {
        context.sha = nestedProps.context.sha || "HEAD";
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
      {bundle.length > 0 && <Bundle bundle={bundle} />}

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
