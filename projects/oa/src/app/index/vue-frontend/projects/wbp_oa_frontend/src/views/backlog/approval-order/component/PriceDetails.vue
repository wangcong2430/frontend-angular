<template>
  <div>
    <a-modal width="1142px" :visible="totalFlag" title="价格详情" @cancel="handleCancel" cancelText="取消">
      <vxe-table :data="produce_breakdown">
        <vxe-column field="label" title="明细名称"></vxe-column>
        <vxe-column field="pre_workload_unit_label" title="需求明细及单位">
          <template #default="{ row }">
            <span v-if="row.pre_value && row.pre_workload_unit_name"> {{ row.pre_value }} {{ row.pre_workload_unit_name
            }}</span>
            <span v-else> 0 {{ row.pre_workload_unit_name }} </span>
          </template>

        </vxe-column>
        <vxe-column field="ag" title="报价明细数量及单位">
          <template #default="{ row }">
            <div v-if="row.value && row.workload_unit_name"
              :class="(row.pre_value != row.value || row.pre_workload_unit_name != row.workload_unit_name) ? 'active' : ''">
              <div> {{ row.value }} {{ row.workload_unit_name }} </div>
            </div>
            <div v-else
              :class="(row.pre_value != row.value || row.pre_workload_unit_name != row.workload_unit_name) ? 'active' : ''">
              0 {{ row.workload_unit_name }} </div>
          </template>
        </vxe-column>
        <vxe-column field="count_price" title="明细单价">
          <template #default="{ row }">
            <div>
              <div> {{ Number(row.price).toFixed(2) }} {{ unit }} </div>
              <div class="text" v-if="fixed_price_status === 1"> 固定价 </div>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="price" title="明细价格">
          <template #default="{ row }">
            <span> {{ count_price(row) }} {{ unit }} </span>
          </template>
        </vxe-column>
        <vxe-column field="remark" title="备注">
          <template #default="{ row }">
            <span v-if="row.remark"> {{ row.remark }} </span>
            <span v-else> NA </span>
          </template>
        </vxe-column>
        <vxe-column field="ge" title="附件">
          <template #default="{ row }">
            <div v-if="row.file_id">
              <!-- <span class="mr-3 cursor-pointer" style="color: #0052D9;"> <a target="_blank" :href="row.files[0]">预览</a> </span>
              <span class="cursor-pointer" style="color: #0052D9;">下载</span> -->
              <div class="cursor-pointer truncate" style="color: #0052D9;" v-for="item in row.files">
                <a v-if="file_type(item) === '音频' || file_type(item) === '视频' || file_type(item) === '图片' || file_type(item) === 'pdf'"
                  :href="item.url" target="_blank">{{ item.file_name }}</a>
                <a v-if="file_type(item) === '压缩包' || file_type(item) === '其它'" :href="item.url" target="_top">{{
                    item.file_name
                }}</a>
              </div>
            </div>
            <div v-else> NA </div>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="flex justify-start items-center h-12 bg-approval-header mt-4 pl-3">明细总价： {{ detailprice }} {{ unit }}
      </div>
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { computed } from '@vue/reactivity';
import { defineComponent, onMounted, reactive, ref } from 'vue'
import * as R from 'ramda'
import FileSaver from 'file-saver';
export default defineComponent({
  props: {
    totalFlag: Boolean,
    onClose: Function,
    produce_breakdown: Array,
    unit: String,
    fixed_price_status: Number
  },
  setup(props) {

    const handleCancel = (e: MouseEvent) => {
      props.onClose()
    };
    let detailprice = computed(() => {
      let total = 0
      props.produce_breakdown?.forEach((item: any) => {
        total += (Number(item.price) * item.value)
      })
      console.log('----props.produce_breakdown', total.toLocaleString());

      return total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
    })

    let count_price = (row) => {
      let temp = Number(row.count_price).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
      return temp
    }
    const file_type = (file) => {
      const f_type = R.last(R.split('.', file.file_name))
      if (R.includes(f_type, ['zip', 'tar', 'gz', 'bz2', 'xz', 'Z', '7z', 'rar'])) {
        return '压缩包'
      } else if (R.includes(f_type, ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'])) {
        return '图片'
      } else if (R.includes(f_type, ['mp3', 'wav', 'aif', 'aiff'])) {
        return '音频'
      } else if (R.includes(f_type, ['mp4', 'ogg', 'webm', 'fla', 'flac', 'swf'])) {
        return '视频'
      } else if (R.includes(f_type, ['pdf'])) {
        return 'pdf'
      } else if (R.includes(f_type, ['psd', 'ai', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'tga', 'wmv', 'avi', 'caf', 'wma', 'mov', 'mpg', 'mpeg'])) {
        return '其它'
      }
      return null
    }
    return {
      handleCancel,
      detailprice,
      count_price,
      file_type
    };
  }
})

</script>

<style lang="less" scoped>
.active {
  color: red
}

.text {
  color: rgba(0, 0, 0, 0.40);
}

/deep/ .vxe-header--row {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.40);
  font-family: PingFangSC-Regular;
  font-weight: 400;
  font-size: 0.875rem;
  text-align: left;
  line-height: 22px;
}

/deep/ .vxe-body--row {
  font-family: PingFangSC-Regular;
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.90);
  text-align: left;
  line-height: 22px;
}
</style>
