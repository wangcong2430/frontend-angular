import http from '@/axios/http'

// 表格列表数据
export const get_in_production_list = (params:any) => {
    return http({
        url: '/web/order/in-production-list',
        method: 'GET',
        params,
    })
}

// 搜索表单列表
export const get_in_production_configs = () => {
    return http({
        url: '/web/order/in-production-configs',
        method: 'GET',
    })
}
// 需求经办人的接口
export const get_in_search_names = (params:any) => {
    return http({
        url: '/web/user/search-names',
        method: 'GET',
        params,
    })
}
// 结束制作  
export const get_production_finish = (params:any) => {
    return http({
        url: '/web/order/production-finish',
        method: 'POST',
        data: { ...params }
    })
}