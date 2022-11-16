import { useIframeParentInterface } from "../utils";
import { Block } from "./Block";
import { ErrorBoundary } from "./ErrorBoundary";
import { SvelteBlock } from "./svelte-block";

type BlockStackType = "svelte" | "react";

const PageWrapper = () => {
  const [bundleProps, setProps] = useIframeParentInterface("*");

  if (bundleProps.bundle === null) return <Message>Block not found</Message>;
  if (!bundleProps.bundle || !bundleProps.props)
    return <Message>Loading...</Message>;

  let stack: BlockStackType = bundleProps.props.block.stack || "react";

  return (
    <ErrorBoundary
      errorKey={[
        bundleProps.props.block.id,
        bundleProps.props.block.owner,
        bundleProps.props.block.repo,
        bundleProps.props.content,
      ].join("-")}
    >
      {stack === "react" && (
        <Block
          key={JSON.stringify(bundleProps.props.block)}
          bundle={bundleProps.bundle}
          props={bundleProps.props}
          setProps={setProps}
        />
      )}
      {stack === "svelte" && (
        <SvelteBlock
          key={JSON.stringify(bundleProps.props.block)}
          bundle={bundleProps.bundle}
          props={bundleProps.props}
          setProps={setProps}
        />
      )}
    </ErrorBoundary>
  );
};

export default PageWrapper;

export const Message = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ddd",
      fontStyle: "italic",
    }}
  >
    <div>{children}</div>
  </div>
);
