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
const ON_HEROKU = process.env.ON_HEROKU !== undefined ? process.env.ON_HEROKU === '1' ? true : false : false
const CREDENTIALS = (process.env.TLS_KEY !== undefined && process.env.TLS_CERT !== undefined) ? { key: process.env.TLS_KEY, cert: process.env.TLS_CERT } : {key:'',cert:''}
export const config = {
  ON_HEROKU: ON_HEROKU,
  API_PORT: process.env.PORT !== undefined ? Number(process.env.PORT) : 3000,
  CREDENTIALS: CREDENTIALS,
  SupSwarms: !ON_HEROKU ? [
    `/ip4/0.0.0.0/tcp/4${rand100()}2`,
    `/ip4/0.0.0.0/tcp/4$${rand100()}3/ws`,
    `/ip6/::/tcp/4${rand100()}4`,
    `/ip6/::/tcp/4${rand100()}5/ws`,
  ] : [
    '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    // '/dns6/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
    // '/dns6/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
  ]
  ,
  PrivatePeers: [
    ...privatePeers
  ]
}
