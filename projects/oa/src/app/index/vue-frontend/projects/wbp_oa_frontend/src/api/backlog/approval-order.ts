import http from '@/axios/http'

export const get_order_approval_list = (params = {page_index : 1, page_size : 20}) => {
  return http({
      url: 'web/order/approval-list',
      method: 'GET',
      params
  })
}

export const get_approval_order_configs = () => {
  return http({
      url: 'web/order/approval-order-configs',
      method: 'GET',
  })
}
// 驳回
export const post_approval_submit_reject = (data:any) => {
  return http({
      url: 'web/order/approval-submit-reject',
      method: 'POST',
      data
  })
}
// 通过
export const post_approval_submit_pass = (data:any) => {
  return http({
      url: 'web/order/approval-submit-pass',
      method: 'POST',
      data
  })
}
export const post_approval_setDelay_day = (data:any) => {
  return http({
      url: 'web/thing/set-delay-day',
      method: 'POST',
      data
  })
}
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