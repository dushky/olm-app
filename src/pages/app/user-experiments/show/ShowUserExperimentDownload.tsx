import { cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react'
import React, {useContext, useRef} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toast'
import {AppStateContext} from "../../../../provider";
import {ApolloQueryResult} from "@apollo/client/core/types";

type Props = {
  url: string
  refetch: (variables?: any) => Promise<ApolloQueryResult<any>>;
  userName: string
  deviceType: string
  createdAt: string
}

const ShowUserExperimentDownload: React.FC<Props> = ({
  url,
  refetch,
  userName,
  deviceType,
  createdAt,
}: Props) => {
  const { t } = useTranslation()
  const { appGetAuthToken } = useContext(AppStateContext)
  const refetched = useRef(false);

  const handleDownloadResult = () => {
    fetch(url, {
      headers: {
        'Content-Type': 'text/csv',
        authorization: appGetAuthToken().token ? `Bearer ${appGetAuthToken().token}` : '',
      }
    })
      .then((response) => {
        if (response.ok) {
          response.blob().then((blob) => {
            const href = window.URL.createObjectURL(blob)
            let a = document.createElement('a')
            a.href = href
            a.download = `${userName}_${deviceType}_${createdAt}.csv`
            a.click()
            toast.success(t('user_experiments.download.success'))
          })
        } else {
          if (!refetched.current) {
            refetch().then(() => {
              handleDownloadResult()
            }).finally(() => {refetched.current = true});
          } else {
            toast.error(t('actions.error.not-authorized'))
          }
        }
      })
      .catch(() => {
        toast.error(t('user_experiments.download.error'))
      })
  }

  return (
    <CButton
      className="me-2 text-light d-inline-flex justify-content-center align-items-center"
      color="success"
      onClick={handleDownloadResult}
    >
      <CIcon content={cilCloudDownload} className="me-1 text-light" />
      {t('user_experiments.download.button')}
    </CButton>
  )
}

export default ShowUserExperimentDownload
