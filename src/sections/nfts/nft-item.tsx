import Box from '@mui/material/Box'
import { Link } from '@mui/material'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import { EXPLORER_NFTS } from 'src/config-global'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { INFT } from 'src/types/wallet'

// ----------------------------------------------------------------------

type Props = {
  nft: INFT
  onView: VoidFunction
}

export default function NftItem({ nft: bot, onView }: Props) {
  const { t } = useTranslate()
  const popover = usePopover()

  const { trxId, metadata } = bot

  const linkTrx = `${EXPLORER_NFTS}/tx/${trxId}`

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon='eva:more-vertical-fill' />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2, alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: 0,
              paddingBottom: '100%',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Avatar
              alt='nft'
              src={metadata.image_url}
              variant='rounded'
              sx={{
                position: 'absolute',
                marginLeft: 1.5,
                marginTop: 2.5,
                marginBottom: 2.5,
                width: '90%',
                height: '90%',
                borderRadius: 2,
                overflow: 'hidden',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Link href={linkTrx} target='_blank' rel='noopener' color='inherit' underline='none'>
              <Stack direction='row' spacing={1.5} alignItems='center'>
                <Iconify width={16} icon='mdi:swap-horizontal' />
                <Typography variant='caption'>{t('nfts.view-trx')}</Typography>
              </Stack>
            </Link>

            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Iconify width={16} icon='arcticons:openai-chatgpt' />
              <Typography variant='caption'>{metadata.description}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow='right-top'>
        <MenuItem
          onClick={() => {
            popover.onClose()
            onView()
          }}
        >
          <Iconify icon='solar:eye-bold' />
          {t('common.view')}
        </MenuItem>
      </CustomPopover>
    </>
  )
}
