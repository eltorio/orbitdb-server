import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import * as pinningList from './pinningList/index.js'
import { orbitInstance } from './pinningList/orbitInstance.js'
import { ipfsInstance } from './ipfsInstance.js'
import { Multiaddr } from '@multiformats/multiaddr'
import type { PeersResult } from 'ipfs-core-types/swarm'
import { CID } from 'multiformats/cid'

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
    ipfsInstance.ipfsModule.then((ipfs) => {
      ipfs.swarm.connect(mAddr).then(() => { res.send(`Connected to ${address}`) })
        .catch((reason) => {
          res.send(`Fail to connect reason is ${reason}`)
        })
    })
  } else {
    res.send('missing \'address\' parameter')
  }
})

app.get('/findprovs', (req, res) => {
  const object = req.query.object

  if ((object !== undefined) && (typeof object === 'string') && (object !== null)) {
    ipfsInstance.ipfsModule.then((ipfs) => {
      const cid = CID.asCID(object)
      if (cid !== null) {

        (async () => {
          for await (const proviver of ipfs.dht.findProvs(cid)) {
            res.send(JSON.stringify(proviver))
          }
        })
      }
    })
  }

})

app.get('/peers', (req, res) => {
  ipfsInstance.ipfsModule.then((ipfs) => {
    ipfs.swarm.peers().then((peers: PeersResult[]) => { res.send(`Connected to ${JSON.stringify(peers)}`) })
      .catch((reason) => {
        res.send(`Fail to connect reason is ${reason}`)
      })
  })
})



app.get('/start', (req, res) => {
  res.send('start pinning')
  pinningList.startPinning()
})
app.listen(config.API_PORT, () => console.log('Express is listenning'))

