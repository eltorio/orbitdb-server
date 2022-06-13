import * as IPFS from 'ipfs-core'
import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

const FILE = 'QmY4rTcFFeFo8uwuaT5env6PxzbJmpE2PQDbEJxGBtDrnw' //'/ipfs/QmRaaUwTNfwgFZpeUy8qrZwrp2dY4kCKmmB5xEqvH3vtD1/readme'
IPFS.create({
  repo: './tmp',
  start: true,
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
}).then((ipfs)=>{
  all(ipfs.cat(FILE)).then((u8data)=>{
    console.log((new TextDecoder()).decode(uint8ArrayConcat(u8data)))
    ipfs.stop()
  })
})


