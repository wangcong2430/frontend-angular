import http from '@/axios/http'
/**
 * 变更订单审批页面：  10950
 * 变更升级审批页面：  10970
 * 变更GM审批页面：    10960
 */

// 表格列表数据
export const get_order_confirmation_list = (params:any) => {
    return http({
        url: '/web/apply-change/order-approval-confirmation-list-merge',
        method: 'GET',
        params,
    })
}

// 搜索表单列表
export const get_order_change_config = () => {
    return http({
        url: '/web/apply-change/order-change-config',
        method: 'GET',
    })
}
// 变更审批 通过
export const order_approval_pass = (params:any) => {
    return http({
        url: '/web/apply-change/order-approval-confirmation-pass',
        method: 'POST',
        data: { ...params }
    })
}
// 变更升级审批 通过
export const upgrade_order_approval_pass = (params:any) => {
    return http({
        url: '/web/apply-change/upgrade-order-approval-confirmation-pass',
        method: 'POST',
        data: { ...params }
    })
}
// 变更GM审批 通过
export const upgrade_order_approval_gm_pass = (params:any) => {
    return http({
        url: '/web/apply-change/upgrade-order-approval-gm-confirmation-pass',
        method: 'POST',
        data: { ...params }
    })
}
// 变更审批 驳回
export const order_approval_reject = (params:any) => {
    return http({
        url: '/web/apply-change/order-approval-confirmation-reject',
        method: 'POST',
        data: { ...params }
    })
}
// 变更升级审批 驳回
export const upgrade_order_approval_reject = (params:any) => {
    return http({
        url: '/web/apply-change/upgrade-order-approval-confirmation-reject',
        method: 'POST',
        data: { ...params }
    })
}

// 变更GM审批 驳回
export const upgrade_order_approval_gm_reject = (params:any) => {
    return http({
        url: '/web/apply-change/upgrade-order-approval-gm-confirmation-reject',
        method: 'POST',
        data: { ...params }
    })
}

// 变更审批/变更升级/变更GM  延时提醒
export const think_set_delay_day = (params:any) => {
    return http({
        url: '/web/thing/set-delay-day',
        method: 'POST',
        data: { ...params }
    })
}