import { expressjwt } from 'express-jwt'
import https from 'https'
import type { ConfigParams } from 'express-openid-connect'
import type { Request, Response, NextFunction } from 'express'
import { unless } from 'express-unless'
import * as jose from 'jose'

const algorithm = 'RS256'

export enum Permission {
  // eslint-disable-next-line no-unused-vars
  READ_PEERS = 'read:peers',
  // eslint-disable-next-line no-unused-vars
  API_START = 'api:start',
  // eslint-disable-next-line no-unused-vars
  DB_PIN = 'db:pin',
  // eslint-disable-next-line no-unused-vars
  DB_UNPIN = 'db:unpin',
  // eslint-disable-next-line no-unused-vars
  GET_OBJECT = 'get:object'
}

export interface Key {
  alg: string;
  kty: string;
  use: string;
  n: string;
  e: string;
  kid: string;
  x5t: string;
  x5c: string[];
}

export interface WellKnownJWKS {
  keys: Key[];
  domain: string;
}

/**
 *
 * @param variable defined environment variable
 * @returns
 */
const getRequiredEnvVariable = (variable: string): string => {
  const envVariable = process.env[variable]
  if (envVariable !== undefined) {
    return envVariable
  } else {
    throw new RangeError(`Must declare ${variable}`)
  }
}

/**
 *
 * @returns a promise containing the jwks hosted by Auth0
 */
function getJwks (): Promise<WellKnownJWKS> {
  console.log(`retrieve ${getRequiredEnvVariable('AUTH0_URI')}`)
  const url = getRequiredEnvVariable('AUTH0_URI')
  return new Promise<WellKnownJWKS>((resolve, reject) => {
    https.get(url, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        const jdata = JSON.parse(data) as WellKnownJWKS
        jdata.domain = getRequiredEnvVariable('AUTH0_DOMAIN')
        resolve(jdata)
      })
    }).on('error', err => {
      console.log(err.message)
      reject(err)
    })
  })
}

/**
 * store well known jwks
 */
export const wkJwks = getJwks()

/**
 * store the signing certificate of the jwk
 */
export const wkJwksX509cert = `-----BEGIN CERTIFICATE-----\n${(await wkJwks).keys[0].x5c}\n-----END CERTIFICATE-----`

/**
 * get the access token as a jwt string
 * this is used only for extracting the token from the Bearer header
 * @internal
 * @param req
 * @returns
 */
const getAccessToken = (req: Request) => {
  console.log(req.oidc.accessToken)
  return req.oidc.accessToken?.access_token
}

/**
 * @param token JWT token as string
 * @param issuer Auth0 domain
 * @param now number of seconds from 01/01/1970
 * @returns false if token is invalid or a valid JWTVerifyResult
 */
export const verifyToken = (
  token: string,
  issuer: string,
  now: number
): Promise<boolean | jose.JWTVerifyResult> => {
  return new Promise((resolve) => {
    jose.importX509(wkJwksX509cert, algorithm).then((pubkey) => {
      jose
        .jwtVerify(token, pubkey)
        .then((jwt) => {
          if (
            jwt.payload !== undefined &&
            jwt.payload.iat !== undefined &&
            jwt.payload.exp !== undefined &&
            issuer === jwt.payload.iss &&
            jwt.payload.iat < now &&
            jwt.payload.exp > now
          ) {
            resolve(jwt)
          } else {
            resolve(false)
          }
        })
        .catch(() => {
          resolve(false)
        })
    })
  })
}

/**
 * Express middleware
 * check if access token has the requested pemission(s)
 * continue to next:NextFunction if all the permissions
 * are granted
 * otherwise send a 401 status with error message
 * @param permissions
 * @returns
 */
export const jwsHasPermissions = (permissions: Permission | Permission[]) => {
  const middleware = async (req: Request, res: Response, next: NextFunction) => {
    let requiredPermissions: string[] = []
    if (typeof permissions === 'string') {
      // permission is a string not a string array
      requiredPermissions.push(permissions)
    } else {
      requiredPermissions = permissions
    }
    const accessToken = getAccessToken(req)
    if (accessToken !== undefined) {
      const jwt = await verifyToken(accessToken, getRequiredEnvVariable('AUTH0_DOMAIN'), Date.now() / 1000)
      if (typeof jwt !== 'boolean') {
        let isAllowed = true
        if (jwt.payload.permissions !== undefined) {
          const permissions: string[] = jwt.payload.permissions as string[]
          requiredPermissions.forEach((requiredPermission) => {
            const permissionPosition: number =
              permissions.indexOf(requiredPermission)
            permissionPosition >= 0 && isAllowed
              ? (isAllowed = true)
              : (isAllowed = false)
          })
          if (isAllowed) {
            next()
          } else {
            res.status(401).send('Permission(s) not granted in token')
          }
        } else {
          res.status(401).send('Token has no permission')
        }
      } else {
        res.status(401).send('Token is invalid')
      }
    } else {
      res.status(401).send('No access token provided, please log in before')
    }
  }
  middleware.unless = unless
  return middleware
}

/**
 * express-jwt middleware with embedded configuration
 */
export const jwtCheck = expressjwt(
  {
    getToken: getAccessToken,
    secret: wkJwksX509cert,
    audience: getRequiredEnvVariable('AUTH0_AUDIENCE'),
    issuer: getRequiredEnvVariable('AUTH0_DOMAIN'),
    algorithms: ['RS256']
  })

/**
 * Auth0 configuration
 */
export const configAuth0: ConfigParams = {
  authRequired: false,
  auth0Logout: true,
  secret: getRequiredEnvVariable('LONG_SECRET'),
  clientSecret: getRequiredEnvVariable('AUTH0_SECRET'),
  baseURL: getRequiredEnvVariable('BASE_URL'),
  clientID: getRequiredEnvVariable('AUTH0_CLIENT_ID'),
  issuerBaseURL: getRequiredEnvVariable('AUTH0_DOMAIN'),
  routes: {
    postLogoutRedirect: '/auth0'
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email db:peers',
    audience: getRequiredEnvVariable('AUTH0_AUDIENCE')
  }
}
