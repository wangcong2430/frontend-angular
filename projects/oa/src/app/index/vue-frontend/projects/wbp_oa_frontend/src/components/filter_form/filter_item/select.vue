<template>
  <a-select v-bind="bind_prop" v-on="bind_event" style="width: 200px" :value="modelValue">
  </a-select>
</template>

<script lang="tsx">
import { defineComponent, onUpdated, ref, watch, watchEffect } from 'vue'
import { debounce } from 'lodash'
import * as R from 'ramda'
import { get_search_names } from '@/api/utils/filter_form'

export default defineComponent({
  props: {
    item: Object,
    modelValue: Object,
  },
  async setup(props, { emit }) {

    const oa_users_data = ref([])

    const handle_change = (v) => {
      emit('update:modelValue', v)
    }

    const fetch_oa_users = async (keyword: string) => {
      const { data } = await get_search_names({ enName: keyword })
      return data
    }

    const handle_search = debounce(
      async (keyword: string) => {
        oa_users_data.value = await fetch_oa_users(keyword)
      }, 200
    )

    const bind_prop = {
      placeholder: "请选择",
      options: R.pathOr([], ['templateOptions', 'options'], props.item),
      optionFilterProp: 'label',
      showSearch: true,
      ...(
        R.propOr(null, 'mode', props.item) ?
          {
            mode: R.propOr(null, 'mode', props.item),
            maxTagCount: 1,
            maxTagTextLength: 7,
            removeIcon: () => null,
          } : {}
      ),
      ...(
        R.propEq('type', 'select-oa-user', props.item) ?
          {
            'default-active-first-option': false,
            'show-arrow': false,
            'filter-option': false,
            'not-found-content': null,
            options: oa_users_data,
          } : {}
      )
    }

    const bind_event = {
      change: handle_change,
      ...(
        R.propEq('type', 'select-oa-user', props.item) ?
          {
            search: handle_search,
          } : {}
      )
    }

    return {
      R,
      bind_prop,
      bind_event,
    }
  }
})
</script>