import React, {useEffect, useRef, useState} from 'react'
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
import {ItemCallback, Layout, Layouts, Responsive, WidthProvider,} from "react-grid-layout";
import {useLocalStorage} from "usehooks-ts";
import useSize from "@react-hook/size";

const ResponsiveGridLayout = WidthProvider(Responsive)
const defaultLayout: Layouts = {
    lg: [
        {i: "experiment-plot", x: 0, y: 0, w: 2, h: 9, minH: 9, maxH: 9, minW: 2} as Layout,
        {i: "experiment-animation", x: 2, y: 0, w: 2, h: 7} as Layout,
        {i: "experiment-form", x: 0, y: 9, w: 4, h: 6, minH: 6} as Layout,
    ],
    sm: [
        {i: "experiment-plot", x: 0, y: 0, w: 1, h: 9, minH: 9, maxH: 9, minW: 1} as Layout,
        {i: "experiment-animation", x: 1, y: 0, w: 1, h: 7} as Layout,
        {i: "experiment-form", x: 0, y: 9, w: 2, h: 6, minH: 6} as Layout,
    ],
    xs: [
        {i: "experiment-plot", x: 0, y: 0, w: 1, h: 9, minH: 9, maxH: 9, minW: 1} as Layout,
        {i: "experiment-animation", x: 0, y: 9, w: 1, h: 7} as Layout,
        {i: "experiment-form", x: 0, y: 16, w: 1, h: 6, minH: 6} as Layout,
    ]

}

type Props = {
    experiments: ExperimentBasicFragment[]
    userExperimentCurrent?: UserExperimentDashboardFragment
}


//@ts-ignore
window.Pusher = require('pusher-js')

const ExperimentFormWrapper: React.FC<Props> = ({experiments, userExperimentCurrent}: Props) => {
    const {t} = useTranslation()
    const [savedLayout, setSavedLayout] = useLocalStorage<Layouts>("layout", defaultLayout)
    const [gridLayout, setGridLayout] = useState<Layouts>(savedLayout);
    const experimentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const [, experimentFormHeight] = useSize(experimentRefs.current["experiment-form"])
    const [, experimentAnimationHeight] = useSize(experimentRefs.current["experiment-animation"])
    const isResizing = useRef(false)
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

    useEffect(() => {
        if (!isResizing.current) {
            handleExperimentLayoutSizeChange()
        }
    }, [experimentFormHeight, experimentAnimationHeight]);


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

    const handleResize: ItemCallback = (layout,
                                        oldItem,
                                        newItem,
                                        placeholder) => {

        let neededRows: number = countNeededRows(experimentRefs.current[newItem.i]?.clientHeight ?? 0)
        newItem.h = neededRows
        newItem.minH = neededRows
        if (placeholder) {
            placeholder.h = neededRows
            placeholder.minH = neededRows
        }
    }

    const handleExperimentLayoutSizeChange = () => {
        const newLayouts: Layouts = {}
        Object.keys(gridLayout).map( (breakpoint: string) => {
            newLayouts[breakpoint] = gridLayout[breakpoint].map(layout => {
                const newLayout = { ...layout } as Layout
                const neededRows: number = countNeededRows(experimentRefs.current[newLayout.i]?.clientHeight)
                newLayout.h = neededRows
                newLayout.minH = neededRows
                return newLayout
            })
        })
        setGridLayout(newLayouts)
    }

    const countNeededRows = (height = 0): number => {
        return Math.ceil(height / 50)
    }

    const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
        setSavedLayout(allLayouts)
        if (isResizing.current) {
            setGridLayout(allLayouts)
            isResizing.current = false
        }
    }

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
            <ResponsiveGridLayout
                layouts={gridLayout}
                breakpoints={{lg: 992, sm: 576, xs: 0}}
                cols={{lg: 4, sm: 2, xs: 1}}
                rowHeight={50}
                isBounded={true}
                onResize={handleResize}
                onResizeStart={() => isResizing.current = true}
                onResizeStop={handleResize}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".draggable-header">

                {runUserExperimentVariables.loading && <SpinnerOverlay transparent={true}/>}
                {userExperiment && (
                    <div key="experiment-plot">
                        <Card title={t("experiments.dashboard.graph")}
                              className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                            <div ref={element => experimentRefs.current["experiment-plot"] = element}>
                                <ExperimentPlot data={data} loading={loading}/>
                            </div>
                        </Card>
                    </div>
                )}
                {userExperiment?.experiment.device?.deviceType.name === 'tom1a' && (
                    <div key="experiment-animation">
                        <Card title={t("experiments.dashboard.animation")}
                              className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                            <div className={"pb-2"}
                                 ref={element => experimentRefs.current["experiment-animation"] = element}>
                                <ExperimentAnimation data={data} isRunning={running} loading={loading}/>
                            </div>
                        </Card>
                    </div>
                )}
                <div key="experiment-form">
                    <Card title={t("experiments.dashboard.commands")}
                          className={"border-top-primary border-top-5  overflow-hidden h-100"}>
                        <div className={"pb-2"}
                             ref={element => experimentRefs.current["experiment-form"] = element}>
                            <ExperimentForm
                                experiments={experiments}
                                userExperimentCurrent={running ? userExperiment : undefined}
                                handleSubmitForm={handleSubmit}
                                handleStop={userExperiment && running ? stopExperiment : undefined}
                                disabled={disabledForm}
                                hasError={hasError}
                            />
                        </div>
                    </Card>
                </div>

            </ResponsiveGridLayout>
        </>
    )
}

export default ExperimentFormWrapper
