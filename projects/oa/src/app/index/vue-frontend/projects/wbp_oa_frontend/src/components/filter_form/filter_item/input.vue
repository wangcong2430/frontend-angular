<template>
    <a-input style="width: 200px" @pressEnter="immediate_update" @change="v => handle_change(v.target.value)"
        :value="modelValue" placeholder="请输入">
        <template #suffix>
            <SearchOutlined @click="immediate_update" />
        </template>
    </a-input>
</template>

<script lang="tsx">
import { defineComponent, ref, inject } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import * as R from 'ramda'

export default defineComponent({
    components: { SearchOutlined },
    props: {
        item: Object,
        modelValue: String,
    },
    async setup({ item }, { emit }) {
        const immediate_update = inject('immediate_update')
        const handle_change = (v) => {
            emit('update:modelValue', v)
        }
        return {
            R,
            handle_change,
            immediate_update,
        }
    }
})
</script>