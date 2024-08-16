import { useState, useCallback } from 'react'

import Box from '@mui/material/Box'
import Pagination, { paginationClasses } from '@mui/material/Pagination'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { INFT } from 'src/types/wallet'

import NftItem from './nft-item'

// ----------------------------------------------------------------------

type Props = {
  nfts: INFT[]
}

export default function NftList({ nfts }: Props) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  const handleView = useCallback(
    (id: string) => {
      router.push(paths.dashboard.nfts.content(id))
    },
    [router]
  )

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  console.log(nfts)

  const paginatedNfts = nfts.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
          <NftItem key={nft.id} nft={nft} onView={() => handleView(nft.id)} />
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
