<template>
  <a-menu
    v-model:openKeys="openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    theme="dark"
    @select="go"
    :inline-collapsed="collapsed"
  >
    <template v-for="item in routes" :key="item.path">
      <template v-if="!item.meta.hide">
        <template v-if="!item.children">
          <a-menu-item :key="item.path">
            <template #icon>
              <PieChartOutlined />
            </template>
            {{ item.meta.route_name }}
          </a-menu-item>
        </template>
        <template v-else>
          <SubMenu :key="item.path" :menu-info="item" />
        </template>
      </template>
    </template>
  </a-menu>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import * as R from 'ramda';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  MailOutlined,
} from '@ant-design/icons-vue';
import SubMenu from './SubMenu.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    routes: Array,
  },
  components: {
    SubMenu,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
  },
  setup(props, ctx) {
    const router = useRouter();
    const collapsed = ref<boolean>(false);
    let realpath = window.location.pathname;
    if (import.meta.env.BASE_URL) {
      realpath = R.replace(import.meta.env.BASE_URL, '/', realpath);
    }
    const middle_path = R.tail(R.init(R.split('/', realpath)));
    const init_open_keys = R.reduce(
      (a: string[], b: string) => {
        return R.concat(a, [R.join('/', [R.last(a), b])]);
      },
      [],
      middle_path
    );
    const openKeys = ref(init_open_keys);
    const selectedKeys = ref([router.currentRoute.value.name] as any[]);
    const go = ({ key }: any) => {
      console.log('go: ', key);
      router.push(key);
    };
    watch(
      () => router.currentRoute.value.path,
      () => {
        selectedKeys.value = [router.currentRoute.value.path];
      }
    );

    function chat() {
      window.modal.open();
    }
    return {
      collapsed,
      selectedKeys,
      openKeys,
      go,
      chat
    };
  },
});
</script>

<style scoped>
.ant-layout-sider-children {
  position: relative;
}

</style>
