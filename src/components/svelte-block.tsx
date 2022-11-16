import { useEffect, useRef, useState } from "react";
import { FileBlockProps, FolderBlockProps } from "../../utils/types";
import { useHandleCallbacks } from "../utils";
import { Message } from "./PageWrapper";

interface SvelteBlockProps {
  bundle: Asset[];
  props: FileBlockProps | FolderBlockProps;
  setProps: (props: FileBlockProps | FolderBlockProps) => void;
}

function SvelteBlockInner({
  module,
  ...rest
}: { module: any } & SvelteBlockProps["props"]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    console.info("Initializing Svelte block with the following props", {
      ...rest,
    });

    const svelte = new module.default({
      target: ref.current,
      props: {
        ...rest,
      },
    });
    return () => {
      svelte.$destroy();
    };
  }, [module]);
  return <div ref={ref}></div>;
}

export function SvelteBlock(props: SvelteBlockProps) {
  // todo(Matt): figure out the type of the Vite imported module.
  const [module, setModule] = useState<any>();

  useHandleCallbacks("*");

  useEffect(() => {
    const handleMount = async () => {
      const importPrefix = "../../../../../";
      const imports = import.meta.glob("../../../../../blocks/**");
      const importPath = importPrefix + props.props.block.entry;
      const importContent = imports[importPath];
      let module = await importContent();
      console.log(module);
      setModule(module);
    };
    handleMount();
  }, []);

  if (!module) return <Message>Loading...</Message>;

  return <SvelteBlockInner {...props.props} module={module} />;
}
