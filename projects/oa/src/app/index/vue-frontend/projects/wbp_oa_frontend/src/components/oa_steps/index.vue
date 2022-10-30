<template>
  <div class="flex steps">
    <div v-for="item in items" class="step flex justify-around items-center">
      {{ item }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    items: {
      type: Array,
      default: ['test', 'test', 'test']
    }
  },
  setup() {

  }
})
</script>
<style scoped lang="less">
.steps {
  .step {
    height: 32px;
    width: 156px;
    color: #FFF;
    background-color: #0052D9;
    clip-path: polygon(0% 0%, 8px 50%, 0% 100%, calc(100% - 8px) 100%, 100% 50%, calc(100% - 8px) 0%, 0% 0%);
  }

  .step:nth-child(1) {
    clip-path: polygon(0% 0%, 0% 100%, calc(100% - 8px) 100%, 100% 50%, calc(100% - 8px) 0%, 0% 0%);
  }

  .step:nth-last-child(1) {
    clip-path: polygon(0% 0%, 8px 50%, 0% 100%, 100% 100%, 100% 0%, 0% 0%);
  }
}
</style>