'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, CONTACT_EMAIL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

const TEAM_MEMBERS = [
  {
    name: 'Martín Pefaur',
    role: 'Co-Founder',
    avatar: '/assets/images/about-us/martin.jpg',
    description:
      'Financial technology expert with extensive experience in digital payment solutions.',
    linkedin: 'https://www.linkedin.com/in/mpefaur/',
    github: 'https://github.com/mpefaur'
  },
  {
    name: 'Tomás Di Mauro',
    role: 'Co-Founder',
    avatar: '/assets/images/about-us/tomas.jpg',
    description:
      'Blockchain specialist with extensive experience in secure payment systems and fintech innovation.',
    linkedin: 'https://www.linkedin.com/in/tomasdm/',
    github: 'https://github.com/TomasDmArg'
  },
  {
    name: 'Diego Baranowski',
    role: 'Co-Founder',
    avatar: '/assets/images/about-us/diego.jpg',
    description:
      'Blockchain specialist with extensive experience in secure payment systems and fintech innovation.',
    linkedin: 'https://www.linkedin.com/in/dappsar/',
    github: 'https://github.com/dappsar'
  }
]

const STORY_PHOTOS = ['/assets/images/about-us/founders.jpg']

export default function AboutUsView() {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()
  const theme = useTheme()

  // Helper function to get the correct founder bio translation key and fallback text
  const getFounderBio = (name: string) => {
    if (name === 'Martín Pefaur') {
      return t(
        'aboutUs.founders.martin',
        'Martin transitioned from a legal and business background into Web3 innovation, founding multiple blockchain startups and leading P4 Tech Solutions, Fin Guru, Chronos Pay, Sistem AI, Chatizalo, Hunters Pride, and Number One Fan.'
      )
    }
    if (name === 'Tomás Di Mauro') {
      return t(
        'aboutUs.founders.tomas',
        'Tomas is a full-stack developer and UI/UX specialist, passionate about creating scalable and user-friendly blockchain solutions. Prev. Lead Developer at FinGurú, dev at Argenenergy, and advisor at Invicta Ventures.'
      )
    }
    return t(
      'aboutUs.founders.diego',
      'Diego has over 25 years of experience in software development and architecture, having worked across multiple programming languages and deployed solutions on diverse platforms and cloud environments. He has led high-performance development teams in large corporations.'
    )
  }

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 10, md: 15 },
            pb: { xs: 6, md: 8 },
            textAlign: 'center'
          }}
        >
          <Container>
            <m.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography component='div' variant='overline' sx={{ color: 'text.disabled', mb: 2 }}>
                {t('aboutUs.hero.tag', 'About Us')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 3 }}>
                {t('aboutUs.hero.title', 'Our Mission')}
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary' }}>
                {t(
                  'aboutUs.hero.description',
                  'ChatterPay is revolutionizing the way people send money by combining secure payments with the most used messaging app in the world. Our mission is to make crypto simple, in order to onboard the next billion users.'
                )}
              </Typography>
            </m.div>
          </Container>
        </Box>

        {/* Company Story */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Container>
            <Grid container spacing={5} justifyContent='space-between' alignItems='center'>
              <Grid xs={12} md={5}>
                <m.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: false, margin: '-20px' }}
                >
                  <Typography variant='h3' sx={{ mb: 3 }}>
                    {t('aboutUs.story.title', 'Our Story')}
                  </Typography>

                  <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                    {t(
                      'aboutUs.story.text1',
                      'Founded in 2024 at The Level Up Hackathon by Ethereum Argentina, where we won 1st prize in the Keystore track and were the most voted team in Quadratic Funding. We also won at Ethereum Uruguay and ICP Chain Fusion Hackathon BA.'
                    )}
                  </Typography>

                  <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                    {t(
                      'aboutUs.story.text2',
                      'During these hackathons, we iterated the product based on feedback and early users. We were then selected for the Scroll Open Campus program in Kuala Lumpur, Malaysia.'
                    )}
                  </Typography>

                  <Typography sx={{ color: 'text.secondary' }}>
                    {t(
                      'aboutUs.story.text3',
                      'Malaysia is where we plan to start our launch campaigns and continue our mission of making crypto payments simple and accessible to everyone.'
                    )}
                  </Typography>
                </m.div>
              </Grid>

              <Grid xs={12} md={6}>
                <m.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: false, margin: '-20px' }}
                >
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: (themeObj) => themeObj.customShadows.z8
                    }}
                  >
                    <Box
                      component='img'
                      src={STORY_PHOTOS[0]}
                      alt='Founders'
                      sx={{
                        width: '100%',
                        height: { xs: 300, md: 400 },
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </m.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Team Section */}
        <Box sx={{ py: { xs: 10, md: 15 } }}>
          <Container>
            <m.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ textAlign: 'center', mb: 8 }}>
                {t('aboutUs.team.title', 'Meet Our Team')}
              </Typography>
            </m.div>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid container spacing={3} sx={{ maxWidth: 1000 }}>
                {TEAM_MEMBERS.map((member, index) => (
                  <Grid key={member.name} xs={12} sm={6} md={4}>
                    <m.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: false, margin: '-20px' }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          boxShadow: (themeObj) => themeObj.customShadows.z8
                        }}
                      >
                        <Avatar
                          src={member.avatar}
                          alt={member.name}
                          sx={{
                            width: 100,
                            height: 100,
                            mb: 2,
                            boxShadow: (themeObj) =>
                              `0 8px 16px 0 ${alpha(themeObj.palette.grey[500], 0.16)}`
                          }}
                        />
                        <Typography variant='subtitle1' sx={{ mb: 0.5 }}>
                          {member.name}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
                          {member.role}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary', flexGrow: 1 }}>
                          {getFounderBio(member.name)}
                        </Typography>

                        {/* Social Links */}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          {member.linkedin && (
                            <IconButton
                              component='a'
                              href={member.linkedin}
                              target='_blank'
                              size='small'
                              sx={{
                                color: '#0077B5',
                                '&:hover': { bgcolor: alpha('#0077B5', 0.08) }
                              }}
                            >
                              <Iconify icon='mdi:linkedin' />
                            </IconButton>
                          )}
                          {member.github && (
                            <IconButton
                              component='a'
                              href={member.github}
                              target='_blank'
                              size='small'
                              sx={{
                                color: 'text.primary',
                                '&:hover': { bgcolor: alpha('#000', 0.08) }
                              }}
                            >
                              <Iconify icon='mdi:github' />
                            </IconButton>
                          )}
                        </Box>
                      </Card>
                    </m.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>

        {/* Contact Us CTA */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Container>
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ textAlign: 'center', mb: 3 }}>
                {t('aboutUs.contact.title', 'Contact Us')}
              </Typography>

              <Typography
                variant='body1'
                sx={{
                  textAlign: 'center',
                  mb: 5,
                  color: 'text.secondary',
                  maxWidth: 720,
                  mx: 'auto'
                }}
              >
                {t(
                  'aboutUs.contact.description',
                  "We'd love to hear from you. Get in touch with our team for any inquiries, feedback, or support needs. You can reach us via email at"
                )}{' '}
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  <Link href={`mailto:${CONTACT_EMAIL}`} underline='hover'>
                    {CONTACT_EMAIL}
                  </Link>
                </Box>
              </Typography>
            </m.div>

            <Box sx={{ textAlign: 'center' }}>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: false, margin: '-20px' }}
              >
                <Button
                  variant='contained'
                  size='large'
                  href={BOT_WAPP_URL.replaceAll('MESSAGE', t('home.common.contact-us-wapp-msg'))}
                  target='_blank'
                  startIcon={<Iconify icon='ic:baseline-whatsapp' />}
                  sx={{ px: 3, py: 1.2 }}
                >
                  {t('aboutUs.contact.button', 'Chat With Us on WhatsApp')}
                </Button>
              </m.div>
            </Box>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  )
}
