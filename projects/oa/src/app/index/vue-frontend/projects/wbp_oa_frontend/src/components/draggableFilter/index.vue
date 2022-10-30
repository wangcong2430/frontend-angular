<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
      <draggable v-model="draggableForm.checkedFilterList" :disabled="draggableForm.disabled" @end="draggableEnd">
          <transition-group>
            <div v-for="(item,index) in draggableForm.checkedFilterList" :key="index">
              <div class="h-8 text-xl pl-2" 
                :class=" index === draggableForm.hoverIndex  ? 'active' : ''" 
                @mouseover="draggableForm.hoverIndex = index" 
                @mouseout="draggableForm.hoverIndex = -1">
                  <a-checkbox v-model:checked="item.isShow">{{item.label}}</a-checkbox>
              </div>
            </div>
          </transition-group>
      </draggable>
    </template>
    <template #title>
      <div class="py-2">
        <a-input
          v-model:value="draggableForm.checkedFilterName"
          placeholder="请输入要搜索的数据"
          style="width: 190px"
        />
      </div>
    </template>
    <div class="cursor-pointer"><svg-icon name="field" width="32px" height="32px"/></div>
  </a-popover>
</template>


<script lang="ts">
import { defineComponent, reactive, ref, watchEffect, emit, computed, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
export default defineComponent({
  props: {
    newChildrenColumns: Array, 
  },
  components: {
    draggable: VueDraggableNext,
  },
  async setup(prop,ctx) {
    const draggableForm = reactive({
      checkedFilterList: [], // 展示的数组列表
      checkedFilterName: '', // 设置按钮隐藏列的搜索字段
      hoverIndex: -1, //表示当前hover的是第几个li 初始为 -1 或 null 不能为0 0表示第一个li
      disabled: false, // 是否禁用拖拽  （true 禁止拖拽  false  允许拖拽）
    })
    draggableForm.checkedFilterList = prop.newChildrenColumns;

    function draggableEnd(){
      ctx.emit('draggableEnd',draggableForm.checkedFilterList);
    }
    watch(
      ()=>draggableForm.checkedFilterName,
      ()=>{
        if(draggableForm.checkedFilterName !== ''){
          draggableForm.disabled = true; // 搜索有值，禁用拖拽
          draggableForm.checkedFilterList = prop.newChildrenColumns.filter(row=>{
            return row.label.indexOf(draggableForm.checkedFilterName) > -1
          })
        }else {
          draggableForm.disabled = false; // 搜索无值，使用拖拽
          draggableForm.checkedFilterList = prop.newChildrenColumns;
        }
      },
      { deep: true }
    )
    return {
      draggableForm,
      draggableEnd,
    }
  },
})
</script>

<style scoped lang="less">
.active{
  color: #3870ce;
  background-color: #ecf3fe;
}
/deep/ .ant-popover-title{
  padding: 0.75rem 1rem !important;
}
</style>