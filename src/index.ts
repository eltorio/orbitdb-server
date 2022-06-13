import cors from 'cors'
import express from 'express'
import https from 'https'
import { config } from './config/config.js'
import * as pinningList from './pinningList/index.js'
import { orbitInstance } from './pinningList/orbitInstance.js'
import { ipfsInstance, jsIpfsAPI } from './ipfsInstance.js'
import { Multiaddr } from '@multiformats/multiaddr'
import type { PeersResult } from 'ipfs-core-types/swarm'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

const app = express()
app.use(cors())

app.get('/stats', async (req, res) => {
  const databases = await pinningList.getContents()
  const pinners = await pinningList.getPinners()
  const db = await orbitInstance();
  const pinnerStats = Object.values(pinners).map((pinner) => {
    return ({
      size: pinner.estimatedSize
    })
  })

  res.json({
    pinners: pinnerStats,
    num_databases: databases.length,
    databases: databases,
    localAddress: `/orbitdb/${db.address.root}/${db.address.path}`,
    total_size: pinnerStats.reduce((a, b) => a + b.size, 0)
  })
})

app.get('/pin', (req, res) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    pinningList.add(address)

    res.send(`adding... ${address}`)
  } else {
    res.send('missing \'address\' query parameter')
  }
})

app.get('/unpin', (req, res) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    pinningList.remove(address)

    res.send(`removing... ${address}`)
  } else {
    res.send('missing \'address\' query parameter')
  }
})

app.get('/connect', (req, res) => {
  const address = req.query.address

  if ((address !== undefined) && (typeof address === 'string')) {
    const mAddr = new Multiaddr(address)
    ipfsInstance.ipfs.swarm.connect(mAddr).then(() => { res.send(`Connected to ${address}`) })

  } else {
    res.send('missing \'address\' parameter')
  }
})

app.get('/findprovs', (req, res) => {
  const object = req.query.object
  const cid = CID.asCID(object)
  if (CID.isCID(cid)) {
    all(ipfsInstance.ipfs.dht.findProvs(cid)).then((provider) => {
      res.send(JSON.stringify(provider))
    })
  }
})

app.get('/get', (req, res) => {
  const object = req.query.object
  if ((object !== undefined) && (typeof object === 'string') && (object !== null)) {
    all(ipfsInstance.ipfs.cat(object)).then((u8data) => {
      res.send(new TextDecoder().decode(uint8ArrayConcat(u8data)))
    })
  }
})

app.get('/peers', (req, res) => {
  ipfsInstance.ipfs.swarm.peers().then((peers: PeersResult[]) => {
    res.header("Content-Type", 'application/json');
    res.send(`Connected to ${JSON.stringify(peers, null, 4)}`)
  })
})



app.get('/start', (req, res) => {
  res.send('start pinning')
  pinningList.startPinning()
})

// ipfsAPI.then((ipfsCtl) => {
//   ipfsInstance.ipfs = ipfsCtl.api;
jsIpfsAPI.then((ipfs) => {
  ipfsInstance.ipfs = ipfs;
  if (ipfsInstance.ipfs !== null) {
    if (process.env.TLS_KEY !== undefined && process.env.TLS_CERT !== undefined && config.API_PORT_TLS !== undefined) {
      const TLS_KEY = process.env.TLS_KEY
      const TLS_CERT = process.env.TLS_CERT
      const credentials = { key: TLS_KEY, cert: TLS_CERT };
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(config.API_PORT_TLS, () => console.log(`Express is listenning on TLS port ${config.API_PORT_TLS}`))
    } else {
      app.listen(config.API_PORT, () => console.log('Express is listenning'))
    }
  }
  else{
    console.log("Cannot start")
  }
})

