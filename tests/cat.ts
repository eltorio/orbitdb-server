import { createLibp2p } from 'libp2p'
const myLibp2p = createLibp2p({}).then( async (node) => {
    await node.start()
    node.peerId.toString()
})