export type IErrorResponse = {
  error: {
    code: string
    message: string
    details: string
    stack: string
    url?: string
  }
}
