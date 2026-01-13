import type { ReactQuillProps } from 'react-quill'

import type { Theme, SxProps } from '@mui/material/styles'

// ----------------------------------------------------------------------

export interface EditorProps extends ReactQuillProps {
  error?: boolean
  simple?: boolean
  helperText?: React.ReactNode
  sx?: SxProps<Theme>
}
