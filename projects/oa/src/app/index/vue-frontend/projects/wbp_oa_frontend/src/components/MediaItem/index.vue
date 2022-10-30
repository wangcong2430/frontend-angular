<template>
  <component :is="component" :info="info" :attachment_id="attachment_id" />
  <div class="media_item_title">{{ info.filename }}</div>
</template>

<script>
import { defineComponent, computed } from "vue";
import Video from "./video.vue";
import Image from "./image.vue";
import Music from "./music.vue";
import Mod from "./mod.vue";
import OutSource from "./outsource.vue";
import Default from "./default.vue";
import * as R from "ramda";

export default defineComponent({
  name: "MediaItem",
  props: {
    info: Object,
    attachment_id: Number,
  },
  setup(prop, ctx) {
    const component = computed(() => {
      if (
        R.includes(prop.info.type, [
          "jpg",
          "jpeg",
          "png",
          "tga",
          "dds",
          "tif",
          "gif",
          "bmp",
          "pvr",
          "etc",
        ])
      ) {
        return Image;
      } else if (
        R.includes(prop.info.type, ["mp4", "avi", "mov", "wmv", "flv"])
      ) {
        return Video;
      } else if (
        R.includes(prop.info.type, [
          "fbx",
          "max",
          "obj",
          "mb",
          "lxf",
          "lxfml",
          "vmd",
          "pmd",
          "pmx",
          "mmd",
          "stl",
          "psd",
        ])
      ) {
        return Mod;
      } else if (R.includes(prop.info.type, ["mp3"])) {
        return Music;
      } else if (R.includes(prop.info.type, ["outsource"])) {
        return OutSource;
      }
      return Default;
    });
    return {
      component,
    };
  },
});
</script>
