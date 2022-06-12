import * as IPFS from 'ipfs-core'
import {serverLibp2p} from './config/configLibp2p.js'

const ipfs = IPFS.create({
  repo: './orbitdb/pinner',
  start: true,
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
  libp2p: serverLibp2p as any,
  config: {
    Bootstrap: [
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
      "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
      "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
      "/ip4/51.38.33.64/tcp/4001/p2p/12D3KooWH5WkyAW7UfrtW51C2ecQtu475CvB633eYihsgdzaQUg9"
    ],
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip6/::/tcp/4001",
        "/ip4/0.0.0.0/tcp/4003/ws",
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star"
      ]
    },
  }
})

export const ipfsInstance = {
  http: {
    port: 3000,
    enabled: true
  },
  ipfsModule: ipfs,
  _ipfsInstance: {} as IPFS.IPFS,
}

