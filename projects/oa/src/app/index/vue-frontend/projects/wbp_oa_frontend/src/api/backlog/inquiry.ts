import http from '@/axios/http'

export const get_inquiry_dialog = async ({ thing_id, is_test }: any) => {
    return http({
        url: '/web/price/inquiry-dialog',
        method: 'POST',
        data: { thing_id, is_test }
    })
}

export const check_contract_epo = async ({ contract_id, thing_id }: any) => {
    return http({
        url: '/web/order/check-contract-epo',
        method: 'POST',
        data: { contract_id, thing_id }
    })
}


export const check_order_company = async ({ supplier_id, product_code, contract_id }: any) => {
    return http({
        url: '/web/order/check-order-company',
        method: 'POST',
        data: {
            supplier_id,
            product_code,
            contract_id
        }
    })
}

export const inquiry_submit = async (data: any) => {
    return http({
        url: 'web/price/inquiry-submit',
        method: 'POST',
        data
    })
}