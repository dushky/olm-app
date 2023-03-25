import React, {createContext, useEffect, useState} from "react";
import {ErrorNotifier, SpinnerOverlay} from "../../../../../../components";
import {CCol, CRow} from "@coreui/react";
import {
    ExperimentBasicFragment,
    UserExperimentDashboardFragment,
    useRunUserExperimentMutation
} from "../../../../../../__generated__/graphql";
import {DashboardContent, ExperimentFormInput, WsData, WsResponse} from "../../../../../../types";
import ExperimentDashboard from "./ExperimentDashboard";
import {toast} from "react-toast";
import Echo from "laravel-echo";
import {useTranslation} from "react-i18next";

//@ts-ignore
window.Pusher = require('pusher-js')

type Props = {
    experiments: ExperimentBasicFragment[]
    userExperimentCurrent?: UserExperimentDashboardFragment
    cameraIsConnected?: boolean
}

export const DashboardContext = createContext<DashboardContent>({} as DashboardContent);

const ExperimentDashboardWrapper: React.FC<Props> = ({experiments, userExperimentCurrent, cameraIsConnected}: Props) => {
    const {t} = useTranslation()
    const [running, setRunning] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [disabledForm, setDisabledForm] = useState(false)
    const [wsError, setWsError] = useState<string>()
    const [data, setData] = useState<WsData[]>()
    const [loading, setLoading] = useState(false)
    const [runUserExperimentMutation, runUserExperimentVariables] = useRunUserExperimentMutation()
    const [userExperiment, setUserExperiment] = useState<UserExperimentDashboardFragment | undefined>(
        userExperimentCurrent,
    )

    useEffect(() => {
        if (running) setDisabledForm(false)
    }, [running])

    const handleSubmit = async ({
                                    experimentId,
                                    schemaId,
                                    softwareId,
                                    command,
                                    experimentInput,
                                }: ExperimentFormInput) => {
        if (command === 'start') setDisabledForm(true)
        await runUserExperimentMutation({
            variables: {
                runUserExperimentInput: {
                    experiment_id: experimentId,
                    user_experiment_id: running ? userExperiment?.id : undefined,
                    schema_id: schemaId,
                    software_id: softwareId,
                    input: [
                        {
                            script_name: command,
                            input: experimentInput,
                        },
                    ],
                },
            },
        })
            .then((data) => {
                if (data.data?.runUserExperiment) {
                    toast.success(t('experiments.actions.run.success'))
                    setUserExperiment(data.data.runUserExperiment)
                }
            })
            .catch(() => {
                setDisabledForm(false)
                toast.error(t('experiments.actions.run.error'))
            })
    }

    const stopExperiment = async () => {
        if (!userExperiment || !running) return

        await runUserExperimentMutation({
            variables: {
                runUserExperimentInput: {
                    experiment_id: userExperiment.experiment.id,
                    user_experiment_id: userExperiment.id,
                    software_id: userExperiment.experiment.software.id,
                    input: [
                        {
                            script_name: 'stop',
                            input: [],
                        },
                    ],
                },
            },
        })
            .then((data) => {
                if (data.data?.runUserExperiment) {
                    toast.success(t('experiments.actions.stop.success'))
                    // setUserExperiment(undefined)
                }
            })
            .catch(() => {
                toast.error(t('experiments.actions.stop.error'))
            })
    }

    useEffect(() => {
        if (userExperiment) {
            setLoading(true)
            const echo = new Echo({
                broadcaster: 'pusher',
                key: process.env.REACT_APP_PUSHER_ENV_KEY,
                cluster: process.env.REACT_APP_PUSHER_ENV_CLUSTER,
                wsHost: userExperiment.experiment.server?.api_domain,
                wssPort: userExperiment.experiment.server?.websocket_port,
                forceTLS: true,
                disableStats: true,
            })

            echo
                .channel(userExperiment.experiment.device?.name || 'channel')
                .listen('DataBroadcaster', (e: WsResponse) => {
                    setLoading(false)
                    setRunning(true)

                    if (e.finished) {
                        setData(undefined)
                        setRunning(false)
                    } else if (e.error) {
                        setData(undefined)
                        setWsError(e.error)
                        setHasError(true)
                    } else if (e.data) {
                        setData(e.data)
                        setWsError(undefined)
                        setHasError(false)
                    }
                })

            return () => {
                echo.channel('channel').stopListening('DataBroadcaster')
                echo.leaveChannel('channel')
            }
        }
    }, [userExperiment])

    return (
        <DashboardContext.Provider value={{
            experiments: experiments,
            userExperiment: userExperiment,
            data: data,
            cameraIsConnected: cameraIsConnected,
            loading: loading,
            running: running,
            hasError: hasError,
            disabledForm: disabledForm,
            handleSubmit: handleSubmit,
            handleStop: stopExperiment

        }}>
            {runUserExperimentVariables.error && (
                <ErrorNotifier error={runUserExperimentVariables.error}/>
            )}
            {wsError && (
                <CRow>
                    <CCol md={12}>
                        <ErrorNotifier error={wsError}/>
                    </CCol>
                </CRow>
            )}

            {runUserExperimentVariables.loading && <SpinnerOverlay transparent={true}/>}
            <ExperimentDashboard/>
        </DashboardContext.Provider>
    )
}

export default ExperimentDashboardWrapper


