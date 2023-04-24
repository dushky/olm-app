import React from 'react'
import {CButton, CCol, CFormFloating, CFormInput, CFormLabel, CFormSelect, CRow} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { OptionInput } from '__generated__/graphql'
import { useTranslation } from 'react-i18next'

interface Props {
  option: OptionInput
  handleChange: (option: OptionInput) => void
  handleDelete: () => void
  outputValues?: string[]
}

const SchemaFormOptions: React.FC<Props> = ({ option, handleChange, handleDelete, outputValues }: Props) => {
  const { t } = useTranslation()

  return (
    <CRow className="mb-3">
      <CCol xs={{ span: 3, offset: 1 }}>
        <CFormFloating>
          <CFormInput
            type="text"
            value={option.name}
            required
            onChange={(event) => {
              handleChange({ ...option, name: event.target.value })
            }}
          />
          <CFormLabel>{t('schemas.columns.argument.option.name')}</CFormLabel>
        </CFormFloating>
      </CCol>
      <CCol xs={3}>
        <CFormFloating>
          <CFormInput
            type="text"
            required
            value={option.value}
            onChange={(event) => {
              // eslint-disable-next-line
              const val = event.target.value.replace(/[^0-9\,.\]\[\s]/g, '')
              handleChange({ ...option, value: val })
            }}
          />
          <CFormLabel>{t('schemas.columns.argument.option.value')}</CFormLabel>
        </CFormFloating>
      </CCol>
        <CCol sm={3}>
            <CFormFloating>
                <CFormSelect
                    value={option.output_value}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        event.preventDefault();
                        handleChange({ ...option, output_value: event.target.value })
                    }}
                >
                    <option value=""></option>
                    {outputValues?.map((outputValue) => (
                        <option value={outputValue} key={outputValue}>
                            {outputValue}
                        </option>
                    ))}
                </CFormSelect>
                <CFormLabel>{t('schemas.columns.argument.option.output_value')}</CFormLabel>
            </CFormFloating>
        </CCol>
      <CCol xs={2} className="d-flex justify-content-start align-items-center">
        <CButton
          className="d-inline-flex justify-content-center align-items-center text-light"
          color="danger"
          onClick={handleDelete}
        >
          <CIcon className="me-1" content={cilTrash} />
        </CButton>
      </CCol>
    </CRow>
  )
}

export default SchemaFormOptions
