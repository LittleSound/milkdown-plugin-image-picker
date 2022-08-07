import type { Emotion, Icon, ThemeImageType, ThemeManager } from '@milkdown/core'
import { ThemeIcon, ThemeSize, getPalette } from '@milkdown/core'

export * from './plugins'
export * from './defaultUploader'

export const FileInputName = 'file-picker-input'

export function createFilePickerButton({ css }: Emotion, manager: ThemeManager) {
  const span = document.createElement('span')
  const button = document.createElement('button')
  button.classList.add('tooltip-input')
  const icon = getIcon('drive_folder_upload', 'file')
  const input = document.createElement('input')
  input.classList.add(FileInputName)
  input.type = 'file'
  input.multiple = true
  button.append(icon)
  span.append(input, button)
  span.classList.add('milkdown-image-picker')

  manager.onFlush(() => {
    const palette = getPalette(manager)
    const style = css`
      position: relative;

      input {
        opacity: 0;
        z-index: -1;
        position: absolute;
        inset: 0;
      }
      button {
        border: 0;
        box-sizing: unset;
        width: 28px;
        height: 28px;
        padding: 4px;
        transition: color 0.4s ease-in-out, background-color 0.4s ease-in-out;
        cursor: pointer;
        background-color: transparent;
        border-radius: 0;
        color: ${palette('neutral')};
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: ${palette('secondary', 0.12)};
          color: ${palette('primary')};
        }
      }
    `

    if (span)
      span.classList.add(style)
  })

  button.onclick = () => input?.click()
  return span
}

export const imagePickerView = (emotion: Emotion, manager: ThemeManager) => {
  const { css } = emotion
  const palette = getPalette(manager)

  manager.set<ThemeImageType>('image', ({ placeholder, isBlock, onError, onLoad }) => {
    const createIcon = (icon: Icon) => manager.get(ThemeIcon, icon)?.dom as HTMLElement
    const container = document.createElement('span')

    manager.onFlush(() => {
      const style = css`
        display: inline-block;
        position: relative;
        text-align: center;
        font-size: 0;
        vertical-align: text-bottom;
        line-height: 1;

        ${isBlock
    ? `
        width: 100%;
        margin: 0 auto;
        `
    : ''}
        &.ProseMirror-selectednode::after {
            /* content: ''; */
            background: ${palette('secondary', 0.38)};
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }

        img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
            margin: 0 2px;
        }
        .icon,
        .placeholder,
        .milkdown-image-picker {
            display: none;
        }

        &.system {
            width: 100%;
            padding: 0 32px;
            font-size: inherit;

            img {
                width: 0;
                height: 0;
                display: none;
            }

            .icon,
            .placeholder,
            .milkdown-image-picker {
                display: inline;
            }

            box-sizing: border-box;
            height: 48px;
            background-color: ${palette('background')};
            border-radius: ${manager.get(ThemeSize, 'radius')};
            display: inline-flex;
            gap: 32px;
            justify-content: flex-start;
            align-items: center;
            .placeholder {
                margin: 0;
                line-height: 1;
                &::before {
                    content: '';
                    font-size: 14px;
                    color: ${palette('neutral', 0.6)};
                }
            }
        }

        &.empty {
            .placeholder {
                &::before {
                    content: '${placeholder}';
                }
            }
        }
      `

      if (style)
        container.classList.add(style)
    })

    const content = document.createElement('img')

    container.append(content)
    let icon = createIcon('image')
    const $placeholder = document.createElement('span')
    $placeholder.classList.add('placeholder')

    const setIcon = (name: Icon) => {
      const nextIcon = createIcon(name)
      container.replaceChild(nextIcon, icon)
      icon = nextIcon
    }

    const loadImage = (src: string) => {
      container.classList.add('system', 'loading')
      setIcon('loading')
      const img = document.createElement('img')
      img.src = src

      img.onerror = () => {
        onError?.(img)
      }

      img.onload = () => {
        onLoad?.(img)
      }
    }

    const fileButton = createFilePickerButton(emotion, manager)
    container.append(icon, fileButton, $placeholder)

    const onUpdate = (node: Node) => {
      const { src, alt, title, loading, failed } = (node as any).attrs
      content.src = src
      content.title = title || alt
      content.alt = alt

      if (src.length === 0) {
        container.classList.add('system', 'empty')
        setIcon('image')
        return
      }

      if (loading) {
        loadImage(src)
        return
      }

      if (failed) {
        container.classList.remove('loading', 'empty')
        container.classList.add('system', 'failed')
        setIcon('brokenImage')
        return
      }

      if (src.length > 0) {
        container.classList.remove('system', 'empty', 'loading')
        return
      }

      container.classList.add('system', 'empty')
      setIcon('image')
    }

    return {
      dom: container,
      onUpdate,
    } as any
  })
}

export function getIcon(icon: string, label: string): HTMLElement {
  const span = document.createElement('span')
  span.className = 'icon material-icons material-icons-outlined'
  span.textContent = icon
  span.dataset.label = label

  return span
}
