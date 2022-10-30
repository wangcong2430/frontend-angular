<template>
  <div class="w-full flex justify-center">
    <audio
      v-if="state.can_show"
      :id="`audio-${attachment_id}`"
      class="w-full"
      preload="auto"
      playsinline
      webkit-playsinline
    ></audio>
    <div v-else>无法加载该音频</div>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, onUnmounted } from "vue";
import {getTcplayerSign} from "../../api/perf/index";
import * as R from "ramda";
export default defineComponent({
  props: {
    info: Object,
    attachment_id: Number,
  },

  setup(prop) {
    const state = reactive({
      can_show: true,
    });
    const adapter = ref();
    onMounted(async () => {
      const file_id = R.pathOr(null, ["extra", "file_id"], prop.info);
      if (file_id) {
        const ret = await getTcplayerSign(file_id);
        if (ret.ret === 0) {
          adapter.value = new TCPlayer(`audio-${prop.attachment_id}`, {
            fileID: file_id,
            appID: ret.data.data.app_id,
            psign: ret.data.data.signature,
            posterImage: false,
            hlsConfig: {},
          });
          return;
        }
      }
      state.can_show = false;
    });
    onUnmounted(() => {
      if (adapter.value) {
        adapter.value.dispose();
      }
    });
    return {
      state,
    };
  },
});
</script>
