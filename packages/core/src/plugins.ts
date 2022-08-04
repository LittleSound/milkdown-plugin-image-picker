import { ModifyImage, image } from '@milkdown/preset-commonmark'
import { commandsCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/core'
import type { NodeView } from '@milkdown/prose/view'
import { defaultUploader } from './defaultUploader'
import { FileInputName } from '.'

const inputHandler = (ctx: Ctx, nodeView: NodeView) => {
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

    const res = await defaultUploader(files)
    if (!res?.src)
      return
    ctx.get(commandsCtx).call(ModifyImage, res.src)
  }
}

export const imageSelection = (): typeof image =>

  image.extend((original, _utils, _options) => {
    return {
      ...original,
      view: ctx => (...args) => {
        // const [node, view, getPos, decorations, innerDecorations] = args

        const viewRes = original.view?.(ctx)?.(...args)
        inputHandler(ctx, viewRes! || {})
        return viewRes!
      },
    }
  })
