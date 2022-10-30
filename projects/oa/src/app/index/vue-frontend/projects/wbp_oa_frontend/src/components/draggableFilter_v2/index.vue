<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
      <draggable v-model="draggableForm.checkedFilterList" :disabled="draggable_from_disabled">
        <transition-group>
          <div v-for="(item, index) in filtered_columns" :key="index">
            <div class="h-8 text-xl pl-2" :class="index === draggableForm.hoverIndex ? 'active' : ''"
              @mouseover="draggableForm.hoverIndex = index" @mouseout="draggableForm.hoverIndex = -1">
              <a-checkbox v-model:checked="item.visible">{{ item.title }}</a-checkbox>
            </div>
          </div>
        </transition-group>
      </draggable>
    </template>
    <template #title>
      <div class="py-2">
        <a-input v-model:value="draggableForm.checkedFilterName" placeholder="请输入要搜索的数据" style="width: 190px" />
      </div>
    </template>
    <div class="cursor-pointer w-[32px] h-[32px]">
      <svg-icon name="field" width="32px" height="32px" />
    </div>
  </a-popover>
</template>


<script lang="ts">
import { defineComponent, reactive, ref, watchEffect, emit, computed, watch, toRaw } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'

import * as R from 'ramda'
export default defineComponent({
  props: {
    columns: Array,
  },
  components: {
    draggable: VueDraggableNext
  },
  async setup(prop, ctx) {
    const draggableForm = reactive({
      checkedFilterList: R.map(c => ({ ...c, visible: c.visible || true }), prop.columns), // 展示的数组列表
      checkedFilterName: '', // 设置按钮隐藏列的搜索字段
      hoverIndex: -1, //表示当前hover的是第几个li 初始为 -1 或 null 不能为0 0表示第一个li
    })

    const filtered_columns = computed(() => {
      return draggableForm.checkedFilterList.filter(row => {
        return row.title.indexOf(draggableForm.checkedFilterName) > -1
      })
    })

    const draggable_from_disabled = computed(() => !!draggableForm.checkedFilterName)

    watch(() => [...draggableForm.checkedFilterList], () => {
      ctx.emit('update:columns', toRaw(draggableForm.checkedFilterList))
    }, { deep: true, immediate: true })


    return {
      draggableForm,
      draggable_from_disabled,
      filtered_columns,
    }
  },
})
</script>

<style scoped lang="less">
.active {
  color: #3870ce;
  background-color: #ecf3fe;
}

/deep/ .ant-popover-title {
  padding: 0.75rem 1rem !important;
}
</style>