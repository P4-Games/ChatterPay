import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'

import Iconify from 'src/components/iconify'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeFaQ() {
  const _faqs = [
    {
      id: '95330023-92ea-4a65-accd-7424a42c41bd',
      question: 'What is ChatterPay?',
      answer:
        'ChatterPay is a Wallet for WhatsApp that integrates AI and Account Abstraction to allow any user to easily and securely manage funds on the blockchain without technical knowledge.'
    },
    {
      id: 'de6f266f-79b0-4cd7-bc07-80c6637e6c14',
      question: 'How can I create a wallet?',
      answer: 'To create a wallet, you can do it directly from the ChatterPay Bot on WhatsApp.'
    },
    {
      id: '10c35edb-2083-4de9-975d-312297710982',
      question: 'What are the fees associated with receiving payments?',
      answer: 'ChatterPay charges a 0.01% fee for each received transfer.'
    },
    {
      id: 'c73c85f0-c39f-41b7-8ca2-4dd1ee764000',
      question: 'Can I swap between different tokens?',
      answer:
        'Yes, you can swap between USDT, DAI, MATIC, ETH, BTC, ADA, and DOT without transaction limits.'
    },
    {
      id: 'be52d807-e514-4e3a-b203-537b33e37466',
      question: 'How can I check my balance and transactions?',
      answer:
        'You can check your balance and transactions at any time through our dashboard at https://chatterpay.vercel.app/.'
    },
    {
      id: '5bcd81f3-3e80-4db3-8495-6f452e3d0a49',
      question: 'What happens if I lose my tokens?',
      answer:
        'The system is decentralized, and the user is entirely responsible for managing their accounts. We do not offer insurance or support in case of losses due to user error.'
    },
    {
      id: 'de4b5f10-f186-413c-b427-fedc950877f0',
      question: 'Where can I get more information about how to use ChatterPay?',
      answer:
        'You can visit our WebApp at https://chatterpay.vercel.app/ for more information and future guides.'
    },
    {
      id: '6e97a1fa-dc71-4069-8f94-a45fc3e55fdb',
      question: "Where is my wallet's private key stored?",
      answer:
        'Your private key is stored securely using Account Abstraction technology on a layer 2 blockchain called Scroll with the "KeyStore" technology, ensuring high security and user control.'
    },
    {
      id: '14a8cba2-80c2-4bf7-8caf-3bb621b627c8',
      question: 'What can I do on the website?',
      answer:
        'You can view your wallet balance, check your transaction history, see your wallet address, and view your user information.'
    },
    {
      id: '9c504551-5fca-4dab-8a6a-0e302b9cc53b',
      question: 'How do I log in to the website?',
      answer:
        'Enter your registered phone number. A 6-digit code will be sent to your phone for security; once you enter it, you will be able to access the site.'
    }
  ]

  const renderDescription = (
    <Stack spacing={3} sx={{ mb: 10, textAlign: 'center' }}>
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ mb: 2, color: 'text.disabled' }}>
          FaQ
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography variant='h2'>Frequently asked questions</Typography>
      </m.div>
    </Stack>
  )

  const renderFaQ = (
    <div>
      {_faqs.map((accordion) => (
        <Accordion key={accordion.id}>
          <AccordionSummary expandIcon={<Iconify icon='eva:arrow-ios-downward-fill' />}>
            <Typography variant='subtitle1'>{accordion.question}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{accordion.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )

  const renderMoreQuestions = (
    <m.div variants={varFade().in}>
      <Box
        sx={{
          textAlign: 'center',
          mt: {
            xs: 5,
            md: 10
          }
        }}
      >
        <m.div variants={varFade().inDown}>
          <Typography variant='h4'>Still have questions?</Typography>
        </m.div>

        <m.div variants={varFade().inDown}>
          <Typography sx={{ mt: 2, mb: 5, color: 'text.secondary' }}>
            Please describe your case to receive the most accurate advice.
          </Typography>
        </m.div>

        <m.div variants={varFade().inUp}>
          <Button
            color='inherit'
            size='large'
            variant='contained'
            target='_blank'
            rel='noopener'
            href='#'
          >
            Contact us
          </Button>
        </m.div>
      </Box>
    </m.div>
  )

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 }
      }}
    >
      <Container component={MotionViewport}>
        {renderDescription}

        {renderFaQ}

        {renderMoreQuestions}
      </Container>
    </Box>
  )
}

// ----------------------------------------------------------------------
