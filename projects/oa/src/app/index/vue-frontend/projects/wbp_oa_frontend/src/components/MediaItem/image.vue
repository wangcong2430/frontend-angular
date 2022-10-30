<template>
  <img
    :src="info.url"
    :alt="info.filename"
    @error="handleLoadImgError"
    @mouseenter="state.showOpenButton = true"
    @mouseleave="state.showOpenButton = false"
  />
  <a-button
    @mouseenter="state.showOpenButton = true"
    @mouseleave="state.showOpenButton = false"
    @click="handleClickExpand"
    class="expand-button absolute origin-center bottom-[60px] left-1/2"
    :style="{opacity: state.showOpenButton ? '0.7' : '0'}"
    type="primary"
    shape="circle"
    size="large"
  >
    <template #icon>
      <ExpandOutlined />
    </template>
  </a-button>
</template>

<script>
import { defineComponent, reactive } from "vue";
import { ExpandAltOutlined, ExpandOutlined } from "@ant-design/icons-vue";
import Default from "./default.vue";
import * as R from "ramda";

export default defineComponent({
  props: {
    info: Object,
  },
  setup(prop, ctx) {
    const state = reactive({
      can_show: true,
      showOpenButton: false,
      buttonMoreVisible: false,
    });
    // if (!R.includes( prop.info.type, ['jpg', 'png', 'gif', 'jpeg'] )) {
    //   state.can_show = false
    // }
    const handleLoadImgError = () => {
      state.can_show = false;
    };
    const handleClickExpand = () => {
      window.open(prop.info.url, "_blank");
    };
    return {
      state,
      handleLoadImgError,
      handleClickExpand,
    };
  },
  components: {
    Default,
    ExpandAltOutlined,
    ExpandOutlined,
  },
});
</script>
<style scoped lang='less'>
.expand-button {
  background-color: #1f1f1f;
  border-color: #1f1f1f; 
  transform: translate(-50%,0);
  transition: opacity .2s linear;
}
img {
  height: 300px;
}
</style>
