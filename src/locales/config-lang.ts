'use client'

import merge from 'lodash/merge'
// date fns
import { es as esESAdapter, enUS as enUSAdapter, ptBR as ptBRAdapter } from 'date-fns/locale'

// core (MUI)
import { enUS as enUSCore, esES as esESCore, ptBR as ptBRCore } from '@mui/material/locale'
// date pickers (MUI)
import { enUS as enUSDate, esES as esESDate, ptBR as ptBRDate } from '@mui/x-date-pickers/locales'
// data grid (MUI)
import { enUS as enUSDataGrid, esES as esESDataGrid, ptBR as ptBRDataGrid } from '@mui/x-data-grid'

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'USD'
    }
  },
  {
    label: 'Spanish',
    value: 'es',
    systemValue: merge(esESDate, esESDataGrid, esESCore),
    adapterLocale: esESAdapter,
    icon: 'flagpack:es',
    numberFormat: {
      code: 'es-ES',
      currency: 'ARS'
    }
  },
  {
    label: 'Portuguese',
    value: 'br',
    systemValue: merge(ptBRDate, ptBRDataGrid, ptBRCore),
    adapterLocale: ptBRAdapter,
    icon: 'flagpack:br',
    numberFormat: {
      code: 'pt-BR',
      currency: 'BRL'
    }
  }
]

export const defaultLang = allLangs[0] // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
