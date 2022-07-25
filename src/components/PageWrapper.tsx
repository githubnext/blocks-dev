import { useIframeParentInterface } from "../utils";
import { Block } from "./Block";
import { ErrorBoundary } from "./ErrorBoundary";

const PageWrapper = () => {
  const [bundleProps, setProps] = useIframeParentInterface("*");

  if (bundleProps.bundle === null) return <Message>Block not found</Message>;
  if (!bundleProps.bundle || !bundleProps.props)
    return <Message>Loading...</Message>;

  return (
    <ErrorBoundary
      errorKey={[
        bundleProps.props.block.id,
        bundleProps.props.block.owner,
        bundleProps.props.block.repo,
        bundleProps.props.content,
      ].join("-")}
    >
      <Block
        key={JSON.stringify(bundleProps.props.block)}
        bundle={bundleProps.bundle}
        props={bundleProps.props}
        setProps={setProps}
      />
    </ErrorBoundary>
  );
};

export default PageWrapper;

const Message = ({ children }: { children: React.ReactNode }) => (
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
