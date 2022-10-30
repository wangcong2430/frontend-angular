<template>
  <a-modal title="需求变更" :visible="true" :onCancel="onClose" width="550px" :getContainer="getContainer">

    <div class="flex flex-col">
      <div class="flex items-start">
        <span class="mr-3 text-sm opacity-[0.6]">
          需求名称
        </span>
        <span class="text-sm">
          {{ row.story_name }}
        </span>
      </div>
      <div class="flex items-start mt-3">
        <span class="mr-3 text-sm opacity-[0.6]">
          需求单号
        </span>
        <span class="text-sm">
          {{ row.story_code }}
        </span>
      </div>
      <div class="flex items-start mt-3">
        <span class="mr-3 text-sm opacity-[0.6]">
          物件名称
        </span>
        <span class="text-sm">
          {{ s_row.thing_name }}
        </span>
      </div>
      <div class="flex items-start mt-3">
        <span class="mr-3 text-sm opacity-[0.6]">
          物件单号
        </span>
        <span class="text-sm">
          {{ s_row.thing_code }}
        </span>
      </div>
    </div>

    <template #footer>
      <a-button @click="onClose">取消</a-button>
      <a-button @click="submit_form" type="primary">确定</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    onClose: { type: Function, required: true },
    onUpdate: { type: Function, required: true },
    row: Object,
    s_row: Object,
    getContainer: Object,
  },
  async setup({ row, s_row }) {
    const submit_form = async () => {
      await onUpdate()
      onClose()
    }

    return {
      submit_form,
    }
  }
})
</script>