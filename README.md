# blocks

Welcome! This package supports local development of custom GitHub Blocks.

# Scripts

Using the `blocks` command, you can run the following commands:

- `start` - Starts a local development environment and builds Blocks bundles.
- `build` - Builds Blocks bundles.

# Utility functions

To reduce the cognitive load associated with writing file and folder block components, we've assembled a helper library that exposes interface definitions and a few helper functions.

## How to use

`yarn add @githubnext/blocks`

```tsx
import {
  FileBlockProps,
  FolderBlockProps,
  getLanguageFromFilename,
  getNestedFileTree,
} from '@githubnext/blocks`
```

## FileBlockProps

```tsx
import { FileBlockProps } from '@githubnext/blocks';

export default function (props: FileBlockProps) {
  const { content, metadata, onUpdateMetadata } = props;
  ...
}
```

## FolderBlockProps

```tsx
import { FolderBlockProps } from '@githubnext/blocks';

export default function (props: FileBlockProps) {
  const { tree, metadata, onUpdateMetadata, BlockComponent } = props;
  ...
}
```

## getLanguageFromFilename

A helper function that returns the "language" of a file, given a valid file path with extension.

## getNestedFileTree

A helper function to turn the flat folder `tree` array into a nested tree structure

import { FolderBlockProps, getNestedFileTree, } from "@githubnext/blocks";

```tsx
export default function (props: FolderBlockProps) {
  const { tree, onNavigateToPath } = props;

  const data = useMemo(() => {
    const nestedTree = getNestedFileTree(tree)[0]
    return nestedTree
  }, [tree])
  ...
}
```

## bundleCodesandboxFiles

A helper function to generate a bundle of files to send to CodeSandbox's Sandpack library. For an example, see the [custom Block template repo](https://github.com/githubnext/blocks-template/blob/main/src/components/production-block.tsx).

## onRequestGitHubData

A helper function to handle the `onRequestGitHubData` callback for Blocks. This function will GET data from any GitHub API endpoint.
