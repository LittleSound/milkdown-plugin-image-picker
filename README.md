# Image Picker for [Milkdown](https://milkdown.dev/)

Add support for select and upload pictures from file picker

<!-- ![Screenshots](components.png) -->

![Demo](https://github.com/LittleSound/milkdown-plugin-image-picker/raw/main/demo.gif)

## Install

```shell
npm i milkdown-plugin-image-picker
```

## Example Usage

```ts
import { Editor } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark, image } from '@milkdown/preset-commonmark'

import {
  imagePickerPreset,
  imagePickerView
} from 'milkdown-plugin-image-picker'

Editor.make()
  .use(nord.override(imagePickerView))
  .use(commonmark.replace(image, imagePickerPreset()()))
  .create()
```

### Setup Uploader

```ts
import type { Uploader } from 'milkdown-plugin-image-picker'

const uploader: Uploader = async (files: FileList) => {
  /* Code */
}

Editor/* ... */.use(commonmark.replace(image, imagePickerPreset()({
  uploader,
})))
```

### Options Type

```ts
import type { ImageOptions as NativeImageOptions } from '@milkdown/preset-commonmark'

export type ImageOptions = NativeImageOptions & {
  /**
   * Setup image upload function.
   * @default defaultUploader
   */
  uploader: Uploader
  /**
   * ### Allows the user to select more than one file.
   * @default true
   */
  multiple: boolean
  /**
   * ### Accept is native properties of the file type input box.
   * A comma-separated list of [unique file type specifiers](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers).
   * @default 'image/*'
   */
  accept: string
}
```
