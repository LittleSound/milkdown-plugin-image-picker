<script setup lang="ts">
import MilkdownEditor from '~/components/MilkdownEditor/index.vue'
const raw = ref('# 💙 Hello Image\n![]()')
watchEffect(() => console.log('raw:', raw.value))
</script>

<template>
  <div>
    <MilkdownEditor v-model="raw" />
  </div>
</template>
