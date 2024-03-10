import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cilCalculator } from '@coreui/icons'

import { ButtonAdd, Can, Card, ErrorNotifier, SpinnerOverlay, TrashedDropdown } from 'components'
import { DemoBasicFragment, Trashed, useDemosQuery } from '__generated__/graphql'
import IndexDemoTable from './IndexSchemaTable'

const IndexDemo: React.FC = () => {
  const { t } = useTranslation()
  const [withTrashed, setWithTrashed] = useState(Trashed.Without)
  const [demos, setDemos] = useState<DemoBasicFragment[]>()
  const { data, loading, error, refetch } = useDemosQuery({
    variables: {
      trashed: withTrashed,
    },
  })

  useEffect(() => {
    if (data?.demos) setDemos(data.demos)
  }, [data])

  if (error) return <ErrorNotifier error={error} />

  return (
    <>
      {loading && <SpinnerOverlay transparent={true} />}
      <Card
        icon={cilCalculator}
        title={t('demos.index.title')}
        actions={
          <Can permission="demo.create">
            <ButtonAdd to="/app/demos/create" />
          </Can>
        }
      >
        <>
          <TrashedDropdown initial={withTrashed} handleChange={setWithTrashed} />
          <hr />
          {demos && <IndexDemoTable demos={demos} refetch={refetch} />}
        </>
      </Card>
    </>
  )
}

export default IndexDemo
