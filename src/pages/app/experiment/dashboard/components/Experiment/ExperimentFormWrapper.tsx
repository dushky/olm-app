import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {toast} from 'react-toast'

import {
    ExperimentBasicFragment,
    UserExperimentDashboardFragment,
    useRunUserExperimentMutation,
} from '__generated__/graphql'
import {Card, ErrorNotifier, SpinnerOverlay} from 'components'
import {ExperimentForm} from 'pages/app/experiment/components'
import {ExperimentFormInput, WsData, WsResponse} from 'types'
import Echo from "laravel-echo";
import ExperimentPlot from "./ExperimentPlot";
import ExperimentAnimation from "./ExperimentAnimation";
import {CCol, CRow} from "@coreui/react";
import {Responsive, WidthProvider} from "react-grid-layout";

type Props = {
    experiments: ExperimentBasicFragment[]
    userExperimentCurrent?: UserExperimentDashboardFragment
}


//@ts-ignore
window.Pusher = require('pusher-js')

const ExperimentFormWrapper: React.FC<Props> = ({experiments, userExperimentCurrent}: Props) => {
    const {t} = useTranslation()
    const [running, setRunning] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [disabledForm, setDisabledForm] = useState(false)
    const [wsError, setWsError] = useState<string>()
    const [data, setData] = useState<WsData[]>()
    const [loading, setLoading] = useState(true)
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
            setLoading(false)
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


    const gridLayout = {
        lg: [
            {i: "experimental-plot", x: 0, y: 0, w: 1, h: 1},
            {i: "experimental-animation", x: 1, y: 0, w: 1, h: 1},
            {i: "experimental-form", x: 0, y: 1, w: 4, h: 1},
        ],
        md: [
            {i: "experimental-plot", x: 0, y: 0, w: 1, h: 1},
            {i: "experimental-animation", x: 1, y: 0, w: 1, h: 1},
            {i: "experimental-form", x: 0, y: 1, w: 4, h: 1},
        ]
    };
    const GridLayout = WidthProvider(Responsive)
    return (
        <>
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
            <GridLayout layouts={gridLayout}
                        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                        cols={{lg: 4, md: 2, sm: 2, xs: 2, xxs: 2}}
                        rowHeight={30}
                        isBounded={true}
                        draggableHandle=".draggable-header">

                {runUserExperimentVariables.loading && <SpinnerOverlay transparent={true}/>}
                {userExperiment && (
                    <div key="experimental-plot">
                        <Card title={t("experiments.dashboard.graph")}
                              className={"border-top-primary border-top-5"}>
                            <ExperimentPlot data={data} loading={loading}/>
                        </Card>
                    </div>
                )}
                {userExperiment?.experiment.device?.deviceType.name === 'tom1a' && (
                    <div key="experimental-animation">
                        <Card title={t("experiments.dashboard.animation")}
                              className={"border-top-primary border-top-5"}>
                            <ExperimentAnimation data={data} isRunning={running} loading={loading}/>
                        </Card>
                    </div>
                )}
                <div key="experimental-form">
                    <Card title={t("experiments.dashboard.commands")}
                          className={"border-top-primary border-top-5"}>
                        <ExperimentForm
                            experiments={experiments}
                            userExperimentCurrent={running ? userExperiment : undefined}
                            handleSubmitForm={handleSubmit}
                            handleStop={userExperiment && running ? stopExperiment : undefined}
                            disabled={disabledForm}
                            hasError={hasError}
                        /></Card>
                </div>

            </GridLayout>
        </>
    )
}

export default ExperimentFormWrapper
