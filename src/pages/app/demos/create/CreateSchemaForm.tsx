import {
    CAlert,
    CCol,
    CForm,
    CFormFloating,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CFormTextarea,
    CRow,
} from '@coreui/react'
import { ButtonBack, ButtonSave, ErrorNotifier, SpinnerOverlay } from 'components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toast'

import {
    ArgumentInput,
    CreateDemoInput,
    useCreateDemoMutation,
    useDeviceTypesAndSoftwareQuery,
} from '__generated__/graphql'
import { DemoFormArguments } from '../components'

const CreateDemoForm: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const deviceTypesAndSoftware = useDeviceTypesAndSoftwareQuery()

  const [createDemoInput, setCreateDemoInput] = useState<CreateDemoInput>({
    name: '',
    device_type_id: deviceTypesAndSoftware.data?.deviceTypes[0].id || '-1',
    software_id: deviceTypesAndSoftware.data?.software[0].id || '-1',
    note: undefined,
    arguments: [],
    demo: null
  })

  const [createDemoMutation, { loading, error }] = useCreateDemoMutation()

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()

    await createDemoMutation({
      variables: {
        createDemoInput,
      },
    })
      .then((data) => {
        if (data.data?.createDemo) {
          toast.success(t('demos.create.success'))
          navigate('/app/demos/')
        }
      })
      .catch(() => {
        toast.error(t('demos.create.error'))
      })
  }

  return (
    <CForm onSubmit={handleCreate}>
      {(loading || deviceTypesAndSoftware.loading) && <SpinnerOverlay transparent={true} />}
      {error && <ErrorNotifier error={error} />}
      {deviceTypesAndSoftware.error && <ErrorNotifier error={deviceTypesAndSoftware.error} />}

      <CFormFloating className="mb-3">
        <CFormInput
          type="text"
          id="name"
          value={createDemoInput.name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setCreateDemoInput({ ...createDemoInput, name: event.target.value })
          }
        />
        <CFormLabel>{t('demos.columns.name')}</CFormLabel>
      </CFormFloating>

      <CRow>
        <CCol md={4}>
          <CFormLabel>{t('demos.columns.device_type')}</CFormLabel>
          <CFormSelect
            className="mb-3"
            value={createDemoInput.device_type_id}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              event.preventDefault()
              setCreateDemoInput({ ...createDemoInput, device_type_id: event.target.value })
            }}
          >
            <option value="-1"></option>
            {deviceTypesAndSoftware.data?.deviceTypes.map((deviceType) => (
              <option value={deviceType.id} key={deviceType.id}>
                {deviceType.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormLabel>{t('demos.columns.software')}</CFormLabel>
          <CFormSelect
            className="mb-3"
            value={createDemoInput.software_id}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              event.preventDefault()
              setCreateDemoInput({ ...createDemoInput, software_id: event.target.value })
            }}
          >
            <option value="-1"></option>
            {deviceTypesAndSoftware.data?.software.map((software) => (
              <option value={software.id} key={software.id}>
                {software.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      <CFormFloating className="mb-3">
        <CFormTextarea
          id="note"
          value={createDemoInput.note || ''}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCreateDemoInput({ ...createDemoInput, note: event.target.value })
          }
          style={{ height: '6rem' }}
        ></CFormTextarea>
        <CFormLabel>{t('demos.columns.note')}</CFormLabel>
      </CFormFloating>

      <CRow>
        <CCol md={6}>
          <div className="mb-3">
            <CFormLabel>{t('demos.columns.demo')}</CFormLabel>
            <CFormInput
              type="file"
              id="demo"
              onChange={({ target: { validity, files } }) => {
                if (validity.valid)
                  setCreateDemoInput({ ...createDemoInput, demo: files ? files[0] : null })
              }}
            />
          </div>
        </CCol>
        <CCol md={6}>
          <div className="mb-3">
            <CFormLabel>{t('demos.columns.preview')}</CFormLabel>
            <CFormInput
              type="file"
              id="preview"
              onChange={({ target: { validity, files } }) => {
                if (validity.valid)
                  setCreateDemoInput({ ...createDemoInput, preview: files ? files[0] : null })
              }}
            />
          </div>
        </CCol>
      </CRow>

        {createDemoInput.device_type_id !== '-1' && (
            <DemoFormArguments
                outputValues={deviceTypesAndSoftware.data?.deviceTypes
                    .filter((deviceType) => deviceType.id === createDemoInput.device_type_id)
                    .reduce((accumulator: string[], deviceType) => {
                        deviceType.experiment.forEach((experiment) => {
                            experiment.output_arguments.forEach((outputArgument) => {
                                if (!accumulator.includes(outputArgument.name)) {
                                    accumulator.push(outputArgument.name)
                                }
                            })
                        })
                        return accumulator
                    }, [])}
                demoArguments={createDemoInput.arguments as ArgumentInput[]}
                handleChange={(args) => setCreateDemoInput({ ...createDemoInput, arguments: args })}
            />
        ) || (
            <CAlert className="text-center" color="info">{t('demos.device_type_warning')}</CAlert>
        )}

      <div className="text-right">
        <ButtonBack className="me-2" />
          {createDemoInput.device_type_id !== '-1' && (<ButtonSave />)}
      </div>
    </CForm>
  )
}

export default CreateDemoForm
