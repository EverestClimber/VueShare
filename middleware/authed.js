import { getUserCustomClaims } from '~/utils/customClaims'

const nonAuthedRoutes = [
  '/sign-up',
  '/log-in',
  '/widgets',
  '/email-verification-failed',
  '/apply',
  '/quote',
  '/widgets'
]

const redirectHomeRoutes = [
  '/log-in',
  '/sign-up',
  'verify-email'
]

const isNonAuthedRoute = (r) => {
  return nonAuthedRoutes
    .map(x => r.path.startsWith(x))
    .some(x => x)
}

const isRedirectHomeRoute = (r) => {
  return redirectHomeRoutes
    .map(x => r.path.startsWith(x))
    .some(x => x)
}

export default async ({ store, redirect, route }) => {
  if (!store.state.userID && !isNonAuthedRoute(route)) { // if no user and is auth route
    return redirect('/log-in')
  } else if (store.state.userID && isRedirectHomeRoute(route)) {
    const customClaims = await getUserCustomClaims()
    return customClaims.emailVerified ? redirect('/home') : redirect('/verify-email', { email: customClaims.email })
  } else {
    return true
  }
}

export { isRedirectHomeRoute }
