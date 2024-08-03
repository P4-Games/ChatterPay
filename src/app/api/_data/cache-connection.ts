import NodeCache from 'node-cache'

const cacheClient = new NodeCache({ stdTTL: 60, checkperiod: 120 }) // stdTTL es el tiempo en segundos

export { cacheClient as cache }
