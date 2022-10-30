### 旧版后台内嵌新版后台流程（测试服务器）
1. 打包
    wbp_oa为例:
    ```shell
    cd /data/website/htdocs/carson/vite-frontend-manager
    npm run build:wbp_oa
    ```
2. *(optional)* 编译modal相关的样式文件为一个单独的有作用域的css文件
    `make inject-wbp_oa-css`
3. 确保在旧后台index.html中引用了inject-modal.css
`<link rel="stylesheet" href="/inject/assets/inject-modal.css">`