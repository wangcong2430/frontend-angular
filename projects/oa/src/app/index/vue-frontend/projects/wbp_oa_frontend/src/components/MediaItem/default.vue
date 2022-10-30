<template>
  <div>该文件 ({{info.filename}}) 暂不支持显示。</div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    info: Object,
  },
  setup() {},
});
</script>
