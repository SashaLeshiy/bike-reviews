export default defineEventHandler(async (event) => {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: useRuntimeConfig().cookieSecure,
    sameSite: 'lax',
    path: '/',
    domain: useRuntimeConfig().cookieDomain
  })

  return {
    success: true,
    message: 'Logged out successfully'
  }
})