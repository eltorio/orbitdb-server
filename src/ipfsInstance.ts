import * as IPFS from 'ipfs-core'
import * as Ctl from 'ipfsd-ctl'
import wrtc from 'wrtc'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { MulticastDNS } from '@libp2p/mdns'
import { Bootstrap } from '@libp2p/bootstrap'

const webRtcStar = new WebRTCStar({ wrtc: wrtc })
export const ipfsInstance = {
  http: {
    port: 3000,
    enabled: true
  },
  ipfs: {} as IPFS.IPFS,
}

export const jsIpfsAPI = IPFS.create({
  repo: './orbitdb/server',
  start: true,
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip4/127.0.0.1/tcp/4003/ws",
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star"
      ]
    }
  },
  libp2p: {
    transports: [
      webRtcStar,
    ],
    peerDiscovery: [
      webRtcStar.discovery,
      new MulticastDNS({
        interval: 1000
      }),
      new Bootstrap(
        {
          list: [
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
            "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
            "/ip4/51.38.33.64/tcp/4001/p2p/12D3KooWH5WkyAW7UfrtW51C2ecQtu475CvB633eYihsgdzaQUg9"
          ],
          interval: 2000
        }
      )
    ]
  }
})

export const ipfsAPI = Ctl.createFactory(
  {
    type: 'js',
    test: false,
    disposable: true,
    ipfsHttpModule: (await import('ipfs-http-client')),
    ipfsModule: (await import('ipfs')),
    ipfsOptions: {
      start: true,
      EXPERIMENTAL: {
        ipnsPubsub: true
      },
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
            // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
            // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
            // "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star"
          ]
        },
        Discovery:{
          webRTCStar: true,
          MDNS: true
        }
      },
    }
  },
  { // overrides per type
    js: {
      ipfsBin: (await import('ipfs')).path()
    }
  }
).spawn()
