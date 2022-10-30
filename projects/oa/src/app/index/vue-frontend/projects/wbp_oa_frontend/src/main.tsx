import { createApp, h, Suspense } from 'vue'
// import '@@/components/communicationPopUpWindow/main'
import { toString, propOr } from 'ramda'
import router from "./router";
import Antd from 'ant-design-vue';
import App from './App.vue'
import VXETable from 'vxe-table'
import TDesign from 'tdesign-vue-next';
import SvgIcon from '@@/components/SvgIcon.vue'
import 'ant-design-vue/dist/antd.css';
import 'vxe-table/lib/style.css';
import 'tdesign-vue-next/es/style/index.css';

import '@@/tailwind.css';
import '@/global.less';

import 'virtual:svg-icons-register'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import axios from 'axios';
dayjs.locale('zh-cn');


// NOTE 公共挂载Modal的方法，适用于antd modal
// 组件必须支持的props: onClose, getContainer。并且这两个参数必须传递给<a-modal>
const popup_in_parent = (Comp: any, comp_attrs: object) => {
  if (window.parent !== window) {
    const parent_body = window.parent.document.getElementsByTagName('body')[0]
    const group_el = window.parent.document.createElement('div')
    const el = window.parent.document.createElement('div')
    const style_link = window.parent.document.createElement('link')
    const style_link2 = window.parent.document.createElement('link')
    style_link.setAttribute('rel', 'stylesheet')
    style_link.setAttribute('href', '/inject/assets/inject-modal.css')
    style_link2.setAttribute('rel', 'stylesheet')
    style_link2.setAttribute('href', '/inject/assets/inject-tailwind.css')
    Promise.all([
      new Promise(resolve => {
        style_link.onload = () => {
          resolve(true)
        }
      }),
      new Promise(resolve => {
        style_link2.onload = () => {
          resolve(true)
        }
      })
    ]).then(() => {
      group_el.appendChild(el)
    })
    group_el.appendChild(style_link)
    group_el.appendChild(style_link2)
    el.classList.add('injecting-old-version')
    parent_body.appendChild(group_el)
    createApp({
      render: () => h(Suspense, {}, [
        h(Comp, {
          ...comp_attrs,
          onClose: () => { group_el.remove() },
          getContainer: () => el
        }),
      ])
    }).use(Antd).use(VXETable).mount(el)
    console.log(`Show Modal ${propOr(Comp, 'name', Comp)} in [parent] body.`)
    return true
  }
  console.log(`Show Modal ${propOr(Comp, 'name', Comp)} in [self] body.`)
  return false
}

VXETable.renderer.add('DefaultCellRender', {
  // 默认显示模板
  renderDefault(renderOpts, params) {
    const { row, column } = params
    const { events = {} } = renderOpts
    return (
      <>
        {
          row[column.field] ?
            (

              <span>{row[column.field]}</span>
            )
            : (
              <vxe-null-cell />
            )
        }
      </>
    )
  }
})

const app = createApp(App).use(router).use(Antd).use(VXETable).use(TDesign);
app.component('svg-icon', SvgIcon)
app.component('vxe-null-cell', () => <span>NA</span>)
app.provide('popup_in_parent', popup_in_parent)
app.mount('#app')
