import React, {useState} from 'react'
import { useTranslation } from 'react-i18next'
import {cilSpeedometer, cilInfo, cilWindowMinimize, cilCursorMove, cilResizeBoth} from '@coreui/icons'

import { useReservationsCurrentQuery } from '__generated__/graphql'
import { Card, ErrorNotifier, SpinnerOverlay } from 'components'
import { Experiment, NoReservation } from './components'
import {
    CContainer, CListGroup, CListGroupItem,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CTooltip
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { data, loading, error } = useReservationsCurrentQuery({
    notifyOnNetworkStatusChange: true,
  })
    const [visibleInfoModal, setVisibleInfoModal] = useState(false);

    if (loading) return <SpinnerOverlay transparent={true} />
  if (error) return <ErrorNotifier error={error} />

  const reservation = data?.reservationsCurrent[0]

  if (!reservation)
    return (
      <Card title={t("sidebar.dashboard")} icon={cilSpeedometer}>
        <NoReservation />
      </Card>
    )

  return (
      <CContainer xxl>
        <Card title={
            <div className="d-flex w-100 align-items-center justify-content-between">
                {t('experiments.title')}
                    <CTooltip content={ t("experiments.dashboard.info.popover") } placement="left">
                        <div>
                            <CIcon onClick={() => setVisibleInfoModal(true)}
                                   style={{cursor: "pointer"}}
                                   content={cilInfo}/>
                        </div>
                    </CTooltip>
            </div>} icon={cilSpeedometer}>
            <Experiment device={reservation.device}/>
            <CModal scrollable visible={visibleInfoModal} onDismiss={() => setVisibleInfoModal(false)}>
                <CModalHeader className="align-items-start">
                    <div>
                        <CModalTitle>
                            { t("experiments.dashboard.info.title") }
                        </CModalTitle>
                        <small className="text-l">
                            {t("experiments.dashboard.info.saving")}
                        </small>
                    </div>
                </CModalHeader>
                <CModalBody>
                    <CListGroup flush>
                        <CListGroupItem>
                            <CIcon size='xl' className="me-3 h-100" content={ cilWindowMinimize } />
                            {t("experiments.dashboard.info.minimize")}
                        </CListGroupItem>
                        <CListGroupItem>
                            <CIcon size='xl' className="me-3" content={ cilCursorMove } />
                            {t("experiments.dashboard.info.move")}
                        </CListGroupItem>
                        <CListGroupItem>
                            <CIcon size='xl' className="me-3" content={ cilResizeBoth } />
                            {t("experiments.dashboard.info.resize")}
                        </CListGroupItem>
                    </CListGroup>
                </CModalBody>
            </CModal>
        </Card>
      </CContainer>
  )
}

export default Dashboard
