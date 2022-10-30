<template>
    <div class="relative flex items-center min-w-[200px] min-h-[50px]" @mouseover="show_clear_remove = true"
        @mouseout="show_clear_remove = false">
        <span class="text-base mr-1">
            {{ R.path(['templateOptions', 'label'], item) }}:
        </span>
        <Component :is="R.prop(item.type, CompInspect)" :item="item" v-model="comp_value_" @blur="handle_update" />
        <div class="absolute right-0 top-[0px] z-50 cursor-pointer transition duration-150 ease-out"
            :class="show_clear_remove ? 'opacity-60' : 'opacity-0'" style="transform: translate(50%)">
            <MinusCircleFilled v-if="!R.isEmpty(comp_value_) && !R.isNil(comp_value_)" @click="clear_value" />
            <CloseCircleFilled v-else @click="remove_item" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, provide, ref, watch, computed, nextTick } from 'vue';
import * as R from 'ramda'
import Select from './select.vue';
import Input from './input.vue';
import TreeSelect from './tree_select.vue';
import DateRange from './date_range.vue'
import { MinusCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';

export default defineComponent({
    components: {
        MinusCircleFilled,
        CloseCircleFilled
    },
    props: ['item', 'modelValue'],
    async setup(props, { emit }) {
        const { item, modelValue } = props
        const filter_value_ = ref(modelValue)

        const comp_value_ = computed({
            get: () => R.cond([
                // TODO 自定义格式化的方法
                // ...R.map(
                //     (type, formatter) => ([R.propEq('type', type), formatter(filter_value_.value)]),
                //     R.toPairs(type_formatter_map)
                // ),
                [R.propEq('type', 'input'), R.always(filter_value_.value)],
                [R.propEq('type', 'select'), item => {
                    if (R.includes(item.mode, ['multiple', 'tags']) && R.is(String, filter_value_.value)) {
                        return R.split(',', filter_value_.value)
                    }
                    return filter_value_.value
                }],
                [R.propEq('type', 'select-oa-user'), item => {
                    if (R.includes(item.mode, ['multiple', 'tags']) && R.is(String, filter_value_.value)) {
                        return R.split(',', filter_value_.value)
                    }
                    return filter_value_.value
                }],
                // 树状组件的筛选值恢复成组件value值
                [R.propEq('type', 'tree_select'), item => {
                    const v = R.filter(i => i, R.split(',', filter_value_.value || ''))
                    const options = R.pathOr([], ['templateOptions', 'options'], item)
                    const find_option = (leaf_id, options): string[] => {
                        for (let i = 0; i < options.length; i++) {
                            const option = options[i]
                            if (option.key === leaf_id) {
                                return [option.key]
                            } else if (option.children && option.children.length > 0) {
                                const child = find_option(leaf_id, option.children)
                                if (child.length > 0) {
                                    return [option.key, ...child]
                                }
                            }
                        }
                        return []
                    }
                    if (v && R.is(Array, v)) {
                        return R.filter(value_route => value_route.length > 0, R.map(leaf_id => find_option(leaf_id, options), v))
                    }
                    return undefined
                }],
                [R.propEq('type', 'date_range'), item => {
                    return R.split(',', filter_value_.value || '')
                }],
                // TODO 其他type的filter格式初始化成组件value
                [R.T, R.always(filter_value_.value)]
            ])(item),
            set: (value) => {
                if (value) {
                    filter_value_.value = R.cond([
                        // TODO 自定义格式化的方法
                        [R.propEq('type', 'input'), R.always(value)],
                        [R.propEq('type', 'select'), item => R.includes(item.mode, ['multiple', 'tags']) ? R.join(',', value) : value],
                        [R.propEq('type', 'select-oa-user'), item => R.includes(item.mode, ['multiple', 'tags']) ? R.join(',', value) : value],
                        [R.propEq('type', 'tree_select'), () => R.join(',', R.map(R.last, value))],
                        [R.propEq('type', 'date_range'), item => {
                            return R.join(',', value)
                        }],
                        // TODO 其他type的组件value 格式化成filter格式
                        [R.T, R.always(value)]
                    ])(item)
                } else {
                    filter_value_.value = value
                }
            }
        })

        watch(() => props.modelValue, () => {
            filter_value_.value = props.modelValue
        }, { deep: true, immediate: true })

        const CompInspect = {
            select: Select,
            input: Input,
            tree_select: TreeSelect,
            'select-oa-user': Select,
            'date_range': DateRange,
        }
        const clear_value = () => {
            comp_value_.value = undefined
            nextTick(handle_update)
        }
        const remove_item = () => {
            emit('remove_item', item.key)
        }
        const handle_update = () => {
            emit('update:modelValue', filter_value_.value)
        }
        provide('immediate_update', handle_update)
        return {
            R,
            CompInspect,
            filter_value_,
            comp_value_,
            show_clear_remove: ref(false),
            clear_value,
            remove_item,
            handle_update,
        }
    }
})
</script>