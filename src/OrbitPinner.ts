'use strict'
import OrbitDB from 'orbit-db'
import Store from 'orbit-db-store';
import {ipfsInstance} from './ipfsInstance.js'

let orbitdb: OrbitDB

class Pinner {

  private db: Store;
  private address: string;

  constructor (db: Store) {
    this.db = db
    this.address = db.address.path ;
  }

  static async create (address: string) {
    const ipfs = await ipfsInstance.ipfsModule
    console.log(`use ${(await ipfs.id()).id}`)
    if (!orbitdb) orbitdb = await OrbitDB.createInstance(ipfs)
    const db = await Pinner.openDatabase(orbitdb, address)
    return Promise.resolve(new Pinner(db))
  }

  drop () {
    // console.log(this.orbitdb)
    // this.orbitdb.disconnect()
  }

  get estimatedSize () {
    let size = 0

    if (this.db) {
      // This is very crude
      size = JSON.stringify(this.db.all).length
    }

    return size
  }

  static async openDatabase (orbitdb: OrbitDB, address: string):Promise<Store>{
      if (!OrbitDB.isValidAddress(address)) {
        console.log(`Failed to add ${address}. This is not a valid address`)
        return {} as Store
      }

      console.log(`opening database from ${address}`)
      const db = await orbitdb.open(address, { replicate: true,
        create: true,
        localOnly: false, })

      console.log('Listening for updates to the database...')
      db.events.on('load.progress', (address, hash, entry, progress, total) => {console.log(`Load progress ${address}:${progress}`)} )
      db.events.on('replicate.progress', (address, hash, entry, progress, have) => {console.log(`Replicate progress ${address}:${progress}`)} )
      db.events.on('replicated', () => {
        console.log(`replication event fired`)
      })
      await db.load()
      console.log(`db ${address} loaded`) 
      return db
    }
}

export {Pinner}
