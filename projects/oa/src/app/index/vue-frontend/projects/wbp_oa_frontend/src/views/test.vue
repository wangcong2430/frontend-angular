<template>
  <div class="mt-3 bg-white flex flex-col justify-start">
    <FilterForm />
  </div>
  <!-- <iframe class="w-full h-full" src="/inject/test_child"></iframe> -->
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import FilterForm from '@/components/filter_form/index.vue'
import { message, Modal } from 'ant-design-vue'
import * as R from 'ramda'

export default defineComponent({
  components: {
    FilterForm,
  },
  setup() {
    onMounted(() => {
      window.addEventListener("message", function (event) {
        console.log(event)
        // message.info()
        Modal.info({ content: R.toString(event.data), title: '接收到iframe传来的消息' });
      })
    })
  }
})
</script>