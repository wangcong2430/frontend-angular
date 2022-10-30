### 用法
```vue
<template>
  <FilterForm :search_form="search_form" v-model:filters="the_filters" />
</template>

<script>
setup() {
  const filters = reactive(R.fromPairs(R.map(i => [i.key, null], search_form)))
  const the_filters = computed({
    get: () => filters,
    set: value => Object.assign(filters, value)
  })

  watch(() => ({ ...filters }), () => {
    console.log('refetch')
  })
}
</script>
```