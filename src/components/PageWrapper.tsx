import { useIframeParentInterface } from "../utils";
import { Block } from "./Block";
import { ErrorBoundary } from "./ErrorBoundary";

const PageWrapper = () => {
  const [bundleProps, setProps] = useIframeParentInterface("*");
  const props = bundleProps.props;

  if (!props) return LoadingIndicator;

  return (
    <ErrorBoundary
      errorKey={[
        props.block.id,
        props.block.owner,
        props.block.repo,
        props.block.content,
      ].join("-")}
    >
      <Block
        key={JSON.stringify(props.block)}
        props={props}
        setProps={setProps}
      />
    </ErrorBoundary>
  );
};

export default PageWrapper;

const LoadingIndicator = (
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
    <div>Loading...</div>
  </div>
);
