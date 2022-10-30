<template>
  <a-modal :visible="true" @cancel="onClose" destroyOnClose okText="确定" cancelText="取消" :onOk="handle_ok" :getContainer="getContainer">
    <label>驳回原因：</label>
    <a-textarea v-model:value="reason"></a-textarea>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  props: {
    onClose: { type: Function, required: true },
    onUpdate: { type: Function, required: true },
    getContainer: Object,
  },
  async setup(props, ctx) {
    const reason = ref('')
    const handle_ok = async () => {
      await props.onUpdate(reason.value)
      props.onClose()
    }
    return {
      reason,
      handle_ok,
    }
  }
})
</script>