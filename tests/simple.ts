import * as IPFS from 'ipfs-core'
import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import wrtc from 'wrtc'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { MulticastDNS } from '@libp2p/mdns'
import { Bootstrap } from '@libp2p/bootstrap'

const FILE = 'QmY4rTcFFeFo8uwuaT5env6PxzbJmpE2PQDbEJxGBtDrnw' //'/ipfs/QmRaaUwTNfwgFZpeUy8qrZwrp2dY4kCKmmB5xEqvH3vtD1/readme'
const webRtcStar = new WebRTCStar({ wrtc: wrtc })

IPFS.create({
  repo: './tmp',
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
}).then((ipfs) => {
  all(ipfs.cat(FILE)).then((u8data) => {
    console.log((new TextDecoder()).decode(uint8ArrayConcat(u8data)))
    ipfs.stop().then(() => {
      console.log('ended')
    })
  })
})


