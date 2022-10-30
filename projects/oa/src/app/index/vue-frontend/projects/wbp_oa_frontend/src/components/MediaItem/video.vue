<template>
  <video
    v-if="state.can_show"
    :id="`video-tcplayer-${attachment_id}`"
    class="w-full"
    style="max-height:80vh;height: auto;position: relative;"
    preload="auto"
    playsinline
    webkit-playsinline
    @error="handleVideoError"
  ></video>
  <div v-else>无法加载该视频</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, nextTick, onUnmounted } from "vue";
import {getTcplayerSign} from "../../api/perf/index";
import * as R from "ramda";

export default defineComponent({
  props: {
    info: Object,
    attachment_id: Number,
  },
  setup(prop, ctx) {
    const state = reactive({
      can_show: true,
    });
    const handleVideoError = () => {
      state.can_show = false;
    };

    const adapter = ref()
    onMounted(async () => {
      // TEST file_id
      // 387702301267988701
      // 387702301267971168
      // 387702301268015939
      const file_id = R.pathOr(null, ["extra", "file_id"], prop.info);
      if (file_id) {
        const ret: any = await getTcplayerSign(file_id);
        if (ret.ret === 0) {
          // @ts-ignore
          adapter.value = new TCPlayer(`video-tcplayer-${prop.attachment_id}`, {
            fileID: file_id,
            appID: ret.data.data.app_id,
            psign: ret.data.data.signature,
            posterImage: false,
            hlsConfig: {},
          });

          // const adapter = new TCPlayer(
          //   `video-tcplayer-${prop.attachment_id}`,
          //   {
          //     appID: "1500013044",
          //     fileID: "387702301267988701",
          //     psign:
          //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6MTUwMDAxMzA0NCwiZmlsZUlkIjoiMzg3NzAyMzAxMjY3OTg4NzAxIiwiY3VycmVudFRpbWVTdGFtcCI6MTY1NTUzNzkyMiwiZXhwaXJlVGltZVN0YW1wIjoxNjU1NjI0MzgyLCJwY2ZnIjoiVGVzdFBsYXllciIsInVybEFjY2Vzc0luZm8iOnsidCI6IjYyYWVkMmJlIn0sImRybUxpY2Vuc2VJbmZvIjp7fX0.FeBB8jhtw-1vhPswDQvs1Zk-dWA4H5ydFLL8Q2o5uFw",
          //     // hlsConfig: {},
          //   },
          // );
          return;
        }
      }
      state.can_show = false;
    });
    onUnmounted(() => {
      if (adapter.value) {
        adapter.value.dispose()
      }
    })
    return {
      state,
      handleVideoError,
    };
  },
});
</script>

<style lang="less">
.tcp-vtt-thumbnail-container {
  opacity: 0;
}
</style>
