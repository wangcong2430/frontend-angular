<template>
  <a-layout v-if="mock_in_iframe" class="w-full h-full">
    <a-layout-content class="overflow-auto p-3 flex flex-col">
      <router-view v-slot="{ Component }">
        <suspense timeout="0">
          <component :is="Component" />
          <template #fallback>
            <div class="bg-[rgba(0, 0, 0, 0.05)] w-full h-full flex justify-center items-center">
              <a-spin :indicator="indicator" size="large">
              </a-spin>
            </div>
          </template>
        </suspense>
      </router-view>
    </a-layout-content>
  </a-layout>
  <a-layout v-else class="w-full h-full">
    <a-layout-sider>
      <keep-alive>
        <MenuGenerator :routes="routes" />
      </keep-alive>
    </a-layout-sider>
    <a-layout>
      <a-layout-header>Header</a-layout-header>
      <a-layout-content class="overflow-auto p-3 bg-[#F5F5F5] flex flex-col">
        <router-view v-slot="{ Component }">
          <suspense timeout="0">
            <component :is="Component" />
            <template #fallback>
              <div class="bg-[rgba(0, 0, 0, 0.05)] w-full h-full flex justify-center items-center">
                <a-spin :indicator="indicator" size="large">
                </a-spin>
              </div>
            </template>
          </suspense>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'
import { routes } from '@/router/index'
import MenuGenerator from '@/components/Layout/MenuGenerator.vue'
import { LoadingOutlined } from '@ant-design/icons-vue';


export default defineComponent({
  components: { MenuGenerator },
  setup() {
    const indicator = h(LoadingOutlined, {
      style: {
        fontSize: '24px',
      },
      spin: true,
    });
    const mock_in_iframe = import.meta.env.VITE_MOCK_IN_IFRAME || false
    // TODO auth
    return { indicator, routes, mock_in_iframe }
  },
})
</script>