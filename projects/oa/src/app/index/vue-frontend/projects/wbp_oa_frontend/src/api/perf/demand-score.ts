import http from '@/axios/http'

export const get_demand_person_score_list = ({ page_index = 1, page_size = 20 } = {}) => {
    return http({
        url: '/web/perf-score/demand-person-score-list',
        method: 'GET',
        params: { page_index, page_size }
    })
}

export const post_dm_submit_score = ({ rows }: any) => {
    return http({
        url: '/web/perf-score/dm-submit-score',
        method: 'POST',
        data: { params: rows }
    })
}

export const get_demand_detail = ({ id, type = 11000 }: any) => {
    return http({
        url: '/web/perf-score/demand-detail',
        method: 'GET',
        params: { id, type },
    })
}

export const get_transfer_user_list = ({ id, node }: any) => {
    return http({
        url: '/web/perf-score/get-transfer-user-list',
        method: 'GET',
        params: { id, node }
    })
}
export const post_transfer_save = ({ id, node, remark, userId }: any) => {
    return http({
        url: '/web/perf-score/transfer-save',
        method: 'POST',
        data: {id, node, remark, userId}
    })
}
export const getMaterialDetails = (id: any) => {
    return http({
        url: `/web/thing/detail?id=${id}`,
        method: 'GET'
    })
}
export const getLabelEditInfo = ({ id, type }: any) => {
    return http({
        url: `web/thing/thing-label-edit?type=${type}&id=${id}`,
        method: 'GET'
    })
}
export const saveLabelEditInfo = (data: any) => {
    return http({
        url: `/web/thing/thing-label-save`,
        method: 'POST',
        data
    })
}
export const getHistoryRecord = (id: any) => {
    return http({
        url: `/web/thing/get-thing-label-history?id=${id}`,
        method: 'GET',
    })
}

export const submitRemarks = (data:any) => {
    return http({
        url: '/web/thing/add-thing-remark',
        method: 'post',
        data
    })
}
export const getTheRemarksList = (id:any) => {
    return http({
        url: `/web/thing/remark-list?id=${id}`,
        method: 'GET',
    })
}
export const getTheChangesList = (id:any) => {
    return http({
        url: `/web/thing/change-list?id=${id}`,
        method: 'GET',
    })
}
export const getTheQuotesList = (id:any) => {
    return http({
        url: `/web/thing/quote-list?id=${id}`,
        method: 'GET',
    })
}
export const getTheDelayChangesList = (id:any) => {
    return http({
        url: `/web/thing/delay-change-list?id=${id}`,
        method: 'GET',
    })
}


export const delRemark = (data:any) => {
    return http({
        url: `web/thing/del-thing-remark`,
        method: 'post',
        data
    })
}
