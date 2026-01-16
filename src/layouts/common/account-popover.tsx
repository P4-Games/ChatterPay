import { m } from 'framer-motion'

import Avvvatars from 'avvvatars-react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'

import { varHover } from 'src/components/animate'
import { useSnackbar } from 'src/components/snackbar'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter()
  const { t } = useTranslate()

  const OPTIONS = [
    {
      label: t('menu.account'),
      linkTo: paths.dashboard.user.root
    }
  ]

  const { user } = useAuthContext()

  const { logout } = useAuthContext()

  const { enqueueSnackbar } = useSnackbar()

  const popover = usePopover()

  const handleLogout = async () => {
    try {
      await logout(user?.id)
      popover.onClose()
      router.replace('/')
    } catch (error) {
      console.error(error.message)
      enqueueSnackbar('Unable to logout!', { variant: 'error' })
    }
  }

  const handleClickItem = (path: string) => {
    popover.onClose()
    router.push(path)
  }

  return (
    <>
      <IconButton
        component={m.button as any}
        whileTap='tap'
        whileHover='hover'
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
          })
        }}
      >
        <Box
          sx={{
            minWidth: 34,
            position: 'relative',
            left: -0.2
          }}
        >
          <Avvvatars
            value={user?.phoneNumber || user?.displayName || ''}
            displayValue={user?.displayName?.substring(0, 2).toUpperCase()}
            style='shape'
            size={34}
          />
        </Box>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant='subtitle2' noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant='body2' sx={{ color: 'text.secondary' }} noWrap>
            {user?.phoneNumber}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          {t('menu.logout')}
        </MenuItem>
      </CustomPopover>
    </>
  )
}
