const { MongoClient } = require('mongodb')

const MONGO_URI = process.argv[2]
const DB_NAME = process.env.DB_NAME || 'chatterpay'

if (!MONGO_URI) {
  console.error('Please provide the MongoDB URI as an argument:')
  console.error('Usage: node update-nfts.js <MONGO_URI>')
  process.exit(1)
}

const updateNfts = async () => {
  let client

  try {
    client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    const db = client.db(DB_NAME)
    const nftsCollection = db.collection('nfts')

    // Obtener todos los NFTs de la colección
    const nfts = await nftsCollection.find({}).toArray()

    // Crear un mapa para agrupar los NFTs por su campo "id"
    const groupedNfts = nfts.reduce((acc, nft) => {
      if (!acc[nft.id]) {
        acc[nft.id] = []
      }
      acc[nft.id].push(nft)
      return acc
    }, {})

    // Iterar sobre cada grupo de NFTs que comparten el mismo "id"
    for (const [id, nftsGroup] of Object.entries(groupedNfts)) {
      // Ordenar los NFTs por el campo _id para tener un orden definido
      nftsGroup.sort((a, b) => String(a._id).localeCompare(String(b._id)))

      // Tomar el primer NFT del grupo como el original
      const originalNft = nftsGroup[0]
      const currentTimestamp = new Date()

      // Actualizar el original
      await nftsCollection.updateOne(
        { _id: originalNft._id },
        {
          $set: {
            original: true,
            timestamp: currentTimestamp,
            copy_of: null
          }
        }
      )
      console.log(`Updated original NFT with _id: ${originalNft._id}`)

      // Actualizar el resto como copias
      for (let i = 1; i < nftsGroup.length; i++) {
        const copyNft = nftsGroup[i]

        // Incrementar el timestamp para cada copia
        const copyTimestamp = new Date(currentTimestamp.getTime() + i * 1000) // Agrega 1 segundo por copia

        await nftsCollection.updateOne(
          { _id: copyNft._id },
          {
            $set: {
              original: false,
              timestamp: copyTimestamp,
              copy_of: originalNft.id
            }
          }
        )
        console.log(`Updated copy NFT with _id: ${copyNft._id}`)
      }
    }

    console.log('NFTs update complete.')
  } catch (error) {
    console.error('Error connecting to MongoDB or updating NFTs:', error)
  } finally {
    if (client) {
      client.close()
    }
  }
}

updateNfts()
