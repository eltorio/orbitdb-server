import { create } from 'ipfs-core'
import OrbitDB from 'orbit-db'

create({
  repo: './orbitdb/pinner',
  start: true,
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
  config: {}
}).then((ipfs) => {
  OrbitDB.createInstance(ipfs,
    { directory: '.' })
    .then((db) => {
      console.log(db.id)
    })
})
