<template>
    <a-cascader v-bind="bind_prop" style="width: 200px" :value="value_" @change="handle_change" :allowClear="false">
    </a-cascader>
</template>

<script lang="tsx">
import { defineComponent, ref, watch } from 'vue'
import * as R from 'ramda'

const find_option_path = (option, key_prefix) => {
    if (option.children && option.children.length > 0) {
        const a = R.map(child => find_option_path(child, [...key_prefix, option.key]), option.children)
        return R.unnest(a)
    }
    return [[...key_prefix, option.key]]
}

export default defineComponent({
    props: [
        'item',
        'modelValue'
    ],
    async setup(props, { emit }) {
        const value_ = ref(props.modelValue)
        watch([() => props.modelValue], () => {
            value_.value = props.modelValue
        }, { deep: true })

        const bind_prop = {
            placeholder: "请选择",
            fieldNames: { label: 'title', value: 'key' },
            options: R.pathOr([], ['templateOptions', 'options'], props.item),
            showSearch: true,

            multiple: true,
            maxTagCount: 1,
            maxTagTextLength: 7,
            removeIcon: () => null,
        }
        const handle_change = (value, selectedOptions) => {
            value_.value = value
            const result = R.unnest(R.map(
                (option_path) => {
                    const key_prefix = R.dropLast(1, R.map(R.prop('key'), option_path))
                    return find_option_path(R.last(option_path), key_prefix)
                },
                selectedOptions
            ))
            emit('update:modelValue', result)
        }
        return {
            R,
            bind_prop,
            value_,
            handle_change,
        }
    }
})
</script>