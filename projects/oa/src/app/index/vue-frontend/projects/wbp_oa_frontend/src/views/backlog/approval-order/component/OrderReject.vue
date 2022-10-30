<template>
  <div>
    <a-modal  :visible="rejectFlag" title="驳回原因" @cancel="handleCancel" cancelText="取消" okText="确定" @ok="handleOk">
      <a-form name="basic" autocomplete="off">
        <a-form-item :name="['user', 'introduction']" >
          <a-textarea v-model:value="reason" placeholder="请填写驳回原因" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { post_approval_submit_reject } from '@/api/backlog/approval-order'
import { message } from 'ant-design-vue';



export default defineComponent({
  props: {
    rejectFlag: Boolean,
    onClose: Function,
    handleSearch: Function,
    thing_ids:Array,
    
  },
  setup(props) {
    let reason = ref('')
    let radioVal = ref('xunjia')
    const handleCancel = (e: MouseEvent) => {
      reason.value = ''
      props.onClose()
    };
    const handleOk = async () =>{
      
    if (props.thing_ids.length <= 0) {
      message.error('请选择一个订单')
      return 
    }
    if (reason.value === '') {
      message.error('请填写驳回原因')
      return 
    }
    let res = await post_approval_submit_reject({thing_ids:props.thing_ids,reason:reason.value})
    if (res.code === 0) {
      reason.value = ''
      message.success('订单驳回成功')
      props.onClose(1)
    }else {
      message.error('订单驳回失败')
    }
    
    }


    return {
      handleCancel,
      radioVal,
      handleOk,
      reason
    };
  }
})

</script>

<style lang="less">
</style>
