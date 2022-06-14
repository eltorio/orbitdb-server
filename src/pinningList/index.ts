import OrbitDB from 'orbit-db'

import { Pinner as OrbitPinner } from '../OrbitPinner.js'
import { orbitInstance } from './orbitInstance.js'

interface IPinner {
  [index: string]: OrbitPinner;
}
const pinners = {} as IPinner

const getContents =
  async () => {
    const db = await orbitInstance()
    const dbContent = db.iterator({ limit: -1 })
      .collect()
      .map(
        e => {
          return e.payload.value as string
        }
      )
    return dbContent
  }

const getPinners = () => pinners

const add =
  async (address: string) => {
    const db = await orbitInstance()

    if (!OrbitDB.isValidAddress(address)) {
      console.log(`Failed to add ${address}. This is not a valid address`)
      return
    }

    const addresses = await getContents()

    if (!addresses.includes(address)) {
      await db.add(address)
      createPinnerInstance(address)

      console.log(`${address} added.`)
    } else {
      console.warn(`Attempted to add ${address}, but already present in db.`)
    }
  }

const createPinnerInstance =
  async (address: string) => {
    if (!OrbitDB.isValidAddress(address)) {
      console.log(`Failed to pin ${address}. This is not a valid address`)
      return {} as OrbitPinner
    }

    console.log(`Pinning orbitdb @ ${address}`)
    const pinner = await OrbitPinner.create(address)
    if (pinner.drop !== undefined) {
      pinners[address] = pinner

      return pinners[address]
    } else {
      return {} as OrbitPinner
    }
  }

const startPinning =
  async () => {
    const addresses = await getContents()

    if (addresses.length === 0) {
      console.log('Pinning list is empty')
    }

    addresses
      .map(createPinnerInstance)
  }

const remove =
  async (address: string) => {
    if (!OrbitDB.isValidAddress(address)) {
      console.log(`Failed to unpin ${address}. This is not a valid address`)
      return
    }

    const db = await orbitInstance()
    const dbAddresses = await getContents()

    // stop pinning
    if (pinners[address]) {
      console.log(`Stop pinning ${address}.`)
      pinners[address].drop()
      delete pinners[address]
      // Unfortunately, since we can't remove a item from the database without it's hash
      // So we have to rebuild the data every time we remove an item.
      await db.drop()

      dbAddresses
        .filter(addr => (addr !== address))
        .forEach(
          address => db.add(address)
        )
    }

    console.log(`${address} removed.`)
  }

const follow =
  async (address: string) => {
    if (!OrbitDB.isValidAddress(address)) {
      console.log(`Failed to follow ${address}. This is not a valid address`)

      return
    }

    // await db.drop()
    await orbitInstance(address)
    startPinning()
  }

console.log('Pinning previously added orbitdbs: ')
// getContents().then( (pinned) => {
//   pinned.forEach((pin)=>{console.log(pin)})
// })
// startPinning()

export {
  add,
  getContents,
  getPinners,
  remove,
  follow,
  startPinning
}
