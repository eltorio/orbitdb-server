import * as IPFS from 'ipfs-core'

const ipfs = IPFS.create({
  repo: './orbitdb/pinner',
  start: true,
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip4/127.0.0.1/tcp/4003/ws"
      ]
    },
  }
})

export const ipfsInstance = {
  http: {
    port: 3000,
    enabled: true
  },
  ipfsModule: ipfs
}

