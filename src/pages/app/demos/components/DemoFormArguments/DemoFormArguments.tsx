import React, { useEffect, useState } from 'react'
import { cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react'
import { useTranslation } from 'react-i18next'
import { ArgumentInput } from '__generated__/graphql'
import DemoFormArgumentsRow from './DemoFormArgumentsRow'

interface Props {
  demoArguments?: ArgumentInput[]
  handleChange?: (args: ArgumentInput[]) => void
  outputValues?: string[]
}

const DemoFormArguments: React.FC<Props> = ({
  demoArguments: demoArgumentsProp = [],
  handleChange,
  outputValues
}: Props) => {
  const { t } = useTranslation()

  const [demoArguments, setDemoArguments] = useState<ArgumentInput[]>(demoArgumentsProp)

  useEffect(() => {
    if (handleChange) handleChange(demoArguments)
  }, [demoArguments])

  return (
    <>
      <h5 className="text-center mt-3">{t('demos.arguments')}</h5>

      {demoArguments.map((argument, index) => (
        <React.Fragment key={index}>
          <DemoFormArgumentsRow
              outputValues={outputValues}
            argument={argument}
            handleDelete={() => {
              const reduced = [...demoArguments]
              reduced.splice(index, 1)
              setDemoArguments(reduced)
            }}
            handleChange={(arg) => {
              setDemoArguments([
                ...demoArguments.slice(0, index),
                arg,
                ...demoArguments.slice(index + 1),
              ])
            }}
          />
          <hr />
        </React.Fragment>
      ))}

      <div className="text-center">
        <CButton
          className="d-inline-flex justify-content-center align-items-center text-light"
          onClick={() => {
            setDemoArguments([
              ...demoArguments,
              {
                name: '',
                label: '',
                default_value: '',
                row: 1,
                order: 1,
                options: [],
              },
            ])
          }}
        >
          <CIcon className="me-1" content={cilPlus} />
          {t('demos.add_argument')}
        </CButton>
      </div>
    </>
  )
}

export default DemoFormArguments
