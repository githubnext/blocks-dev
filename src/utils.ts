import { useEffect, useState } from "react";
import type { FileBlockProps, FolderBlockProps } from "@utils";

export const allCallbackFunctions = {
  onUpdateMetadata: (metadata) => makeRequest("onUpdateMetadata", { metadata }),
  onNavigateToPath: (path) => makeRequest("onNavigateToPath", { path }),
  onUpdateContent: (content) => makeRequest("onUpdateContent", { content }),
  onRequestGitHubData: (path, params) =>
    makeRequest("onRequestGitHubData", { path, params }),
  onStoreGet: (key) => makeRequest("onStoreGet", { key }),
  onStoreSet: (key, value) => makeRequest("onStoreSet", { key, value }),
  onRequestBlocksRepos: (params) =>
    makeRequest("onRequestBlocksRepos", { params }),
  private__onFetchInternalEndpoint: (path, params) =>
    makeRequest("private__onFetchInternalEndpoint", { path, params }),
};

const filterObject = (obj, filter) => {
  const filtered = {};
  for (const key in obj) {
    if (filter(key)) {
      filtered[key] = obj[key];
    }
  }
  return filtered;
};

export const callbackFunctionsInternal = allCallbackFunctions;
export const callbackFunctions = filterObject(
  allCallbackFunctions,
  (key) => !key.startsWith("private__")
);

export const useHandleCallbacks = (origin: string) => {
  useEvent("message", (event: MessageEvent) => {
    const { data } = event;
    if (event.origin !== origin) return;
    const request = pendingRequests[data.requestId];
    if (!request) return;

    delete pendingRequests[data.requestId];

    if (data.error) {
      request.reject(data.error);
    } else {
      request.resolve(data.response);
    }
  });
};

export const useEvent = (type, onEvent: (event: Event) => void) => {
  useEffect(() => {
    const onEventInstance = (event: Event) => {
      onEvent(event);
    };
    addEventListener(type, onEventInstance);
    return () => removeEventListener(type, onEventInstance);
  }, [type, onEvent]);
};

let uniqueId = 0;
const getUniqueId = () => {
  uniqueId++;
  return uniqueId;
};

export const pendingRequests = {};
export const makeRequest = (type, args) => {
  // for responses to this specific request
  const requestId = type + "--" + getUniqueId();

  postMessage(type, args, { requestId });

  // wait for a responding message to return
  return new Promise((resolve, reject) => {
    pendingRequests[requestId] = { resolve, reject };
    const maxDelay = 1000 * 5;
    window.setTimeout(() => {
      delete pendingRequests[requestId];
      reject(new Error("Timeout"));
    }, maxDelay);
  });
};

export const postMessage = (type, payload, otherArgs = {}) => {
  window.top.postMessage(
    {
      type,
      payload,
      ...otherArgs,
    },
    "*"
  );
};

export const useIframeParentInterface = (
  origin: string
): [Record<string, any>, (_: FileBlockProps | FolderBlockProps) => void] => {
  const [bundleProps, setBundleProps] = useState<Record<string, any>>({});

  useEvent("message", (event: MessageEvent) => {
    const { data } = event;
    if (origin != "*" && event.origin !== origin) return;
    if (data.type === "setProps") {
      // extend existing props so we can update partial props
      setBundleProps((props) => ({
        ...props,
        ...data.props,
      }));
    }
  });

  const onLoad = () =>
    postMessage("loaded", {}, { hash: window.location.hash });
  useEffect(() => {
    onLoad();
  }, []);
  useEvent("hashchange", () => {
    onLoad();
  });

  return [
    bundleProps,
    (props: FileBlockProps | FolderBlockProps) =>
      setBundleProps((prevProps) => ({ ...prevProps, ...{ props } })),
  ];
};
