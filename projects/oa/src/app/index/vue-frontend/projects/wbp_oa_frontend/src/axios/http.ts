import * as R from 'ramda'
import axios from 'axios'

class ApiError extends Error {
  constructor(code = 0, message = '', ...params: any[]) {
    super(...params);

    this.code = code;
    this.message = message;
  }
}

const HTTP = axios.create({
  baseURL: window.location.origin,
  timeout: 60 * 1000,
  withCredentials: true
})
//请求拦截器
HTTP.interceptors.request.use(
  config => {
    return {
      ...config,
      headers: {
        ...config.headers,
        // 'request-id': 'FR' + getUUid()
      }
    }
  },
  error => {
    return Promise.reject(error)
  }
)
//响应拦截器
HTTP.interceptors.response.use(
  async response => {
    let res = response.data;
    return res;
    // if (res.code !== 0) {

    //   if (res.msg) {
    //     console.error(res.msg)
    //   }
    //   return Promise.reject(new ApiError(res.code, res.msg));
    // } else {
    //   return res;
    // }
  },
  async error => {
    if (error.response) {
      const errorRes = error.response.data;
      // message.error(`${errorRes.error || errorRes.msg || errorRes}`, 5);
      console.log("失败1")
    }
    return Promise.reject(error);
  }
);

export default HTTP;