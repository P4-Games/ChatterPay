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

/*
function getFullBotEndpoint(schemaName: string, endpoint: string): string {
  return `${BOT_API_URL!.replace('[SCHEMA]', schemaName)}/${endpoint}`
}
*/

export const endpoints = {
  dashboard: {
    root: getFullUIEndpoint('app'),
    wallet: {
      balance: (walletId: string) => getFullUIEndpoint(`wallet/${walletId}/balance`),
      dummy: (walletId: string) => getFullUIEndpoint(`wallet/${walletId}/dummy`)
    },
    analytics: {
      bar: {
        // conversationsStatistics: (schemaId: string) => getFullUIEndpoint(`bot/${schemaId}/analytics/bar/cs`),
        // monthlyTokens: (schemaId: string) => getFullUIEndpoint(`bot/${schemaId}/analytics/bar/mt`)
      },
      scalar: {
        /*
        lastMonthConversationsQtty: (schemaId: string) =>
          getFullUIEndpoint(`bot/${schemaId}/analytics/scalar/lmcq`),
        lastMonthTokensQtty: (schemaId: string) =>
          getFullUIEndpoint(`bot/${schemaId}/analytics/scalar/lmtq`),
        availableTokensQtty: (schemaId: string) =>
          getFullUIEndpoint(`bot/${schemaId}/analytics/scalar/atq`),
        activeContacts: (schemaId: string) =>
          getFullUIEndpoint(`bot/${schemaId}/analytics/scalar/acq`)
      */
      }
    }
  },
  // BOT Backend API
  backend: {
    // serviceControl: (schemaName: string) => getFullBotEndpoint(schemaName, 'chatbot/service/control')
    // ....
    // ...
  },
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register'
  }
}
