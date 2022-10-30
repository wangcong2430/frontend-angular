import http from '@/axios/http'

export const get_acceptance_approve_score_list = ({ page_index = 1, page_size = 20 } = {}) => {
    return http({
        url: '/web/perf-score/acceptance-approve-score-list',
        method: 'GET',
        params: { page_index, page_size }
    })
}

export const post_approve_submit = ({ status = 0, perf_score_detail_id, reason = '' }: { status: number, perf_score_detail_id: string[], reason: string }) => {
    return http({
        url: '/web/perf-score/approve-submit',
        method: 'POST',
        data: { params: { status, perf_score_detail_id, reason } }
    })
}
