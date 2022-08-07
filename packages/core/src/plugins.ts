import type { ImageOptions as NativeImageOptions } from '@milkdown/preset-commonmark'
import { InsertImage, ModifyImage, image } from '@milkdown/preset-commonmark'
import { commandsCtx } from '@milkdown/core'
import type { Ctx, ThemeImageType } from '@milkdown/core'
import type { NodeView } from '@milkdown/prose/view'
import type { NodeCreator } from '@milkdown/utils'
import type { Uploader } from './defaultUploader'
import { defaultUploader } from './defaultUploader'
import { FileInputName } from '.'

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

const id = 'image'

const inputHandler = (ctx: Ctx, nodeView: NodeView, uploader: Uploader) => {
  const dom = nodeView?.dom as HTMLElement
  if (!('getElementsByClassName' in nodeView?.dom))
    return

  const input = dom.getElementsByClassName(FileInputName)[0] as HTMLInputElement
  if (!input)
    return
  input.oninput = async (e) => {
    const files = (e.target as HTMLInputElement)?.files
    if (!files || !files.length)
      return

    const res = await uploader(files)
    const first = res.shift()
    if (first?.src)
      ctx.get(commandsCtx).call(ModifyImage, first.src)

    if (res.length)
      res.forEach(image => ctx.get(commandsCtx).call(InsertImage, image.src))
  }
}

export const imagePickerPreset = (): NodeCreator<string, ImageOptions> =>
  image.extend((original, utils, options) => {
    const {
      multiple = true,
      accept = 'image/*',
      uploader = defaultUploader,
    } = options || {}

    return {
      ...original,
      view: ctx => (node) => {
        let currNode = node

        const placeholder = options?.placeholder ?? 'Add an Image'
        const isBlock = options?.isBlock ?? false
        const renderer = utils.themeManager.get<ThemeImageType>('image', {
          placeholder,
          isBlock,

          // Expand
          ...{
            multiple,
            accept,
          } as any,
        })

        if (!renderer)
          return {} as NodeView

        const { dom, onUpdate } = renderer
        onUpdate(currNode)

        inputHandler(ctx, { dom }! || {}, uploader)

        return {
          dom,
          update: (updatedNode) => {
            if (updatedNode.type.name !== id)
              return false

            currNode = updatedNode
            onUpdate(currNode)

            return true
          },
          selectNode: () => {
            dom.classList.add('ProseMirror-selectednode')
          },
          deselectNode: () => {
            dom.classList.remove('ProseMirror-selectednode')
          },
        }
      },
    }
  })
