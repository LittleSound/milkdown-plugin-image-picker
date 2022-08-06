import { InsertImage, ModifyImage, image } from '@milkdown/preset-commonmark'
import { commandsCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/core'
import type { NodeView } from '@milkdown/prose/view'
import type { Uploader } from './defaultUploader'
import { defaultUploader } from './defaultUploader'
import { FileInputName } from '.'

export interface ImageOptions {
  uploader?: Uploader
}

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

export const imagePickerPreset = ({
  uploader = defaultUploader,
}: ImageOptions = {}): typeof image =>
  image.extend((original, _utils, _options) => {
    return {
      ...original,
      view: ctx => (...args) => {
        // const [node, view, getPos, decorations, innerDecorations] = args

        const viewRes = original.view?.(ctx)?.(...args)
        inputHandler(ctx, viewRes! || {}, uploader)
        return viewRes!
      },
    }
  })
