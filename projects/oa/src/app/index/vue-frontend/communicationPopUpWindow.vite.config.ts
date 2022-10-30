import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createStyleImportPlugin, AndDesignVueResolve, } from 'vite-plugin-style-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),  createStyleImportPlugin({
    resolves: [AndDesignVueResolve()],
    libs: [
      {
        libraryName: 'ant-design-vue',
        esModule: true,
        resolveStyle: (name) => {
          // vite开发模式下，此处路径需要额外加node_modules，很奇怪，暂时没有深究原因
          return `/ant-design-vue/es/${name}/style/index`
        },
      },
    ],
  })
],
  css:{
	     preprocessorOptions: {
        less: {
              modifyVars: {
                'ant-prefix': 'ant-chat'
              },
              javascriptEnabled: true,
              sourceMap: false,
		      },
	    },
	},
  build: {
    outDir: `${path.resolve(__dirname, 'dist')}/communicationPopUpWindow/`,
    lib: {
        entry: path.resolve(__dirname, 'src/components/communicationPopUpWindow/main.ts'),
        name: 'communicationPopUpWindow',
        fileName: (format) => `communicationPopUpWindow.${format}.js`
    },
  },
  resolve: {
    alias: {
      '@@/': `${path.resolve(__dirname, 'src')}/`,
      '@wbp_oa/': `${path.resolve(__dirname, 'projects/wbp_oa_frontend/src')}/`,
    },
  },
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      "/web": {
        target: "http://test.wbp.qq.com/",
        changeOrigin: true,
      },
      "/api/iomc": {
        target: "http://test.wbp.qq.com/",
        changeOrigin: true,
      },
      // 模拟登录
      "/test/login": {
        target: "http://test.wbp.qq.com/",
        changeOrigin: true,
      },
      "/index.php/test/login": {
        target: "http://test.wbp.qq.com/",
        changeOrigin: true,
      },
      // "/web": {
      //   target: "http://test.wbp.woa.com",
      //   changeOrigin: true,
      // },
      // // 模拟登录
      // "/test/login": {
      //   target: "http://test.wbp.woa.com",
      //   changeOrigin: true,
      // },
      // "/index.php/test/login": {
      //   target: "http://test.wbp.woa.com",
      //   changeOrigin: true,
      // },
    },
  },
})
