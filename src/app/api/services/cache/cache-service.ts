import NodeCache from 'node-cache'

const cacheClient = new NodeCache({ stdTTL: 60, checkperiod: 120 }) // stdTTL time in seconds.

export { cacheClient as cache }
