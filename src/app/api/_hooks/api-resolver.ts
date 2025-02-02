import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios'

import { BOT_API_URL, UI_BASE_URL } from 'src/config-global'

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: UI_BASE_URL
})
axiosInstance.interceptors.request.use((config) => {
  // Add request interceptor to include Origin
  try {
    if (!config.headers) {
      config.headers = new AxiosHeaders()
    }

    if (typeof window === 'undefined') {
      config.headers.set('Origin', UI_BASE_URL)
    }
  } catch (error) {
    console.error('error in axiosInstance.interceptors.request.use', error.message)
  }

  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
)

export default axiosInstance

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args]
  const res = await axiosInstance.get(url, {
    ...config,
    headers: {
      ...(axiosInstance.defaults.headers as Record<string, string>),
      ...(config?.headers as Record<string, string>)
    }
  })
  return res.data
}

export const post = async (url: string, data: {}, config?: AxiosRequestConfig) => {
  const res = await axiosInstance.post(url, data, {
    ...config,
    headers: {
      ...(axiosInstance.defaults.headers as Record<string, string>),
      ...(config?.headers as Record<string, string>)
    }
  })
  return res.data
}

export const put = async (url: string, data: {}, config?: AxiosRequestConfig) => {
  const res = await axiosInstance.put(url, data, {
    ...config,
    headers: {
      ...(axiosInstance.defaults.headers as Record<string, string>),
      ...(config?.headers as Record<string, string>)
    }
  })
  return res.data
}

// ----------------------------------------------------------------------

function getFullUIEndpoint(endpoint: string): string {
  return `${UI_BASE_URL}/api/v1/${endpoint}`
}

function getFullBotEndpoint(endpoint: string): string {
  return `${BOT_API_URL}/${endpoint}`
}

export const endpoints = {
  auth: {
    code: () => getFullUIEndpoint(`auth/code`),
    login: () => getFullUIEndpoint(`auth/login`)
  },
  nft: {
    id: (id: string) => getFullUIEndpoint(`nft/${id}`)
  },
  dashboard: {
    root: getFullUIEndpoint('app'),
    user: {
      id: (id: string) => getFullUIEndpoint(`user/${id}`),
      update: (id: string) => getFullUIEndpoint(`user/${id}`),
      code: (id: string) => getFullUIEndpoint(`user/${id}/code`),
      updateEmail: (id: string) => getFullUIEndpoint(`user/${id}/email`),
      transferAll: (id: string) => getFullUIEndpoint(`user/${id}/transfer-all`),
      logout: (id: string) => getFullUIEndpoint(`user/${id}/logout`)
    },
    wallet: {
      balance: (id: string) => getFullUIEndpoint(`wallet/${id}/balance`),
      transactions: (id: string) => getFullUIEndpoint(`wallet/${id}/transactions`),
      notifications: (id: string, pageIndex: number, pageSize: number) =>
        getFullUIEndpoint(
          `wallet/${id}/notifications?lazy=true&pageIndex=${pageIndex}&pageSize=${pageSize}`
        ),
      nfts: {
        root: (id: string) => getFullUIEndpoint(`wallet/${id}/nfts`),
        id: (walletId: string, nftId: string) =>
          getFullUIEndpoint(`wallet/${walletId}/nfts/${nftId}`)
      }
    }
  },
  backend_bot: {
    sendMessage: () => getFullBotEndpoint('chatbot/conversations/send-message')
  }
}
