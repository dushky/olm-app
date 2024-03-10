import React, { useState } from 'react'
import { cilActionUndo, cilCloudDownload, cilImage, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toast'

import { ErrorNotifier, ModalPreview, SpinnerOverlay, Table } from 'components'
import { TableAction, TableColumn } from 'types'
import {
  DemoBasicFragment,
  useDeleteDemoMutation,
  useRestoreDemoMutation,
} from '__generated__/graphql'

interface Props {
  demos: DemoBasicFragment[]
  refetch: () => void
}

const IndexDemoTable: React.FC<Props> = ({ demos, refetch }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [visiblePreview, setVisiblePreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [deleteDemoMutation, deleteDemoVariables] = useDeleteDemoMutation()
  const [restoreDemoMutation, restoreDemoVariables] = useRestoreDemoMutation()

  const handleDeleteDemo = async (id: string) => {
    let response = window.confirm(t('demos.delete.confirm'))
    if (response) {
      await deleteDemoMutation({
        variables: { id },
      })
        .then(() => {
          refetch()
          toast.success(t('demos.delete.success'))
        })
        .catch(() => {
          toast.error(t('demos.delete.error'))
        })
    }
  }

  const handleRestoreDemo = async (id: string) => {
    let response = window.confirm(t('demos.restore.confirm'))
    if (response) {
      await restoreDemoMutation({
        variables: { id },
      })
        .then(() => {
          refetch()
          toast.success(t('demos.restore.success'))
        })
        .catch(() => {
          toast.error(t('demos.restore.error'))
        })
    }
  }

  const handleDownloadDemo = (id: string) => {
    demos.forEach((demo) => {
      if (demo.id === id) {
        if (!demo.demo) {
          toast.error(t('demos.download.error'))
          return
        }
        fetch(demo.demo)
          .then((response) => {
            response.blob().then((blob) => {
              const fileExt = demo.demo?.split('.').pop()
              const url = window.URL.createObjectURL(blob)
              let a = document.createElement('a')
              a.href = url
              a.download = `${demo.name}.${fileExt}`
              a.click()
              toast.success(t('demos.download.success'))
            })
          })
          .catch(() => {
            toast.error(t('demos.download.error'))
          })
      }
    })
  }

  const handleOpenPreviewModal = (id: string) => {
    demos.forEach((demo) => {
      if (demo.id === id) {
        if (!demo.preview) {
          toast.error(t('demos.preview.error'))
          return
        }
        setPreviewUrl(demo.preview)
        setVisiblePreview(true)
      }
    })
  }

  const columns: TableColumn[] = [
    {
      column: 'id',
      name: t('demos.columns.id'),
      style: { width: '80px' },
    },
    {
      column: 'name',
      name: t('demos.columns.name'),
    },
    {
      column: 'deviceType.name',
      name: t('demos.columns.device_type'),
    },
    {
      column: 'software.name',
      name: t('demos.columns.software'),
    },
  ]

  const actions: TableAction[] = [
    {
      color: 'warning',
      textColor: 'light',
      permission: 'demo.show',
      icon: <CIcon content={cilImage} />,
      handleClick: handleOpenPreviewModal,
    },
    {
      color: 'success',
      textColor: 'light',
      permission: 'demo.show',
      icon: <CIcon content={cilCloudDownload} />,
      handleClick: handleDownloadDemo,
    },
    {
      color: 'primary',
      onDeleted: false,
      icon: <CIcon content={cilPencil} />,
      permission: 'demo.update',
      handleClick: (id: string) => {
        navigate(`/app/demos/${id}/edit`)
      },
    },
    {
      color: 'danger',
      textColor: 'light',
      permission: 'demo.delete',
      onDeleted: false,
      icon: <CIcon content={cilTrash} />,
      handleClick: handleDeleteDemo,
    },
    {
      color: 'dark',
      textColor: 'light',
      permission: 'demo.restore',
      onNonDeleted: false,
      text: t('user_experiments.restore.button'),
      icon: <CIcon content={cilActionUndo} />,
      handleClick: handleRestoreDemo,
    },
  ]

  return (
    <>
      {deleteDemoVariables.error && <ErrorNotifier error={deleteDemoVariables.error} />}
      {restoreDemoVariables.error && <ErrorNotifier error={restoreDemoVariables.error} />}
      {(deleteDemoVariables.loading || restoreDemoVariables.loading) && (
        <SpinnerOverlay transparent={true} />
      )}

      <ModalPreview
        active={visiblePreview}
        src={previewUrl}
        handleDismiss={() => {
          setVisiblePreview(false)
          setPreviewUrl(null)
        }}
      />

      <Table columns={columns} data={demos} actions={actions} />
    </>
  )
}

export default IndexDemoTable
