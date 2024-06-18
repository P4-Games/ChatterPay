import Map from 'react-map-gl'
import { useState } from 'react'

import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'
import { MapPopup, MapMarker, MapControl } from 'src/components/map'

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  zIndex: 0,
  height: 560,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
    display: 'none'
  }
}))

// ----------------------------------------------------------------------

type CountryData = {
  latlng: number[]
  address: string
  phoneNumber: string
}

type Props = {
  contacts: CountryData[]
}

export default function ContactMap({ contacts }: Props) {
  const theme = useTheme()

  const lightMode = theme.palette.mode === 'light'

  const [popupInfo, setPopupInfo] = useState<CountryData | null>(null)

  return (
    <StyledRoot>
      <Map
        initialViewState={{
          latitude: 12,
          longitude: 42,
          zoom: 2
        }}
        mapStyle={`mapbox://styles/mapbox/${lightMode ? 'light' : 'dark'}-v10`}
      >
        <MapControl hideGeolocateControl />

        {contacts.map((country, index) => (
          <MapMarker
            key={`marker-${index}`}
            latitude={country.latlng[0]}
            longitude={country.latlng[1]}
            onClick={(event) => {
              event.originalEvent.stopPropagation()
              setPopupInfo(country)
            }}
          />
        ))}

        {popupInfo && (
          <MapPopup
            longitude={popupInfo.latlng[1]}
            latitude={popupInfo.latlng[0]}
            onClose={() => setPopupInfo(null)}
            sx={{
              '& .mapboxgl-popup-content': { bgcolor: 'common.white' },
              '&.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip': {
                borderTopColor: '#FFF'
              },
              '&.mapboxgl-popup-anchor-top .mapboxgl-popup-tip': {
                borderBottomColor: '#FFF'
              }
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              Address
            </Typography>

            <Typography component='div' variant='caption'>
              {popupInfo.address}
            </Typography>

            <Typography
              component='div'
              variant='caption'
              sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
            >
              <Iconify icon='solar:phone-bold' width={14} sx={{ mr: 0.5 }} />
              {popupInfo.phoneNumber}
            </Typography>
          </MapPopup>
        )}
      </Map>
    </StyledRoot>
  )
}
