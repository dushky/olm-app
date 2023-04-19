import {
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
    CreateSchemaInput, useAvailableSchemaTypesQuery,
    useCreateSchemaMutation,
    useDeviceTypesAndSoftwareQuery,
} from '__generated__/graphql'
import { SchemaFormArguments } from '../components'

const CreateSchemaForm: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const deviceTypesAndSoftware = useDeviceTypesAndSoftwareQuery()
  const availableSchemaTypes = useAvailableSchemaTypesQuery()

  const [createSchemaInput, setCreateSchemaInput] = useState<CreateSchemaInput>({
    name: '',
    type: '-1',
    device_type_id: deviceTypesAndSoftware.data?.deviceTypes[0].id || '-1',
    software_id: deviceTypesAndSoftware.data?.software[0].id || '-1',
    note: undefined,
    arguments: [],
    schema: null
  })

  const [createSchemaMutation, { loading, error }] = useCreateSchemaMutation()

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()

    await createSchemaMutation({
      variables: {
        createSchemaInput,
      },
    })
      .then((data) => {
        if (data.data?.createSchema) {
          toast.success(t('schemas.create.success'))
          navigate('/app/schemas/')
        }
      })
      .catch(() => {
        toast.error(t('schemas.create.error'))
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
          value={createSchemaInput.name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setCreateSchemaInput({ ...createSchemaInput, name: event.target.value })
          }
        />
        <CFormLabel>{t('schemas.columns.name')}</CFormLabel>
      </CFormFloating>

      <CRow>
        <CCol md={4}>
          <CFormLabel>{t('schemas.columns.schema_type')}</CFormLabel>
          <CFormSelect
              className="mb-3"
              value={createSchemaInput.type}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                event.preventDefault()
                setCreateSchemaInput({ ...createSchemaInput, type: event.target.value })
              }}
          >
            <option value="-1"></option>
            {availableSchemaTypes.data?.availableSchemaTypes.map((schemaType) => (
                <option value={schemaType} key={schemaType}>
                  {t('schemas.types.' + schemaType)}
                </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <CFormLabel>{t('schemas.columns.device_type')}</CFormLabel>
          <CFormSelect
            className="mb-3"
            value={createSchemaInput.device_type_id}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              event.preventDefault()
              setCreateSchemaInput({ ...createSchemaInput, device_type_id: event.target.value })
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
          <CFormLabel>{t('schemas.columns.software')}</CFormLabel>
          <CFormSelect
            className="mb-3"
            value={createSchemaInput.software_id}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              event.preventDefault()
              setCreateSchemaInput({ ...createSchemaInput, software_id: event.target.value })
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
          value={createSchemaInput.note || ''}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setCreateSchemaInput({ ...createSchemaInput, note: event.target.value })
          }
          style={{ height: '6rem' }}
        ></CFormTextarea>
        <CFormLabel>{t('schemas.columns.note')}</CFormLabel>
      </CFormFloating>

      <CRow>
        <CCol md={6}>
          <div className="mb-3">
            <CFormLabel>{t('schemas.columns.schema')}</CFormLabel>
            <CFormInput
              type="file"
              id="schema"
              onChange={({ target: { validity, files } }) => {
                if (validity.valid)
                  setCreateSchemaInput({ ...createSchemaInput, schema: files ? files[0] : null })
              }}
            />
          </div>
        </CCol>
        <CCol md={6}>
          <div className="mb-3">
            <CFormLabel>{t('schemas.columns.preview')}</CFormLabel>
            <CFormInput
              type="file"
              id="preview"
              onChange={({ target: { validity, files } }) => {
                if (validity.valid)
                  setCreateSchemaInput({ ...createSchemaInput, preview: files ? files[0] : null })
              }}
            />
          </div>
        </CCol>
      </CRow>

      <SchemaFormArguments
        schemaArguments={createSchemaInput.arguments as ArgumentInput[]}
        handleChange={(args) => setCreateSchemaInput({ ...createSchemaInput, arguments: args })}
      />

      <div className="text-right">
        <ButtonBack className="me-2" />
        <ButtonSave />
      </div>
    </CForm>
  )
}

export default CreateSchemaForm
