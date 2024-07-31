import axios, { AxiosRequestConfig } from 'axios'

import { UI_API_URL, BOT_API_URL } from 'src/config-global'

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: BOT_API_URL
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
)

export default axiosInstance

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args]
  const res = await axiosInstance.get(url, { ...config })
  return res.data
}

export const post = async (url: string, data: {}, config?: AxiosRequestConfig) => {
  const res = await axiosInstance.post(url, data, { ...config })
  return res.data
}

export const put = async (url: string, data: {}, config?: AxiosRequestConfig) => {
  const res = await axiosInstance.put(url, data, { ...config })
  return res.data
}

// ----------------------------------------------------------------------

function getFullUIEndpoint(endpoint: string): string {
  return `${UI_API_URL}/api/v1/${endpoint}`
}

function getFullBotEndpoint(endpoint: string): string {
  return `${BOT_API_URL}/${endpoint}`
}

export const endpoints = {
  auth: {
    code: () => getFullUIEndpoint(`auth/code`),
    login: () => getFullUIEndpoint(`auth/login`)
  },
  dashboard: {
    root: getFullUIEndpoint('app'),
    user: {
      id: (id: string) => getFullUIEndpoint(`user/${id}`)
    },
    wallet: {
      balance: (id: string) => getFullUIEndpoint(`wallet/${id}/balance`),
      transactions: (id: string) => getFullUIEndpoint(`wallet/${id}/transactions`)
    }
  },
  backend: {
    sendMessage: () => getFullBotEndpoint('chatbot/conversations/operator-reply'),
    control: () => getFullBotEndpoint('chatbot/conversations/control')
  }
}
