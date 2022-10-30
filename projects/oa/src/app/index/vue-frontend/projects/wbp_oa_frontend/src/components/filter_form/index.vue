<template>
  <div class="flex flex-wrap gap-x-3 gap-y-0 justify-start">
    <FilterItem v-for="item in base_search_form" :item="item" :key="item.key" v-model="filters_[item.key]"
      @remove_item="handle_remove">
    </FilterItem>

    <Addon v-if="addon_search_form.length > 0" :addon_search_form="addon_search_form" @handle_addon="handle_addon" />
    <!-- <a-button @click="handle_clear_all">清除所有筛选</a-button> -->

  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, reactive, watch, provide } from "vue";
import FilterItem from './filter_item/index.vue';
import Addon from './addon.vue';
import * as R from 'ramda';

export default defineComponent({
  components: {
    FilterItem,
    Addon,
  },
  props: {
    search_form: {
      type: Array,
      default: []
    },
    filters: Object,
    type_formatter_map: Array,
  },
  async setup({ search_form, filters }, { emit }) {
    const filters_ = reactive({ ...filters })
    const default_show_count = R.count(R.propEq('is_show', 1), search_form)
    const base_search_form = ref(R.slice(0, default_show_count > 3 ? default_show_count : 3, search_form))
    const addon_search_form = computed(() => {
      const base_keys = R.map(R.prop('key'), base_search_form.value)
      return R.reject(i => R.includes(i.key, base_keys), search_form)
    })

    const handle_addon = (key) => {
      base_search_form.value.push(R.find(R.propEq('key', key), search_form))
    }

    const handle_remove = (key) => {
      filters_[key] = undefined
      base_search_form.value = R.reject(R.propEq('key', key), base_search_form.value)
    }

    const handle_clear_all = () => {
      for (let key in filters_) {
        filters_[key] = undefined
      }
    }

    watch(() => ({ ...filters_ }), () => {
      console.log('filter_form: ', 'updated: ', filters_)
      emit('update:filters', filters_)
    })

    const test = () => console.log(filters)
    return {
      R,
      base_search_form,
      addon_search_form,
      filters_,
      handle_addon,
      handle_remove,
      handle_clear_all,
      test,
    }
  }
})
</script>