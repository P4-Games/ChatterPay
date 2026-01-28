import axios, { AxiosHeaders, type AxiosRequestConfig } from 'axios'

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
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      if (typeof window !== 'undefined' && errorCode === 'NOT_AUTHORIZED') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
      return Promise.reject(error)
    }
    console.error('[API Error]', error.message)
    return Promise.reject(error)
  }
)
export default axiosInstance

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args]
  const res = await axiosInstance.get(url, {
    ...config,
    withCredentials: true,
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
    login: () => getFullUIEndpoint(`auth/login`),
    me: () => getFullUIEndpoint('auth/me')
  },
  nft: {
    id: (id: string) => getFullUIEndpoint(`nft/${id}`)
  },
  tokens: getFullUIEndpoint('tokens'),
  dashboard: {
    root: getFullUIEndpoint('app'),
    user: {
      id: (id: string) => getFullUIEndpoint(`user/${id}`),
      update: (id: string) => getFullUIEndpoint(`user/${id}`),
      code: (id: string) => getFullUIEndpoint(`user/${id}/code`),
      referral: {
        codeWithUsageCount: (id: string) =>
          getFullUIEndpoint(`user/${id}/referral/code-with-usage-count`),
        byCode: (id: string) => getFullUIEndpoint(`user/${id}/referral/by-code`),
        submitByCode: (id: string) => getFullUIEndpoint(`user/${id}/referral/submit-by-code`)
      },
      security: {
        status: (id: string) => getFullUIEndpoint(`user/${id}/security/status`),
        questions: (id: string) => getFullUIEndpoint(`user/${id}/security/questions`),
        recoveryQuestions: (id: string) =>
          getFullUIEndpoint(`user/${id}/security/recovery-questions`),
        events: (id: string) => getFullUIEndpoint(`user/${id}/security/events`),
        pin: (id: string) => getFullUIEndpoint(`user/${id}/security/pin`),
        resetPin: (id: string) => getFullUIEndpoint(`user/${id}/security/pin/reset`)
      },
      updateEmail: (id: string) => getFullUIEndpoint(`user/${id}/email`),
      logout: (id: string) => getFullUIEndpoint(`user/${id}/logout`),
      notifications: {
        root: (id: string, cursor?: string, limit?: number) => {
          const params = new URLSearchParams()
          if (cursor !== undefined && cursor !== null) params.append('cursor', cursor)
          if (limit) params.append('limit', String(limit))
          const queryString = params.toString()
          return getFullUIEndpoint(`user/${id}/notifications${queryString ? `?${queryString}` : ''}`)
        },
        markRead: (id: string) => getFullUIEndpoint(`user/${id}/notifications/mark-read`),
        delete: (id: string, notificationId: string) =>
          getFullUIEndpoint(`user/${id}/notifications/${notificationId}`)
      }
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
      },
      chatterpoints: {
        history: (id: string) => getFullUIEndpoint(`wallet/${id}/chatterpoints/history`)
      }
    }
  },
  backend_bot: {
    sendMessage: () => getFullBotEndpoint('chatbot/conversations/send-message')
  }
}
