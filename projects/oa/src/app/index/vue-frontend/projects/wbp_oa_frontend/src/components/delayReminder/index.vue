<template>
  <!-- 延时提醒弹窗封装 -->
  <div>
    <a-modal :visible="delayReminderForm.visible" :width="650" cancelText="取消" okText="确定" @cancel="handleCancel" @ok="handleSubmit">
      <template #title>
        <div style="width: 100%; cursor: move">延时提醒<span style="color: #FF3E00;" class="text-sm">（按当前日期最多只可延时10天）</span>
        </div>
      </template>
      <a-form :model="delayReminderForm" :label-col="{ span: 5 }" :rules="delayReminderRules">
         <a-form-item ref="delay_date" label="请设置提醒日期" name="delay_date">
          <a-date-picker v-model:value="delayReminderForm.delay_date" :disabled-date="disabledDate" :locale="locale" placeholder="请设置提醒日期" @change="" />
        </a-form-item>
        <div class="ml-32 mb-4 text-gray-400">系统将于此日期发送WBP助手提醒消息给您, 请知悉!</div>
        <a-form-item ref="remark" label="延时处理原因" name="remark">
          <a-textarea v-model:value="delayReminderForm.remark" placeholder="请输入原因" allow-clear />
        </a-form-item>
        <a-form-item name="files" label="上传附件" :labelCol="{ span: 4, offset: 1 }">
          <a-upload v-model:fileList="delayReminderForm.fileList" :headers="{ authorization: 'authorization-text' }"
            :max-count="1" :customRequest="handleChange" :before-upload="beforeUpload">
            <a-button>
              <!-- <upload-outlined></upload-outlined> -->
              上传文件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive } from 'vue'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import { post_approval_cos_upload, post_approval_cos_sts, post_approval_cos_info } from '@/api/utils/delayReminder'
import moment from 'moment'
import { message } from 'ant-design-vue';
import COS from 'cos-js-sdk-v5';
import 'dayjs/locale/zh-cn'

export default defineComponent({
  props: {
    /**
     * @visible 是否显示
     * @delayReminderForm 表单提交的数据
     */
    visible: Boolean,
    delayReminderForm: Object,
  },
  async setup(props,ctx) {
    const config = {
      Bucket: "wbp-1258344700",
      Region: "ap-guangzhou",
      Prefix: 'web-upload'
    }
    let fileInfo = reactive({
      file_size: '',
      file_name: '',
      file_path: '',
      file_type: '',
      object_id: '',
      object_type: '1600'
    })
    let file_id = ref(null)
    
    const disabledDate = (current) => {
      return current.isBefore(moment(Date.now()).add(-1, 'days')) || current.isAfter(moment(Date.now()).add(9, 'days'))
    };

    // 表单校验规则
    const delayReminderRules = {
      delay_date: [{ required: true, message: '请设置提醒日期', trigger: 'change' }],
      remark: [{ required: true, message: '延期处理原因不能为空', trigger: 'change' }],
    };

    // 自定义的上传事件
    const handleChange = async (info) => {
      message.loading('正在上传文件', 0)
      let { file } = info
      let res = await post_approval_cos_sts()
      if (res.code === 0) {
        const credentials = res.data.credentials
        const cos = new COS({
          getAuthorization: function (options, callback) {
            const config = {
              TmpSecretId: credentials.tmpSecretId,
              TmpSecretKey: credentials.tmpSecretKey,
              XCosSecurityToken: credentials.sessionToken,
              ExpiredTime: res.data.expiredTime,
              StartTime: res.data.startTime,
            }
            callback(config)
          }
        })

        let res2 = await post_approval_cos_info()
        const option = {
          Bucket: res2.bucket || config.Bucket,
          Region: res2.region || config.Region,
          // Key: config.Prefix + '/' + timeType(times, 'yyyy,MM,dd', '') + '/' + randomString(false,64,64) + '/' + encodeURI(file.name), // 上传指定的key格式，路径
          Key: res2.prefix + file.name,
          Body: file, // 上传文件对象

        }

        cos.uploadFile(option, async function (err, result) {
          if (err) {
            message.destroy()
            message.error('网络异常', 1).then(() => {
              console.log('上传失败');
              console.log('err', err);
              console.log('result', result);
            })

          } else {
            message.destroy()
            fileInfo.file_name = file.name
            fileInfo.file_size = file.size
            fileInfo.file_type = file.type
            let temp = res2.cdn_domain.replace(/^https?:\/\//,'')
            fileInfo.file_path = temp + '/' + res2.prefix + '/' + file.name
            let res3 = await post_approval_cos_upload({ ...fileInfo })
            if (res3.code === 0) {
              file_id.value = res3.data.file_id.toString()
              info.onSuccess(file)
              message.success('上传成功', 1)
            } else {
              message.error('上传失败', 1)
            }
          }
        })
      }
    }

    const beforeUpload = (file, fileList) => {
      console.log('----file',file);
      console.log('----file',fileList);
      
      if (file.size <= 5242880) {
        fileInfo.file_name = file.name
        fileInfo.file_size = file.size
        fileInfo.file_type = file.type
        return true
      } else {
        message.error('只能上传在5M以下的文件', 1)
        fileList = []
        return false
      }
    }

    const handleCancel = (e: MouseEvent) => {
        ctx.emit('delayReminderCancel');
        file_id.value = null
    };
    const handleSubmit = async (e) => {
      await ctx.emit('delayUpdateFileId', file_id.value);
      await ctx.emit('delayReminderSubmit')
    }

    return {
      locale,
      disabledDate,
      delayReminderRules,
      handleChange,
      beforeUpload,
      handleCancel,
      handleSubmit,
    };
  }
})

</script>

<style lang="less">
</style>
