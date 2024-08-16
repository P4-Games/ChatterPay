import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

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

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon='eva:more-vertical-fill' />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2 }}>
          <Avatar
            alt='nft'
            src={metadata.image_url}
            variant='rounded'
            sx={{ width: 180, height: 180, mb: 2 }}
          />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box rowGap={1.5} display='grid' gridTemplateColumns='repeat(2, 1fr)' sx={{ p: 3 }}>
          <Stack
            spacing={0.5}
            flexShrink={0}
            direction='column'
            alignItems='center'
            sx={{ color: 'text.disabled', minWidth: 0 }}
          >
            <Stack
              spacing={0.5}
              flexShrink={0}
              direction='row'
              alignItems='center'
              sx={{ color: 'text.disabled', minWidth: 0 }}
            >
              <Iconify width={16} icon='arcticons:openai-chatgpt' sx={{ flexShrink: 0 }} />
              <Typography variant='caption' noWrap>
                {metadata.description}
              </Typography>
            </Stack>
            <Stack
              spacing={0.5}
              flexShrink={0}
              direction='row'
              alignItems='center'
              sx={{ color: 'text.disabled', minWidth: 0 }}
            >
              <Iconify width={16} icon='arcticons:openai-chatgpt' sx={{ flexShrink: 0 }} />
              <Typography variant='caption' noWrap>
                {trxId}
              </Typography>
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
