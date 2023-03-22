import React from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorNotifier, SpinnerOverlay } from 'components'
import {
  DeviceWithServerFragment, useCameraStatusQuery,
  useExperimentsQuery,
  useUserExperimentCurrentQuery,
} from '__generated__/graphql'
import ExperimentDashboardWrapper from "./ExperimentDashboardWrapper";

type Props = {
  device: DeviceWithServerFragment
}

const Experiment: React.FC<Props> = ({ device }: Props) => {
  const { t } = useTranslation()

  const experimentsResponse = useExperimentsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      serverId: device.server.id,
      deviceId: device.id,
    },
  })

  const userExperimentResponse = useUserExperimentCurrentQuery({
    notifyOnNetworkStatusChange: true,
  })

  const cameraStatus = useCameraStatusQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      serverId: device.server.id,
    },
  });

  if (experimentsResponse.loading || userExperimentResponse.loading || cameraStatus.loading)
    return <SpinnerOverlay transparent={true} />
  if (experimentsResponse.error) return <ErrorNotifier error={experimentsResponse.error} />
  if (userExperimentResponse.error) return <ErrorNotifier error={userExperimentResponse.error} />
  if (!experimentsResponse.data?.experiments || !experimentsResponse.data?.experiments.length)
    return <ErrorNotifier error={t('experiments.no_experiments')} />

  return (
    <ExperimentDashboardWrapper
      experiments={experimentsResponse.data.experiments}
      userExperimentCurrent={userExperimentResponse.data?.userExperimentCurrent || undefined}
      cameraIsConnected={!cameraStatus.error && cameraStatus.data?.cameraStatus.isConnected}
    />
  )
}

export default Experiment
