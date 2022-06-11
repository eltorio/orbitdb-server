import OrbitDB from 'orbit-db'
import FeedStore from 'orbit-db-feedstore';
import {ipfsInstance} from '../ipfsInstance.js'
import { Multiaddr } from '@multiformats/multiaddr'

let orbitDbInstance: OrbitDB;
let pinningListDb: FeedStore<unknown>;

const createDbInstance = () => {
  return new Promise<OrbitDB>((resolve) => {
    if (orbitDbInstance === undefined) {
      ipfsInstance.ipfsModule
        .then((_ipfsInstance) => {
          ipfsInstance._ipfsInstance = _ipfsInstance;
          //_ipfsInstance.bootstrap.list().then((vals)=>{console.log(vals)})
          //_ipfsInstance.swarm.connect("/ip4/51.38.33.64/tcp/4001/p2p/12D3KooWH5WkyAW7UfrtW51C2ecQtu475CvB633eYihsgdzaQUg9")
          //_ipfsInstance.swarm.connect("/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/p2p/QmZCMVrmhdQo9KQbW8NyoSzi4dwiTwxpA3naC8QjD1X4W1");
          OrbitDB.createInstance(_ipfsInstance, {
            directory: './orbitdb/pinner/Manifest'
          } as any).then((db) => {
            orbitDbInstance = db;
            resolve(orbitDbInstance)
          })
        })
    } else {
      resolve(orbitDbInstance)
    }
  })
}

const orbitInstance = async (addr?: string) => {
  if (pinningListDb === undefined) {
    const address = addr !== undefined ? addr : 'dbList';
    const dbInstance = await createDbInstance()

    const pinningList = {
      create: true,
      overwrite: true,
      localOnly: false
    }

    pinningListDb = await dbInstance.feed(address, pinningList)
  }
  await pinningListDb.load()
  return pinningListDb
}

export { orbitInstance }
