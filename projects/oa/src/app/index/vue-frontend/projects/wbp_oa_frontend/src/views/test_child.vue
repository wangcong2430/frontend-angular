<template>
  child
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  setup() {
    onMounted(() => {
      window.parent.postMessage({key: 'thing', value: {
        id: '111'
      }}, '\*')
    })
  }
})
</script>