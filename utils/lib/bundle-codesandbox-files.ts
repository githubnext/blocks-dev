import uniqueId from "lodash.uniqueid";

type Block = {
  id: string;
  type: string;
  title: string;
  description: string;
  entry: string;
  extensions?: string[];
};

interface BundleCode {
  name: string;
  content: string;
}
export const bundleCodesandboxFiles = ({
  block,
  bundleCode,
  id,
}: {
  block: Block;
  bundleCode: BundleCode[];
  id: string;
}) => {
  const fileName = (block.entry.split("/").pop() || "index.js")
    .replace(".ts", ".js")
    .replace(".jsx", ".js");
  const contentWithUpdatedNames = bundleCode.map(({ name, content }) => ({
    name: name.slice(block.id.length + 1),
    content,
  }));
  const scriptFile = contentWithUpdatedNames?.find((f) => f.name === fileName);
  const mainContent = scriptFile?.content || "";
  const otherFilesContent = contentWithUpdatedNames.filter(
    (f) => f.name !== fileName
  );

  const cssFiles = otherFilesContent.filter((f) => f.name.endsWith(".css"));
  const cssFilesString = cssFiles
    .map((f) => `<style>${f.content}</style>`)
    .join("\n");
  const otherFilesContentProcessed = [
    {
      name: "/public/index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Custom block</title>
</head>
<body>
${cssFilesString}
<div id="root"></div>
</body>
</html>`,
    },
    ...otherFilesContent.filter((f) => !f.name.endsWith(".css")),
  ];

  let otherFiles = otherFilesContentProcessed.reduce(
    (acc, { name, content }) => {
      acc[name] = content;
      return acc;
    },
    {} as any
  );

  const injectedSource = `
  import React from "react";
  import ReactDOM from "react-dom";
  import ReactDOMServer from "react-dom/server";
  import { ThemeProvider, BaseStyles } from "@primer/react";

  ${mainContent}
  const Block = BlockBundle.default;

  const onUpdateMetadata = (newMetadata) => {
    window.parent.postMessage({
      type: "update-metadata",
      id: "${id}",
      metadata: newMetadata,
    }, "*")
  }

  const onNavigateToPath = (path) => {
    window.parent.postMessage({
      type: "navigate-to-path",
      id: "${id}",
      path,
    }, "*")
  }

  const onUpdateContent = (content) => {
    window.parent.postMessage({
      type: "update-file",
      id: "${id}",
      content: content
    }, "*")
  }

  const pendingRequests = {};

  let uniqueId = 0
  const getUniqueId = () => {
    uniqueId++
    return uniqueId
  }

  const onRequestGitHubData = (path, params) => {
    // for responses to this specific request
    const requestId = "${uniqueId("github-data--request--")}--" + getUniqueId()

    window.parent.postMessage({
      type: "github-data--request",
      id: "${id}",
      requestId,
      path,
      params,
    }, "*");

    return new Promise((resolve, reject) => {
      pendingRequests[requestId] = { resolve, reject };
      const maxDelay = 1000 * 5;
      window.setTimeout(() => {
        delete pendingRequests[requestId];
        reject(new Error("Timeout"));
      }, maxDelay);
    });
  };

  export default function WrappedBlock() {
    const [props, setProps] = React.useState(null);

    React.useEffect(() => {
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== "${window.location.origin}") return;
        if (event.data.id !== "${id}") return;

        switch (event.data.type) {
          case "set-props":
            setProps(event.data.props);
            break;

          case "github-data--response":
            const request = pendingRequests[event.data.requestId];
            if (!request) return;
            delete pendingRequests[event.data.requestId];

            if ('error' in event.data) {
              request.reject(event.data.error);
            } else {
              request.resolve(event.data.data);
            }
            break;
        }
      };

      window.addEventListener("message", onMessage);
      window.parent.postMessage(
        { type: "sandbox-ready", id: "${id}" },
        "*"
      )
      return () => { window.removeEventListener("message", onMessage); }
    }, []);

    return props && (
      <ThemeProvider>
        <BaseStyles>
          <Block
            // recreate the block if we change file or version
            key={props.context.sha}
            {...props}
            onUpdateMetadata={onUpdateMetadata}
            onNavigateToPath={onNavigateToPath}
            onUpdateContent={onUpdateContent}
            onRequestUpdateContent={onUpdateContent} // for backwards compatibility
            onRequestGitHubData={onRequestGitHubData}
          />
        </BaseStyles>
      </ThemeProvider>
    );
  }
  `;

  return {
    ...otherFiles,
    "/App.js": injectedSource,
    "/sandbox.config.json": JSON.stringify({ infiniteLoopProtection: false }),
  };
};
