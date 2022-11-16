import { useEffect, useRef, useState } from "react";
import { FileBlockProps, FolderBlockProps } from "../../utils/types";
import { useHandleCallbacks } from "../utils";
import { Message } from "./PageWrapper";

interface SvelteBlockProps {
  bundle: Asset[];
  props: FileBlockProps | FolderBlockProps;
  setProps: (props: FileBlockProps | FolderBlockProps) => void;
}

function SvelteBlockInner({ module }: { module: any }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    const svelte = new module.default({
      target: ref.current,
      props: {},
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

  return <SvelteBlockInner module={module} />;
}
