<script lang="tsx">
// jsx风格组件
const Test = defineComponent({
  setup() {
    const count = ref(0)
    return () => <div onClick={() => count.value++}>jsx: {count.value}</div>
  },
})
</script>

<script lang="ts">
// vue风格组件
const Test2 = defineComponent({
  template: `
    <div @click="() => count++">vue: {{ count }}</div>
  `,
  setup() {
    return {
      count: ref(0)
    }
  }
})
</script>