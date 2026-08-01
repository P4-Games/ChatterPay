import { useState } from 'react'

import Box from '@mui/material/Box'
import Pagination, { paginationClasses } from '@mui/material/Pagination'

import type { INFT } from 'src/types/wallet'

import NftItem from './nft-item'

// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 8

type Props = {
  nfts: INFT[]
}

/**
 * Paginated gallery grid of the wallet's NFTs.
 * @param {Props} props - NFTs to render.
 * @returns {JSX.Element} NFT grid with pagination.
 */
export default function NftList({ nfts }: Props) {
  const [page, setPage] = useState(1)

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const paginatedNfts = Array.isArray(nfts)
    ? nfts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : []

  return (
    <>
      <Box
        gap={3}
        display='grid'
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        }}
      >
        {paginatedNfts.map((nft) => (
          <NftItem key={nft.bddId} nft={nft} />
        ))}
      </Box>

      {nfts.length > ITEMS_PER_PAGE && (
        <Pagination
          count={Math.ceil(nfts.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={handleChangePage}
          sx={{
            mt: 5,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center'
            }
          }}
        />
      )}
    </>
  )
}
