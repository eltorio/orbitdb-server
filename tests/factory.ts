import * as Ctl from 'ipfsd-ctl'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import all from 'it-all'

const factory = Ctl.createFactory(
    {
        type: 'js',
        test: false,
        disposable: true,
        ipfsHttpModule: (await import('ipfs-http-client')),
        ipfsModule: (await import('ipfs')),
        ipfsOptions: {
            EXPERIMENTAL: {
                ipnsPubsub: true
            },
        }
    },
    { // overrides per type
        js: {
            ipfsBin: (await import('ipfs')).path()
        }
    }
)

const api = (await factory.spawn({ type: 'js' })).api
const ipfs=api
const data = uint8ArrayConcat(await all(ipfs.cat('QmY4rTcFFeFo8uwuaT5env6PxzbJmpE2PQDbEJxGBtDrnw')))
const decoder = new TextDecoder()
console.log(decoder.decode(data))
ipfs.stop()

