import React from 'react'
import { useTranslation } from 'react-i18next'
import { cilCalculator } from '@coreui/icons'

import { Card } from 'components'
import CreateDemoForm from './CreateDemoForm'

const CreateDemo: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Card icon={cilCalculator} title={t('actions.create')}>
      <CreateDemoForm />
    </Card>
  )
}

export default CreateDemo
