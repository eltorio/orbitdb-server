import OrbitDB from 'orbit-db'
import FeedStore from 'orbit-db-feedstore';
import { ipfsInstance } from '../ipfsInstance.js'
import { Multiaddr } from '@multiformats/multiaddr'

let orbitDbInstance: OrbitDB;
let pinningListDb: FeedStore<unknown>;

const createDbInstance = () => {
  return new Promise<OrbitDB>((resolve) => {
    if (orbitDbInstance === undefined) {
      ipfsInstance.ipfsModule
        .then((_ipfsInstance) => {
          ipfsInstance._ipfsInstance = _ipfsInstance;
          _ipfsInstance.id().then((id) => {
            console.log(`Local peerID: ${id.id.toString()}`)
          })
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
  console.log(`pinningListDB address is ${pinningListDb.address.root}/${pinningListDb.address.path}`)
  return pinningListDb
}

export { orbitInstance }
