<script lang="ts" setup>
import { Editor, ThemeColor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { darkColor, nordDark, nordLight } from '@milkdown/theme-nord'
import { VueEditor, useEditor } from '@milkdown/vue'
import { commonmark, heading, image, link } from '@milkdown/preset-commonmark'
import { upload } from '@milkdown/plugin-upload'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { defaultConfig, menu, menuPlugin } from '@milkdown/plugin-menu'
import { switchTheme } from '@milkdown/utils'
import ImagePickerView, { imageSelection } from 'image-picker-plugin'
import { isDark } from '~/composables'

const props = defineProps<{
  modelValue: string
}>()
const emits = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const customNordDark = nordDark.override((emotion, manager) => {
  manager.set(ThemeColor, ([key, opacity]) => {
    switch (key) {
      case 'surface':
        return `rgba(23, 23, 23, ${opacity})`
      default:
        return darkColor[key]
    }
  })
}).override(ImagePickerView)
const customNordLight = nordLight.override(ImagePickerView)

const { editor, getInstance } = useEditor((root, renderVue) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, props.modelValue)
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
        emits('update:modelValue', markdown)
      })
    })
    .use(isDark.value ? customNordDark : customNordLight)
    .use(commonmark
      .configure(heading, { displayHashtag: false })
      .configure(image, {
        placeholder: '添加图片',
        input: {
          placeholder: '请输入图片地址',
          buttonText: '确认',
        },
      })
      .replace(image, imageSelection()()).configure(link, {
        input: {
          placeholder: '请输入链接地址',
          buttonText: '确认',
        },
      }),
    )
    .use(menu.configure(menuPlugin, {
      config: defaultConfig.map(section => section.map((item) => {
        if (item.type !== 'select')
          return item
        switch (item.text) {
          case 'Heading': {
            return {
              ...item,
              text: '标题选择',
              options: [
                { id: '1', text: '一级标题' },
                { id: '2', text: '二级标题' },
                { id: '3', text: '三级标题' },
                { id: '0', text: '正文' },
              ],
            }
          }
          default:
            return item
        }
      }).filter(item => !(item.type === 'button' && ['select', 'table', 'link', 'code'].includes(item.icon)))),
    }))
    .use(upload)
    .use(listener),
)
watch(isDark, (value) => {
  const iEditor = getInstance()
  iEditor?.action(switchTheme(value ? customNordDark : customNordLight))
})
</script>

<template>
  <VueEditor :editor="editor" />
</template>

<style lang="less" setup>
@import "@material-design-icons/font/outlined.css";

.milkdown-menu-wrapper {
  max-width: 72rem !important;

  .milkdown {
    overflow: auto;

    .editor {
      padding: 20px 20px 72px;

      >* {
        margin: 10px 0;
      }
    }
  }

  position: relative;
}
</style>
