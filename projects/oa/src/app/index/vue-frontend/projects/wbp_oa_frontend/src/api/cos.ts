import http from '@/axios/http'

export const get_cos_info = () => {
    return http({
        url: 'web/cos/info',
        method: 'GET',
    })
}

export const get_cos_sts = () => {
    return http({
        url: 'web/cos/sts',
        method: 'GET'
    })
}
// export const uploadFiles = (params:any) => {
//     return http({
//         url: 'web/cos/upload',
//         method: 'GET',
//         params
//     })
// }