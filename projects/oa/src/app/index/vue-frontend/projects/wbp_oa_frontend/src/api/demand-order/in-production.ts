import http from '@/axios/http'

export const get_in_production_config = async () => {
    return http({
        url: '/web/story/making-list-config',
        method: 'GET',
    })
}

export const get_in_production_order_list = ({
    page_index = 1,
    page_size = 20,
    filters = {},
} = {}) => {
    const params = {
        page_index, page_size,
        ...filters
    }
    return http({
        url: '/web/story/making-list',
        method: 'GET',
        params
    })
}

export const post_acceptance = ({ data = {} }) => {
    return http({
        url: 'api/iomc/by-acceptance-submit',
        method: 'POST',
        data,
    })
}