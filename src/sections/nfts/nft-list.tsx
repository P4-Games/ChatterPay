import { useState } from 'react'

import Box from '@mui/material/Box'
import Pagination, { paginationClasses } from '@mui/material/Pagination'

import { INFT } from 'src/types/wallet'

import NftItem from './nft-item'

// ----------------------------------------------------------------------

type Props = {
  nfts: INFT[]
}

export default function NftList({ nfts }: Props) {
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

 const paginatedNfts = Array.isArray(nfts)
    ? nfts.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : []

  return (
    <>
      <Box
        gap={3}
        display='grid'
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        }}
      >
        {paginatedNfts.map((nft) => (
          <NftItem key={nft.bddId} nft={nft} />
        ))}
      </Box>

      {nfts.length > itemsPerPage && (
        <Pagination
          count={Math.ceil(nfts.length / itemsPerPage)}
          page={page}
          onChange={handleChangePage}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center'
            }
          }}
        />
      )}
    </>
  )
}
