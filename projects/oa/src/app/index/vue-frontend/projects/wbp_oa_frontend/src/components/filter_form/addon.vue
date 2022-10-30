<template>
  <div class="flex items-center">
    <a-dropdown>
      <template #overlay>
        <a-menu @click="handle_click">
          <a-menu-item v-for="item in addon_search_form" :key="item.key">
            {{ R.path(['templateOptions', 'label'], item) }}
          </a-menu-item>
        </a-menu>
      </template>
      <a-button class="addon !min-w-[50px] w-[50px]">
        <PlusOutlined class="text-[#0052D9]" />
      </a-button>
    </a-dropdown>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import * as R from 'ramda'
export default defineComponent({
  components: {
    PlusOutlined,
  },
  props: [
    'addon_search_form'
  ],
  emits: ['handle_addon'],
  async setup(props, { emit }) {
    const handle_click = ({ key }) => {
      emit('handle_addon', key)
    }
    return {
      R,
      handle_click,
    }

  }
})
</script>
<style scoped lang="less">
.addon {
  background: rgba(0, 82, 217, 0.04);
  border-radius: 3px;
  &:hover {
    border: 1px solid rgba(0, 82, 217, 0.50);
  }
}
</style>