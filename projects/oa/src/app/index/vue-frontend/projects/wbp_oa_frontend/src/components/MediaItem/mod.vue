<template>
  <!-- <iframe class="w-full min-h-[500px]" src="http://test.artcool.woa.com/threejs/model/misc_animation_groups.html" /> -->
  <iframe
    v-if="state.can_show"
    class="w-full min-h-[500px]"
    :src="`${prefix}/threejs/model/webgl_loader_${info.type}.html?url=${info.url}`"
  />
  <Default v-else :info="info" />
</template>

<script>
import { defineComponent, reactive } from "vue";
import * as R from "ramda";
import Default from "./default.vue";

export default defineComponent({
  props: {
    info: Object,
  },
  setup(prop, ctx) {
    const prefix = process.env.NODE_ENV === 'production' ? '' : 'http://test.idea.waibao.qq.com'
    const state = reactive({
      can_show: true,
    });
    if (!R.includes(prop.info.type, ["fbx"])) {
      state.can_show = false;
    }
    return {
      prefix,
      state,
    };
  },
  components: {
    Default,
  },
});
</script>
