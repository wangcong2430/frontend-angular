import http from '@/axios/http'

// 搜索需求经办人
export const get_search_names = async ({ enName }: { enName: string }) => {
    return http({
        url: '/web/user/search-names',
        method: 'GET',
        params: { enName }
    })
}