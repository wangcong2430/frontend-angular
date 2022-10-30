<template>
  <a-modal class="scoped-inject-inquiring-modal" :visible="true" title="生成订单" @ok="handle_submit" okText="确定"
    cancelText="取消" width="1200px" :confirmLoading="confirmLoading" :okButtonProps="{ disabled: confirmDisabled }"
    @cancel="onClose" :maskClosable="false">
    <a-form ref="form_ref" :colon="false" labelAlign="right" hideRequiredMark>
      <a-form-item label="议价过程附件">
        <CosUpload v-model:value="fileList">
          <a-button>
            <UploadOutlined />
            上传文件
          </a-button>
          <template #tips>
            <span class="opacity-60">（如有线下议价，请务必上传议价过程附件）</span>
          </template>
        </CosUpload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="tsx" setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { formState, rulesState, validate, validateInfos, confirmDisabled, confirmLoading } from './state.ts'
import { UploadOutlined } from '@ant-design/icons-vue';
import CosUpload from '@/components/upload.vue'

const { thing_id, is_test, category_type, onClose, onUpdate } = defineProps(['thing_id', 'category_type', 'is_test', 'onClose', 'onUpdate'])

const form_ref = ref()

const fileList = ref([])
watch(() => fileList, () => {
  console.log('form value: ', fileList.value)
}, { deep: true })

const handle_submit = () => {
  // TODO
}

</script>