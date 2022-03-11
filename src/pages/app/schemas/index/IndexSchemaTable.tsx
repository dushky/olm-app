import React, { useState } from 'react'
import { cilCloudDownload, cilImage, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toast'

import { ErrorNotifier, ModalPreview, Table } from 'components'
import { TableAction, TableColumn } from 'types'
import { SchemaBasicFragment, useDeleteSchemaMutation } from '__generated__/graphql'

interface Props {
  schemas: SchemaBasicFragment[]
  refetch: () => void
}

const IndexSchemaTable: React.FC<Props> = ({ schemas, refetch }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [visiblePreview, setVisiblePreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [deleteSchemaMutation, { error }] = useDeleteSchemaMutation()

  const handleDeleteSchema = async (id: string) => {
    let response = window.confirm(t('schemas.delete.confirm'))
    if (response) {
      await deleteSchemaMutation({
        variables: { id },
      })
        .then(() => {
          refetch()
          toast.success(t('schemas.delete.success'))
        })
        .catch(() => {
          toast.error(t('schemas.delete.error'))
        })
    }
  }

  const handleDownloadSchema = (id: string) => {
    schemas.forEach((schema) => {
      if (schema.id === id) {
        if (!schema.schema) {
          toast.error(t('schemas.download.error'))
          return
        }
        fetch(schema.schema)
          .then((response) => {
            response.blob().then((blob) => {
              const fileExt = schema.schema?.split('.').pop()
              const url = window.URL.createObjectURL(blob)
              let a = document.createElement('a')
              a.href = url
              a.download = `${schema.name}.${fileExt}`
              a.click()
              toast.success(t('schemas.download.success'))
            })
          })
          .catch((error) => {
            toast.error(t('schemas.download.error'))
            console.log(error, error.error)
          })
      }
    })
  }

  const handleOpenPreviewModal = (id: string) => {
    schemas.forEach((schema) => {
      if (schema.id === id) {
        if (!schema.preview) {
          toast.error(t('schemas.preview.error'))
          return
        }
        setPreviewUrl(schema.preview)
        setVisiblePreview(true)
      }
    })
  }

  const columns: TableColumn[] = [
    {
      column: 'id',
      name: t('schemas.columns.id'),
      style: { width: '80px' },
    },
    {
      column: 'name',
      name: t('schemas.columns.name'),
    },
    {
      column: 'deviceType.name',
      name: t('schemas.columns.device_type'),
    },
    {
      column: 'software.name',
      name: t('schemas.columns.software'),
    },
  ]

  const actions: TableAction[] = [
    {
      color: 'warning',
      textColor: 'light',
      permission: 'schema.show',
      icon: <CIcon content={cilImage} />,
      handleClick: handleOpenPreviewModal,
    },
    {
      color: 'success',
      textColor: 'light',
      permission: 'schema.show',
      icon: <CIcon content={cilCloudDownload} />,
      handleClick: handleDownloadSchema,
    },
    {
      color: 'primary',
      icon: <CIcon content={cilPencil} />,
      permission: 'schema.update',
      handleClick: (id: string) => {
        navigate(`/app/schemas/${id}/edit`)
      },
    },
    {
      color: 'danger',
      textColor: 'light',
      permission: 'schema.delete',
      icon: <CIcon content={cilTrash} />,
      handleClick: handleDeleteSchema,
    },
  ]

  if (error) return <ErrorNotifier error={error} />

  return (
    <>
      <ModalPreview
        active={visiblePreview}
        src={previewUrl}
        handleDismiss={() => {
          setVisiblePreview(false)
          setPreviewUrl(null)
        }}
      />

      <Table columns={columns} data={schemas} actions={actions} />
    </>
  )
}

export default IndexSchemaTable
