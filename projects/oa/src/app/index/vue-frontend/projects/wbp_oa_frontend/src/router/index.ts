import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from "vue-router";
import IndexView from "../views/index/index.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/perf",
    name: "perf",
    meta: {
      route_name: "绩效"
    },
    children: [
      {
        path: "/perf/demand-score",
        name: "perf_demand-score",
        meta: {
          route_name: "绩效评分"
        },
        component: () => import("@/views/perf/demand-score/index.vue"),
      },
      {
        path: "/perf/acceptance-approve",
        name: "perf_acceptance-approve",
        meta: {
          route_name: '评分审批'
        },
        component: () => import("@/views/perf/acceptance-approve/index.vue"),
      },
      {
        path: "/perf/purchasing-score",
        name: "perf_purchasing-score",
        meta: {
          route_name: '绩效评分'
        },
        component: () => import("@/views/perf/purchasing-score/index.vue"),
      },
    ],
  },
  {
    path: '/purchase-order',
    name: "purchase-order",
    meta: {
      route_name: '跟进'
    },
    children: [
      {
        path: "/purchase-order/in-production",
        name: "purchase-order_in-production",
        meta: {
          route_name: '制作中'
        },
        component: () => import("@/views/purchase-order/in-production/index.vue"),
      }
    ]
  }, 
  {
    path: '/agency',
    name: "agency",
    meta: {
      route_name: '代办'
    },
    children: [
      {
        path: "/agency/change-approval",
        name: "agency_change-approval",
        meta: {
          route_name: '变更审批'
        },
        component: () => import("../views/agency/change-approval/index.vue"),
      }
    ]
  },
  {
      path: '/demand-order',
      name: 'demand-order',
      meta: {
        route_name: '跟进'
      },
      children: [
        {
          path: '/demand-order/in-production',
          name: 'demand-order_in-production',
          meta: {
            route_name: '制作中'
          },
          component: () => import("@/views/demand-order/in-production/index.vue")
        }
      ]
  },
  {
    path: '/demo',
    name: "demo",
    meta: {
      route_name: 'DEMO'
    },
    children: [
      {
        path: "/demo/grid-generate",
        name: "demo_grid-generate",
        meta: {
          route_name: "grid-generate"
        },
        component: () => import("@/views/demo/grid-generate/grid-generate.vue"),
      },
      {
        path: "/demo/grid-generate-hooks",
        name: "demo_grid-generate-hooks",
        meta: {
          route_name: "grid-generate-hooks"
        },
        component: () => import("@/views/demo/grid-generate/grid-generate-with-hooks.vue"),
      },
    ]
  },
  {
    path: '/backlog',
    name: "backlog",
    meta: {
      route_name: '待办'
    },
    children: [
      {
        path: '/backlog/inquiry',
        name: 'backlog_inquiry',
        meta: {
          route_name: '询价',
        },
        component: () => import("@/views/backlog/inquiry/index.vue")
      },
      {
        path: "/backlog/approval-order",
        name: "backlog_approval-order",
        meta: {
          route_name: '订单审批'
        },
        component: () => import("@/views/backlog/approval-order/index.vue"),
      }
    ]
  },
  {
    path: '/test',
    name: 'test',
    meta: {
      route_name: 'iframe_test'
    },
    component: () => import('@/views/test.vue')
  },
  {
    path: '/test_child',
    name: 'test_child',
    meta: {
      route_name: 'iframe_test_child'
    },
    component: () => import('@/views/test_child.vue')
  },
  {
    path: '/:catchAll(.*)',
    name: 'catch all error route',
    meta: {
      route_name: 'catchall error',
      hide: true,
    },
    redirect: '/perf/demand-score'
  },
];

const router = createRouter({
  // history: createWebHashHistory(import.meta.env.BASE_URL || '/'),
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

export default router;
