import { Multiaddr } from '@multiformats/multiaddr'
import cors from 'cors'
import type { Express, Request, Response } from 'express'
import express from 'express'
import { auth } from 'express-openid-connect'
import https from 'https'
import type { PeersResult } from 'ipfs-core-types/swarm'
import all from 'it-all'
import { CID } from 'multiformats/cid'
import os from 'os'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { configAuth0, jwsHasPermissions, Permission } from './auth0helper.js'
import { config } from './config/config.js'
import { ipfsInstance, jsIpfsAPI } from './ipfsInstance.js'
import * as pinningList from './pinningList/index.js'
import { orbitInstance } from './pinningList/orbitInstance.js'
import rateLimit from 'express-rate-limit'
import escape from 'escape-html'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5
})

const app:Express = express()
app.use(cors()).use(limiter)

app.use(auth(configAuth0))

const routeAuth0Handler = (req:Request, res:Response) => {
  res.send('Logout')
}
app.get('/auth0', routeAuth0Handler)
app.post('/auth0', routeAuth0Handler)

app.get('/', async (req:Request, res:Response) => {
  const accessToken = req.oidc.accessToken
  res.send(`${accessToken?.token_type} ${accessToken?.access_token}`)
})

app.get('/stats', async (req:Request, res:Response) => {
  const databases = await pinningList.getContents()
  const pinners = await pinningList.getPinners()
  const db = await orbitInstance()
  const pinnerStats = Object.values(pinners).map((pinner) => {
    return ({
      size: pinner.estimatedSize
    })
  })

  res.json({
    pinners: pinnerStats,
    num_databases: databases.length,
    databases,
    localAddress: `/orbitdb/${db.address.root}/${db.address.path}`,
    total_size: pinnerStats.reduce((a, b) => a + b.size, 0)
  })
})

app.get('/pin', jwsHasPermissions(Permission.DB_PIN), (req:Request, res:Response) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    pinningList.add(address)

    res.send(`adding... ${escape(address)}`)
  } else {
    res.status(501).send('missing \'address\' query parameter')
  }
})

app.get('/unpin', jwsHasPermissions(Permission.DB_UNPIN), (req:Request, res:Response) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    pinningList.remove(address)

    res.send(`removing... ${escape(address)}`)
  } else {
    res.status(501).send('missing \'address\' query parameter')
  }
})

app.get('/connect', jwsHasPermissions(Permission.API_START), (req:Request, res:Response) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    const mAddr = new Multiaddr(address)
    ipfsInstance.ipfs.swarm.connect(mAddr).then(() => { res.send(`Connected to ${escape(address)}`) })
      .catch((reason) => {
        res.send(`Can't connect reason: ${reason}`)
      })
  } else {
    res.status(501).send('missing \'address\' parameter')
  }
})

app.get('/findprovs', jwsHasPermissions(Permission.READ_PEERS), (req:Request, res:Response) => {
  const object = req.query.object
  const cid = CID.parse(object as string)
  if (CID.asCID(cid) !== null) {
    all(ipfsInstance.ipfs.dht.findProvs(cid, { timeout: 10000 })).then((provider) => {
      res.send(JSON.stringify(provider))
    })
  }
})

app.get('/get', jwsHasPermissions(Permission.GET_OBJECT), (req:Request, res:Response) => {
  const object = req.query.object
  const cid = CID.parse(object as string)
  if (CID.asCID(cid) !== null) {
    all(ipfsInstance.ipfs.cat(cid)).then((u8data) => {
      res.send(new TextDecoder().decode(uint8ArrayConcat(u8data)))
    })
  } else {
    res.status(501).send('not a CID')
  }
})

app.get('/peers', jwsHasPermissions(Permission.READ_PEERS), (req:Request, res:Response) => {
  ipfsInstance.ipfs.swarm.peers().then((peers: PeersResult[]) => {
    res.header('Content-Type', 'application/json')
    res.send(`Connected to ${JSON.stringify(peers, null, 4)}`)
  })
})

app.get('/start', jwsHasPermissions(Permission.API_START), (req:Request, res:Response) => {
  res.send('start pinning')
  pinningList.startPinning()
})

app.get('/version', (req:Request, res:Response) => {
  ipfsInstance.ipfs.version().then((v) => {
    res.send(`IPFS version:${v.version} repo:${v.repo}`)
  }).catch((reason) => {
    console.log(`Fail to create jsipfs reason is: ${reason}`)
  })
})

// ipfsAPI.then((ipfsCtl) => {
//   ipfsInstance.ipfs = ipfsCtl.api;
console.log(`Starting on Heroku:${config.ON_HEROKU} on port: ${config.API_PORT} and tmpdir:${os.tmpdir()} `)
jsIpfsAPI().then((ipfs) => {
  console.log('jsipfs created')
  ipfsInstance.ipfs = ipfs
  if (ipfsInstance.ipfs !== null) {
    console.log('launching Express')
    if (process.env.TLS_KEY !== undefined && process.env.TLS_CERT !== undefined && config.API_PORT !== undefined) {
      const credentials = config.CREDENTIALS
      const httpsServer = https.createServer(credentials, app)
      httpsServer.listen(config.API_PORT, () => console.log(`Express is listenning on TLS port ${config.API_PORT}`))
    } else {
      app.listen(config.API_PORT, () => console.log(`Express is listenning on uncrypted port ${config.API_PORT}`))
    }
  } else {
    console.log('Cannot start')
  }
}).catch((reason) => {
  console.log(`Fail to create jsipfs reason is: ${reason}`)
})
