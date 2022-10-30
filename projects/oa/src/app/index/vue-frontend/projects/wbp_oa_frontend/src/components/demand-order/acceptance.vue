<template>
  <a-modal title="确认验收" :visible="true" :onCancel="onClose" width="420px" :getContainer="getContainer">
    <a-form>
      <div class="flex flex-col w-full">
        <span class="mb-[12px]">通过程度</span>
        <a-form-item class="mb-[12px]" v-bind="validateInfos.pass_degree">
          <a-radio-group v-model:value="formState.pass_degree">
            <a-radio value="1">通过</a-radio>
            <a-radio value="2">部分通过</a-radio>
            <a-radio value="3">不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item class="mb-[12px] w-full" v-if="formState.pass_degree !== '1'"
          v-bind="validateInfos.settlement_ratio">
          <a-input-number class="w-full" v-model:value="formState.settlement_ratio" placeholder="请输入结算比例"
            addon-after="%" :controls="false" :min="0" :max="100" />
        </a-form-item>
        <a-form-item class="mb-[12px] w-full" v-if="formState.pass_degree !== '1'"
          v-bind="validateInfos.acceptance_reason">
          <a-textarea v-model:value="formState.acceptance_reason" :rows="4" :maxlength="200" :autosize="false"
            placeholder="请输入结算说明" class="w-full" />
        </a-form-item>

        <span class="mb-[12px]">请评价作品</span>
        <template v-if="old_version">
          <a-form-item v-for="score, i in formState.scores" :label="score.label" v-bind="validateInfos[`scores.${i}.value`]" class="mb-[12px]" labelAlign="left">
            <a-rate v-model:value="score.value" :tooltips="score.star_describe" /><br />
            <span class="h-[24px]" v-if="score.value">{{score.star_describe[score.value - 1]}}</span>
          </a-form-item>
        </template>

      </div>
    </a-form>

    <template #footer>
      <a-button @click="onClose">取消</a-button>
      <a-button @click="submit_form" type="primary">确定</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts" setup>
import { defineComponent, reactive } from 'vue'
import { Form } from 'ant-design-vue';
import * as R from 'ramda'
import { post_acceptance } from '@/api/demand-order/in-production'

const useForm = Form.useForm;

const { row, s_row, onClose, onUpdate, getContainer } = defineProps(['row', 's_row', 'onClose', 'onUpdate', 'getContainer'])

// TODO when is old version score, generate old version formState and rulesState. otherwise new one
const old_version = true
let scores: any[] = []
if (old_version) {
  scores = [{
    "type": 1,
    "value": 4,
    "label": "作品质量",
    "description": "",
    "star_describe": ["品质不达标导致不能用", "品质很一般", "品质为正常水准", "品质比较高", "品质非常优秀"],
    "acceptance_evaluate_id": "1"
  }, {
    "type": 2,
    "value": 4,
    "label": "交付过程",
    "description": "",
    "star_describe": ["未能交付", "交期严重拖延", "按时交付，过程中需多次修改", "按时交付，过程中需少量修改", "按时交付，过程中无需修改"],
    "acceptance_evaluate_id": "2"
  }, {
    "type": 3,
    "value": 4,
    "label": "服务沟通",
    "description": "",
    "star_describe": ["消极怠慢，无视进度", "沟通效率低或不及时", "沟通及时通畅", "迅速理解和配合需求", "主动为项目解决困难"],
    "acceptance_evaluate_id": "3"
  }]
}

const formState = reactive({
  pass_degree: '1',
  settlement_ratio: null,
  acceptance_reason: '',
  scores
})
const rulesState = reactive({
  settlement_ratio: [
    {
      validator: async (_, value) => {
        if (formState.pass_degree !== '1' && !value) {
          throw '请输入结算比例'
        }
      }
    },
  ],
  acceptance_reason: [
    {
      validator: async (_, value) => {
        if (formState.pass_degree !== '1' && !value) {
          throw '请输入结算说明'
        }
      }
    },
  ],
  ...(R.fromPairs(scores.map((score, i) => {
    return [
      `scores.${i}.value`,
      [
        {
          validator: async (_, value) => {
            // pass
            if (!value) {
              throw `请填写${score.label}`
            }
          }
        }
      ]
    ]
  })))
})

console.log(rulesState)

const { validate, validateInfos } = useForm(formState, rulesState);


const submit_form = () => {
  validate().then(async (v) => {
    console.log(validateInfos)
    // TODO
    // await post_acceptance

    // await onUpdate()
    // onClose()
  }).catch((e) => {
    console.log(validateInfos)
  })
}

</script>