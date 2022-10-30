import http from '@/axios/http'

export const post_approval_cos_upload = (params:any) => {
    return http({
        url: 'web/cos/upload',
        method: 'GET',
        params
    })
}
  
export const post_approval_cos_sts = () => {
    return http({
        url: 'web/cos/sts',
        method: 'GET'
    })
}
  
  export const post_approval_cos_info = () => {
    return http({
        url: 'web/cos/info',
        method: 'GET'
    })
  }
