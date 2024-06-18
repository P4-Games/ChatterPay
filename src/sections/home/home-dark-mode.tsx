import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import Image from 'src/components/image'
import { useSettingsContext } from 'src/components/settings'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeDarkMode() {
  const settings = useSettingsContext()

  const renderDescription = (
    <Stack alignItems='center' spacing={3}>
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'primary.main' }}>
          Security
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant='h2' sx={{ color: 'common.white' }}>
          Highest degree of security and compliance
        </Typography>
      </m.div>

      {/*
      <m.div variants={varFade().inUp}>
        <Typography sx={{ color: 'grey.500' }}>
          A dark theme that feels easier on the eyes.
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Switch
          checked={settings.themeMode === 'dark'}
          onClick={() =>
            settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
          }
        />
      </m.div>
       */}
    </Stack>
  )

  const renderImg = (
    <m.div variants={varFade().inUp}>
      <Image
        alt='darkmode'
        // src='/assets/images/home/darkmode.webp'
        src='/assets/images/home/security.png'
        sx={{
          borderRadius: 2,
          my: { xs: 5, md: 10 },
          boxShadow: (theme) => `-40px 40px 80px ${alpha(theme.palette.common.black, 0.24)}`
        }}
      />
    </m.div>
  )

  /*
  const renderImg = (
    <m.div variants={varFade().inUp}>
  
      <Container className="w-layout-blockcontainer container-main w-container">
        <div className="content-section">
          <div className="head-section">
            <div className="auto-layout vertical-center gap-4px mobile-text-left">
              <div className="title-section">
                <Typography variant="h2" className="heading-style-h2 mobile-size-24px">
                  Highest degree of <span className="c-wallets-blue">security and compliance</span>
                </Typography>
              </div>
            </div>
          </div>
          <div className="box-grid-solution">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <div className="flex-highest">
                  <div className="column-hightest">
                    <div className="card-primary">
                      <div className="content-card-primary">
                        <div className="image-card-primary">
                          <img
                            src="https://cdn.prod.website-files.com/653a93effa45d5e5a3b8e1e8/65b53a7e349765854a605e86_spam%20filters%20img.svg"
                            loading="lazy"
                            alt=""
                            className="image-responsive"
                          />
                        </div>
                        <div className="head-card-primary">
                          <div className="title-section">
                            <div className="box-text-icon">
                              <img
                                src="https://cdn.prod.website-files.com/653a93effa45d5e5a3b8e1e8/65b53a2e83424289c11b225f_shield-03.svg"
                                loading="lazy"
                                alt=""
                              />
                              <Typography variant="h3" className="paragraph-medium _w-semi-bold">
                                Spam filters
                              </Typography>
                            </div>
                          </div>
                          <div className="description-section">
                            <Typography variant="body1" className="paragraph-normal">
                              Protect your users by hiding malicious NFTs that worsen the UX and put their assets at risk.
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <div className="flex-highest">
                  <div className="column-hightest">
                    <div className="card-primary">
                      <div className="content-card-primary">
                        <div className="image-card-primary">
                          <img
                            src="https://cdn.prod.website-files.com/653a93effa45d5e5a3b8e1e8/65b53bcbfe25b40f0cbdaff0_Anomaly%20detection%20img.svg"
                            loading="lazy"
                            alt=""
                            className="image-responsive"
                          />
                        </div>
                        <div className="head-card-primary">
                          <div className="title-section">
                            <div className="box-text-icon">
                              <img
                                src="https://cdn.prod.website-files.com/653a93effa45d5e5a3b8e1e8/65b53a2e272e384cb94ca559_file-search-02.svg"
                                loading="lazy"
                                alt=""
                              />
                              <Typography variant="h3" className="paragraph-medium _w-semi-bold">
                                Anomaly detection
                              </Typography>
                            </div>
                          </div>
                          <div className="description-section">
                            <Typography variant="body1" className="paragraph-normal">
                              Simulate transactions and optimize blockchain fees to ensure fast delivery at the lowest possible cost.
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
      
            </Grid >
          </div >
        </div >
      </Container >
    </m.div >
  )
  */

  return (
    <Box
      sx={{
        textAlign: 'center',
        bgcolor: 'grey.900',
        pt: { xs: 10, md: 15 },
        pb: { xs: 10, md: 20 }
      }}
    >
      <Container component={MotionViewport}>
        {renderDescription}

        {renderImg}
      </Container>
    </Box>
  )
}
