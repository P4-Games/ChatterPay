const { MongoClient } = require('mongodb')

const MONGO_URI = process.argv[2]
const DB_NAME = process.env.DB_NAME || 'chatterpay-dev'

if (!MONGO_URI) {
  console.error('Please provide the MongoDB URI as an argument:')
  console.error('Usage: node nfts-metadata-format.js <MONGO_URI>')
  process.exit(1)
}

const transformMetadata = (metadata) => {
  const { image, image_url, ...rest } = metadata
  return {
    ...rest,
    image_url: {
      gcp: image_url || image || '',
      ipfs: '',
      icp: ''
    } 
  }
}

const updateNftsMetadata = async () => {
  let client

  try {
    client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    const db = client.db(DB_NAME)
    const nftsCollection = db.collection('nfts')

    const nfts = await nftsCollection.find({}).toArray()

    for (const nft of nfts) {
      const transformedMetadata = transformMetadata(nft.metadata)

      // Actualizar el campo "metadata" solo si hubo algún cambio
      if (JSON.stringify(transformedMetadata) !== JSON.stringify(nft.metadata)) {
        await nftsCollection.updateOne(
          { _id: nft._id }, // Filtrar por ID
          { $set: { metadata: transformedMetadata } } // Actualizar el campo "metadata"
        )
        console.log(`Updated NFT with _id: ${nft._id}`)
      }
    }

    console.log('Metadata transformation complete.')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  } finally {
    if (client) {
      client.close()
    }
  }
}

updateNftsMetadata()
