<template>
  <a-sub-menu :key="menuInfo.path">
    <template #icon>
      <MailOutlined />
    </template>
    <template #title>{{ menuInfo.meta.route_name }}</template>
    <template v-for="item in menuInfo.children" :key="item.path">
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
  </a-sub-menu>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  MailOutlined,
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'SubMenu',
  props: {
    menuInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    PieChartOutlined,
    MailOutlined,
  },
});
</script>