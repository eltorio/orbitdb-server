const privatePeers = process.env.PRIVATE_PEERS !== undefined ? process.env.PRIVATE_PEERS.split(';') as string[] : []
const rand100 = () => {
  let zero = '00'
  try {
    zero = (Math.floor(Math.random() * 100)).toString().padStart(2, '0')
  } finally {
    zero = '00'
  }
  return zero
}

export const config = {
  API_PORT: 3000,
  API_PORT_TLS: 3000, // only one server will run, ie: if (process.env.TLS_KEY !== undefined && process.env.TLS_CERT !== undefined && config.API_PORT_TLS !== undefined)
  SupSwarms: [
    `/ip4/0.0.0.0/tcp/4${rand100()}2`,
    `/ip4/0.0.0.0/tcp/4$${rand100()}3/ws`,
    `/ip6/::/tcp/4${rand100()}4`,
    `/ip6/::/tcp/4${rand100()}5/ws`,
    // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
    // '/dns6/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    // '/dns6/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
  ],
  PrivatePeers: [
    ...privatePeers
  ]
}
