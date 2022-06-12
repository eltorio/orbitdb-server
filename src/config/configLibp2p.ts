import {createLibp2p} from 'libp2p'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import wrtc from 'wrtc'
import { TCP } from '@libp2p/tcp'
import { WebSockets } from '@libp2p/websockets'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { MulticastDNS } from '@libp2p/mdns'
import { Bootstrap } from '@libp2p/bootstrap'
import { FloodSub} from '@libp2p/floodsub'
//import Gossipsub from 'libp2p-gossipsub'
import type { SignaturePolicy } from '@libp2p/interfaces/pubsub'
import { KadDHT } from '@libp2p/kad-dht'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

type Libp2pBundleOpts = {
    peerId:PeerId,
    config: {
        Bootstrap: any
    }
}
export const serverLibp2p = (opts:Libp2pBundleOpts) => {
    // Set convenience variables to clearly showcase some of the useful things that are available
    const peerId = opts.peerId
    const bootstrapList = opts.config.Bootstrap

    // Build and return our libp2p node
    return createLibp2p({
        peerId: peerId,
        addresses: {
            listen: [
                "/ip4/0.0.0.0/tcp/4002",
                "/ip6/::/tcp/4001",
                "/ip4/0.0.0.0/tcp/4003/ws",
                "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
                "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
                "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star",
                '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
            ]
        },
        // Lets limit the connection managers peers and have it check peer health less frequently
        connectionManager: {
            minConnections: 25,
            maxConnections: 100,
            pollInterval: 5000,
            autoDial: true,
        },
        transports: [
            new WebSockets(),
            new WebRTCStar({wrtc: wrtc}),
            new TCP()
        ],
        streamMuxers: [
            new Mplex()
        ],
        connectionEncryption: [
            new Noise()
        ],
        pubsub: new FloodSub({
            emitSelf: false,                                  // whether the node should emit to self on publish
            globalSignaturePolicy: "StrictSign" as SignaturePolicy // message signing policy
        }),
        dht: new KadDHT({
            kBucketSize: 20,
            clientMode: true           // Whether to run the WAN DHT in client or server mode (default: client mode)
        }),
        peerDiscovery: [
            new MulticastDNS({
                interval: 1000
            }),
            new Bootstrap(
                {
                    list: [ // A list of bootstrap peers to connect to starting up the node
                        "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
                        "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
                        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
                        "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
                        "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
                        "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
                    ],
                    interval: 2000
                }
            )
        ],
        relay: {                   // Circuit Relay options (this config is part of libp2p core configurations)
            enabled: true,           // Allows you to dial and accept relayed connections. Does not make you a relay.
            autoRelay: {
              enabled: true,         // Allows you to bind to relays with HOP enabled for improving node dialability
              maxListeners: 2         // Configure maximum number of HOP relays to use
            }
          },
    })
}