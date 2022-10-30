<template>
  <a-table :dataSource="dataSource" :columns="columns">
    <template #headerCell="{ column }">
     {{column.label}}
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.slot">
        <slot :row="record" :col="column" :name="column.slot"></slot>
      </template>
      <template v-else>
        {{ record[column.dataIndex || column.key] }}
      </template>
    </template>
  </a-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    dataSource: {
      required: true,
      type: Array,
      default: [],
    },
    columns: {
      required: true,
      type: Array,
      default: [],
    },
  },
});
</script>

<style scoped></style>
