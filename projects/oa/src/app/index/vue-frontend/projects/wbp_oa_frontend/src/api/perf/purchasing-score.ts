import http from '@/axios/http'

export const get_pm_score_list = ({ page_index = 1, page_size = 20 } = {}) => {
    return http({
        url: '/web/perf-score/pm-score-list',
        method: 'GET',
        params: { page_index, page_size }
    })
}

export const post_pm_submit_score = ({ rows }: any) => {
    return http({
        url: '/web/perf-score/pm-submit-score',
        method: 'POST',
        data: { params: rows }
    })
}


export const get_batch_perf_score_config = () => {
  return http({
    url: '/web/perf-score/batch-perf-score-config',
    method: 'GET',
  })
}

export const get_batch_pm_score_list = ({ perf_score_id = [] }: { perf_score_id?: string[] | number[] } = {}) => {
  return http({
    url: '/web/perf-score/batch-pm-score-list',
    method: 'GET',
    params: { perf_score_id: perf_score_id.toString() }
  })
}

export const post_edit_perf_score = ( data : any) => {
    return http({
        url: '/web/perf-score/edit-perf-score',
        method: 'POST',
        data
    })
}

export const post_add_perf_score_dialog = ( params : any) => {
    return http({
        url: '/web/perf-score/add-perf-score-dialog',
        method: 'GET',
        params
    })
}

export const post_add_perf_score = ( data : any) => {
    return http({
        url: '/web/perf-score/add-perf-score',
        method: 'POST',
        data
    })
}

