import { useEffect, useRef, useState } from "react";
import { createApp } from "vue";
import { FileBlockProps, FolderBlockProps } from "../../utils/types";
import { useHandleCallbacks } from "../utils";
import { Message } from "./PageWrapper";

interface VueBlockProps {
  bundle: Asset[];
  props: FileBlockProps | FolderBlockProps;
  setProps: (props: FileBlockProps | FolderBlockProps) => void;
}

function VueBlockInner({
  module,
  ...rest
}: { module: any } & VueBlockProps["props"]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    console.info("Initializing Vue block with the following props", {
      ...rest,
    });

    const app = createApp(module.default);
    app.mount(ref.current);

    return () => {
      app.unmount();
    };
  }, [module]);
  return <div ref={ref}></div>;
}

export function VueBlock(props: VueBlockProps) {
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

  return <VueBlockInner {...props.props} module={module} />;
}
