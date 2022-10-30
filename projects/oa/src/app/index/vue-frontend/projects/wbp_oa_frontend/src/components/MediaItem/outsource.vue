<template>
  <iframe class="w-full min-h-[45vw]" :src="info.url" sandbox="allow-same-origin allow-scripts"/>
</template>

<script>
import { defineComponent, reactive } from "vue";
import * as R from "ramda";

export default defineComponent({
  props: {
    info: Object,
  },
  setup(prop, ctx) {},
});
</script>
