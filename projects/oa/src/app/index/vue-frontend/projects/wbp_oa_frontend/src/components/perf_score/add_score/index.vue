<template>
  <a-modal :width="900" :visible="true" title="增加评分" okText="确定" cancelText="取消" :onCancel="handle_cancel"
    :onOk="submit_form">
    <div class="scoped-add-score-css">
      <div class="headtitle">温馨提示：若非必要不建议增加额外的产品及供应商进行评分；确认增加之后会推送评分数据至需求经办人以及采购经理评分。</div>
      <a-form ref="formRef" name="dynamic_form_nest_item" :model="dynamicValidateForm" >
        <div>
          <a-form-item name="picker" label="评估时间段">
            <a-range-picker v-model:value="picker" :locale="locale" :disabled-date="disabledDate" disabled
              picker="month" valueFormat="YYYY-MM" @change="dateChange" />
          </a-form-item>
        </div>
        <div>
          <a-form-item name="area" label="产品名称/供应商/品类">
            <!-- <a-select v-model:value="dynamicValidateForm.area" :options="areas" /> -->
            <a-cascader v-model:value="dynamicValidateForm.area" :options="dynamicValidateForm.areas"
              placeholder="请选择产品名称/供应商/品类" @change="handCasc" dropdownClassName="wym" >
              <template #expandIcon>
                <div style="position: absolute; top: -1.8rem;">
                  <RightOutlined />
                </div>
              </template>
            </a-cascader>
            <a-button type="dashed" block @click="addSight">
              <PlusOutlined />
              添加需要评分的项目
            </a-button>
          </a-form-item>
          <a-space v-for="(sight, index) in dynamicValidateForm.sights" :key="sight.id"
            style="display: flex; margin-bottom: 5px" align="baseline">
            <a-form-item :name="['sights', index, 'value']" label="产品名称/供应商/品类">
              <a-cascader @change="handCasc" v-model:value="sight.value" :options="dynamicValidateForm.areas"
                placeholder="请选择产品名称/供应商/品类" >
                <template #expandIcon>
                <div style="position: absolute; top: -1.8rem;">
                  <RightOutlined />
                </div>
              </template>
              </a-cascader>
              <a-button type="dashed" block @click="addSight">
                <PlusOutlined />
                添加需要评分的项目
              </a-button>
            </a-form-item>
            <MinusCircleOutlined @click="removeSight(sight)" style="margin-top: 0.6rem" />
          </a-space>
        </div>
        <div>
          <a-form-item name="text" label="增加评分原因">
            <a-textarea v-model:value="textVal" placeholder="请输入增加评分的原因，200字内" :rows="4" :maxlength="200" />
          </a-form-item>
        </div>
      </a-form>
    </div>

  </a-modal>
</template>
<script lang="ts">
import { defineComponent, onUpdated, reactive, ref, watch } from "vue";
import * as R from 'ramda'
import { post_add_perf_score_dialog, post_add_perf_score } from '@/api/perf/purchasing-score'
import { message } from "ant-design-vue";
import { MinusCircleOutlined, PlusOutlined,RightOutlined } from '@ant-design/icons-vue';
import 'dayjs/locale/zh-cn'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import { pick } from "lodash";
import moment from 'moment'

export default defineComponent({
  name: 'TransferForm',
  components: {
    MinusCircleOutlined,
    PlusOutlined,
    RightOutlined
  },
  props: {
    rows: {
      type: Array
    },
    node: String,
    onClose: { type: Function, required: true },
    onUpdate: { type: Function, required: true },
  },
  async setup(props, ctx) {
    const xForm = ref()
    // 时间value
    let picker = ref([])

    const formRef = ref<any>();
    const dynamicValidateForm = reactive<any>({
      sights: [],
      area: [],
      areas: []
    });


    // text
    let textVal = ref('')
    let start_time = ref()
    let end_time = ref()

    message.config({
      getContainer:() => {
        console.log('----document.body',window.parent);
        console.log('----document.body',window.parent.document.body);
        
        return window.parent.document.body
      }
    })

    const handAddScore = async () => {
      let res = await post_add_perf_score_dialog(picker.value)
      
      picker.value = [res.start_time, res.end_time] as any
      start_time.value = res.start_time
      end_time.value = res.end_time
      dynamicValidateForm.areas = res.data
      console.log('--------res',res,dynamicValidateForm.areas);
    }

    await handAddScore()

    const handle_cancel = () => {
      props.onClose()
    }
    // const row_ids = R.map(R.prop('id'), props.rows)
    // const { data: user_list } = await get_transfer_user_list({ id: row_ids.toString(), node: props.node })
    // const form_state = reactive({
    //   form_data: {
    //     id: R.join(',', row_ids), node: props.node, remark: "", userId: ""
    //   },
    //   form_rules: {
    //     userId: [
    //       { required: true, message: '请选择删除理由' },
    //     ],
    //   }
    // })
    const submit_form = async () => {
      let submitArr = ref([])
      let dateArr = ref([])
      // picker.value.forEach((item,index) => {
      //   if (index == 0) {
      //     dateArr.value
      //   }
      // })
      let array = [dynamicValidateForm.area]
      dynamicValidateForm.sights.forEach(item => {
        array.push(item.value)
      });
      array.forEach(item => {
        let tmpArr = reactive({}) as any
        item.forEach((item2, index) => {
          if (index == 0) {
            tmpArr['product_code'] = item2
          }
          if (index == 1) {
            tmpArr['supplier_id'] = item2
          }
          if (index == 2) {
            tmpArr['category_id'] = item2
          }
        })

        console.log('----tmpArr', tmpArr);

        submitArr.value.push(tmpArr)
      })
      console.log('------props,rows',dynamicValidateForm, array);
      console.log('------submitArr', submitArr.value);
      if (dynamicValidateForm.area.length == 0) {
        return message.error('请选择要添加的评分项目')
      }
      if (textVal.value == '' || textVal.value === undefined) {
        return message.error('请输入增加评分的原因')
      }
      let res = await post_add_perf_score({ start_time: picker.value[0], end_time: picker.value[1], data: submitArr.value, add_remark: textVal.value })
      if (res.code != 0) {
        return message.error(res.msg)
      } else {
        props.onClose()
        props.onUpdate()
        return message.success(res.msg)
        // ctx.emit('onUpdate')
        // ctx.emit('onClose')
      }
    }
    const handCasc = (value, option) => {

      // console.log('-----value', value, option, submitArr.value);

    }

    // watch(
    //   () => dynamicValidateForm.area,
    //   () => {
    //     dynamicValidateForm.sights = [];
    //   },
    // );
    const removeSight = (item: any) => {
      let index = dynamicValidateForm.sights.indexOf(item);
      if (index !== -1) {
        dynamicValidateForm.sights.splice(index, 1);
      }
    };
    const addSight = () => {
      dynamicValidateForm.sights.push({
        value: undefined,
        price: undefined,
        id: Date.now(),
      });
    };

    const dateChange = async () => {
      // await handAddScore()
    }

    const disabledDate = (current) => {
      return current.isBefore(moment(start_time.value)) || current.isAfter(moment(end_time.value))
    };

    return {
      xForm,
      handle_cancel,
      submit_form,
      picker,
      locale,
      textVal,

      formRef,
      dynamicValidateForm,
      removeSight,
      addSight,
      handCasc,
      dateChange,
      disabledDate
    }
  }
})
</script>

<style lang="less">
@import './style.less';
</style>