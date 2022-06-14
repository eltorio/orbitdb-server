import { createLibp2p } from 'libp2p'
import wrtc from 'wrtc'
import { TCP } from '@libp2p/tcp'
import { WebSockets } from '@libp2p/websockets'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { MulticastDNS } from '@libp2p/mdns'
import { Bootstrap } from '@libp2p/bootstrap'
// import { FloodSub} from '@libp2p/floodsub'
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { KadDHT } from '@libp2p/kad-dht'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'
import type { Libp2pFactoryFnArgs } from 'ipfs-core/src/types'

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

// type Libp2pBundleOpts = {
//     peerId: PeerId,
//     config: {
//         Bootstrap: any
//     }
// }

export const serverLibp2p = (opts: Libp2pFactoryFnArgs) => {
  // Set convenience variables to clearly showcase some of the useful things that are available
  const peerId = opts.peerId
  const bootstrapList = opts.config?.Bootstrap !== undefined ? opts.config?.Bootstrap : []
  const swamList = opts.config?.Addresses?.Swarm !== undefined ? opts.config?.Addresses.Swarm : []
  // Build and return our libp2p node
  const myLibp2p = createLibp2p({
    peerId,
    addresses: {
      listen: [...swamList]
    },
    // Lets limit the connection managers peers and have it check peer health less frequently
    connectionManager: {
      minConnections: 25,
      maxConnections: 1000,
      pollInterval: 5000,
      dialTimeout: 60000,
      autoDial: true
    },
    transports: [
      new WebSockets(),
      new WebRTCStar({ wrtc }),
      new TCP()
    ],
    streamMuxers: [
      new Mplex()
    ],
    connectionEncryption: [
      new Noise()
    ],
    pubsub: new GossipSub(
      //     {
      //     emitSelf: false,                                  // whether the node should emit to self on publish
      //     globalSignaturePolicy: "NoStrictSign" as SignaturePolicy // message signing policy
      // }
    ),
    dht: new KadDHT({
      kBucketSize: 20,
      clientMode: true // Whether to run the WAN DHT in client or server mode (default: client mode)
    }),
    peerDiscovery: [
      new MulticastDNS({
        interval: 1000
      }),
      new Bootstrap(
        {
          list: [...bootstrapList],
          interval: 2000
        }
      )
    ],
    relay: { // Circuit Relay options (this config is part of libp2p core configurations)
      enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
      autoRelay: {
        enabled: true, // Allows you to bind to relays with HOP enabled for improving node dialability
        maxListeners: 2 // Configure maximum number of HOP relays to use
      }
    },
    identify: {
      protocolPrefix: 'ipfs'
    }
  })
  myLibp2p.then(node => {
    node.start()
    node.connectionManager.addEventListener('peer:connect', (connection) => {
      // console.log('Connection established to:', connection.detail.remotePeer.toCID().toString()) // Emitted when a new connection has been created
      console.log(`Connected peers ${node.connectionManager.getConnections().length} ${connection.detail.remoteAddr.toString()} ${connection.detail.stat.encryption}`)
    })
    //      node.addEventListener('peer:discovery', (peerId) => {
    //     // No need to dial, autoDial is on
    //     console.log('Discovered:', peerId.detail.id.toCID().toString())
    //   })
  })
  return myLibp2p
}
