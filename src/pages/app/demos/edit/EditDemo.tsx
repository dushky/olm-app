import React from 'react'
import { cilLockLocked } from '@coreui/icons'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useDemoQuery } from '__generated__/graphql'
import { Card, ErrorNotifier, SpinnerOverlay } from 'components'
import EditDemoForm from './EditDemoForm'


const EditDemo: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { data, loading, error } = useDemoQuery({
    variables: {
      id,
    },
  })

  if (loading) return <SpinnerOverlay transparent={true} />
  if (error) return <ErrorNotifier error={error} />
  if (!data?.demo) return <div>404</div>

  return (
    <Card icon={cilLockLocked} title={t('actions.edit')}>
      <EditDemoForm demo={data.demo} />
    </Card>
  )
}

export default EditDemo
