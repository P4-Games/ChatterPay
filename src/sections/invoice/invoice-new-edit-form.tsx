import * as Yup from 'yup'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import LoadingButton from '@mui/lab/LoadingButton'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { _addressBooks } from 'src/api/_data/_mock'

import FormProvider from 'src/components/hook-form'

import { IInvoice } from 'src/types/invoice'

import InvoiceNewEditDetails from './invoice-new-edit-details'
import InvoiceNewEditAddress from './invoice-new-edit-address'
import InvoiceNewEditStatusDate from './invoice-new-edit-status-date'

// ----------------------------------------------------------------------

type Props = {
  currentInvoice?: IInvoice
}

export default function InvoiceNewEditForm({ currentInvoice }: Props) {
  const router = useRouter()

  const loadingSave = useBoolean()

  const loadingSend = useBoolean()

  const NewInvoiceSchema = Yup.object().shape({
    invoiceTo: Yup.mixed<any>().nullable().required('Invoice to is required'),
    createDate: Yup.mixed<any>().nullable().required('Create date is required'),
    dueDate: Yup.mixed<any>()
      .required('Due date is required')
      .test(
        'date-min',
        'Due date must be later than create date',
        (value, { parent }) => value.getTime() > parent.createDate.getTime()
      ),
    items: Yup.lazy(() =>
      Yup.array().of(
        Yup.object({
          title: Yup.string().required('Title is required'),
          service: Yup.string().required('Service is required'),
          quantity: Yup.number()
            .required('Quantity is required')
            .min(1, 'Quantity must be more than 0')
        })
      )
    ),
    // not required
    taxes: Yup.number(),
    status: Yup.string(),
    discount: Yup.number(),
    shipping: Yup.number(),
    invoiceFrom: Yup.mixed(),
    totalAmount: Yup.number(),
    invoiceNumber: Yup.string()
  })

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.invoiceNumber || 'INV-1990',
      createDate: currentInvoice?.createDate || new Date(),
      dueDate: currentInvoice?.dueDate || null,
      taxes: currentInvoice?.taxes || 0,
      shipping: currentInvoice?.shipping || 0,
      status: currentInvoice?.status || 'draft',
      discount: currentInvoice?.discount || 0,
      invoiceFrom: currentInvoice?.invoiceFrom || _addressBooks[0],
      invoiceTo: currentInvoice?.invoiceTo || null,
      items: currentInvoice?.items || [
        {
          title: '',
          description: '',
          service: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ],
      totalAmount: currentInvoice?.totalAmount || 0
    }),
    [currentInvoice]
  )

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues
  })

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue()

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      reset()
      loadingSave.onFalse()
      router.push(paths.dashboard.invoice.root)
      console.info('DATA', JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(error)
      loadingSave.onFalse()
    }
  })

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue()

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      reset()
      loadingSend.onFalse()
      router.push(paths.dashboard.invoice.root)
      console.info('DATA', JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(error)
      loadingSend.onFalse()
    }
  })

  return (
    <FormProvider methods={methods}>
      <Card>
        <InvoiceNewEditAddress />

        <InvoiceNewEditStatusDate />

        <InvoiceNewEditDetails />
      </Card>

      <Stack justifyContent='flex-end' direction='row' spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color='inherit'
          size='large'
          variant='outlined'
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Save as Draft
        </LoadingButton>

        <LoadingButton
          size='large'
          variant='contained'
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Update' : 'Create'} & Send
        </LoadingButton>
      </Stack>
    </FormProvider>
  )
}
