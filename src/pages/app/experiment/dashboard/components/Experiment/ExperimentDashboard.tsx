import {ItemCallback, Layout, Layouts, Responsive, WidthProvider} from "react-grid-layout";
import React, {useContext, useEffect, useRef} from "react";
import {Card} from "../../../../../../components";
import ExperimentPlot from "./ExperimentPlot";
import ExperimentAnimation from "./ExperimentAnimation";
import {ExperimentForm} from "../../../components";
import {useLocalStorage} from "usehooks-ts";
import useSize from "@react-hook/size";
import {useTranslation} from "react-i18next";
import {DashboardContext} from "./ExperimentDashboardWrapper";
import ExperimentVideo from "./ExperimentVideo";

const ResponsiveGridLayout = WidthProvider(Responsive)
const defaultLayout: Layouts = {
    xl: [
        {i: "experiment-plot", x: 0, y: 0, w: 6, h: 9, minW: 3, minH: 3} as Layout,
        {i: "experiment-animation", x: 11, y: 7, w: 5, h: 5, minW: 3, minH: 5, maxH: 5} as Layout,
        {i: "experiment-form", x: 6, y: 0, w: 10, h: 7, minW: 3, minH: 7, maxH: 7} as Layout,
        {i: "experiment-video", x: 6, y: 7, w: 5, h: 7, minW: 3, minH: 7, maxH: 7} as Layout,
    ],
    lg: [
        {i: "experiment-plot", x: 0, y: 0, w: 6, h: 9, minW: 3, minH: 3} as Layout,
        {i: "experiment-animation", x: 6, y: 0, w: 6, h: 6, minW: 3, minH: 6, maxH: 6} as Layout,
        {i: "experiment-form", x: 6, y: 6, w: 6, h: 10, minW: 3, minH: 10, maxH: 10} as Layout,
        {i: "experiment-video", x: 0, y: 9, w: 6, h: 8, minW: 3, minH: 8, maxH: 8} as Layout,
    ],
    sm: [
        {i: "experiment-plot", x: 0, y: 0, w: 2, h: 9, minW: 2, minH: 3} as Layout,
        {i: "experiment-animation", x: 2, y: 0, w: 2, h: 4, minW: 2, minH: 4, maxH: 4} as Layout,
        {i: "experiment-form", x: 2, y: 0, w: 2, h: 11, minW: 2, minH: 11, maxH: 11} as Layout,
        {i: "experiment-video", x: 0, y: 9, w: 2, h: 5, minW: 2, minH: 3, maxH: 3} as Layout,
    ],
    xs: [
        {i: "experiment-plot", x: 0, y: 0, w: 1, h: 9, minW: 1, minH: 2} as Layout,
        {i: "experiment-animation", x: 0, y: 25, w: 1, h: 6, minW: 1, minH: 6, maxH: 6} as Layout,
        {i: "experiment-form", x: 0, y: 9, w: 1, h: 8, minW: 1, minH: 8, maxH: 8} as Layout,
        {i: "experiment-video", x: 0, y: 32, w: 1, h: 7, minW: 1, minH: 7, maxH: 7} as Layout,
    ]
}

// to fit card header for minimize function
const rowHeight = 50
const gridMargin = 10

const countNeededRows = (height = 1): number => {
    let neededRows = Math.ceil(height / (rowHeight + gridMargin))
    return neededRows + 1
}

type Props = {}

const ExperimentDashboard: React.FC<Props> = () => {
    const dashboard = useContext(DashboardContext);
    const {t} = useTranslation()
    const [savedExperimentFormMinimization, setSavedExperimentFormMinimization] = useLocalStorage<boolean>("experimentFormMinimization", false)
    const [savedExperimentPlotMinimization, setSavedExperimentPlotMinimization] = useLocalStorage<boolean>("experimentPlotMinimization", false)
    const [savedExperimentAnimationMinimization, setSavedExperimentAnimationMinimization] = useLocalStorage<boolean>("experimentAnimationMinimization", false)
    const [savedExperimentVideoMinimization, setSavedExperimentVideoMinimization] = useLocalStorage<boolean>("experimentVideoMinimization", false)
    const [savedGridLayout, setSavedGridLayout] = useLocalStorage<Layouts>("gridLayout", defaultLayout)
    const experimentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const [, experimentFormHeight] = useSize(experimentRefs.current["experiment-form"])
    const [, experimentAnimationHeight] = useSize(experimentRefs.current["experiment-animation"])
    const [, experimentPlotHeight] = useSize(experimentRefs.current["experiment-plot"])
    const [, experimentVideoHeight] = useSize(experimentRefs.current["experiment-video"])
    const isResizing = useRef(false)
    const breakpoint = useRef("")

    useEffect(() => {
        if (!isResizing.current) {
            handleExperimentLayoutSizeChange()
        }
    }, [experimentFormHeight, experimentAnimationHeight, experimentPlotHeight, experimentVideoHeight]);

    const handleResize: ItemCallback = (layout,
                                        oldItem,
                                        newItem,
                                        placeholder) => {
        let neededRows: number = countNeededRows(experimentRefs.current[newItem.i]?.offsetHeight)
        newItem.h = neededRows
        if (oldItem.i !== 'experiment-plot') {
            newItem.minH = neededRows
            newItem.maxH = neededRows
        }
        if (placeholder) {
            placeholder.h = neededRows
            if (oldItem.i !== 'experiment-plot') {
                placeholder.minH = neededRows
                placeholder.maxH = neededRows
            }
        }
        window.dispatchEvent(new Event('resize'));
    }

    const handleResizeAndDragStop: ItemCallback = (layout) => {
        setSavedGridLayout((savedGridLayout) => {
                return {
                    ...savedGridLayout,
                    [breakpoint.current]: layout
                }
            }
        )
        isResizing.current = false
        window.dispatchEvent(new Event('resize'));
    }

    const handleExperimentLayoutSizeChange = () => {
        setSavedGridLayout((savedGridLayout) => {
            const newLayouts: Layouts = {}
            Object.keys(savedGridLayout).forEach((breakpoint: string) => {
                newLayouts[breakpoint] = savedGridLayout[breakpoint].map(layout => {
                    const newLayout = {...layout} as Layout
                    const neededRows: number = countNeededRows(experimentRefs.current[newLayout.i]?.offsetHeight)
                    newLayout.h = neededRows
                    if (newLayout.i !== 'experiment-plot') {
                        newLayout.minH = neededRows
                        newLayout.maxH = neededRows
                    }
                    return newLayout
                })
            })
            return newLayouts
        })
        window.dispatchEvent(new Event('resize'));
    }

    return (
        <ResponsiveGridLayout
            layouts={savedGridLayout}
            breakpoints={{xl: 1200, lg: 992, sm: 576, xs: 0}}
            cols={{xl: 16, lg: 12, sm: 4, xs: 1}}
            rowHeight={rowHeight}
            margin={[gridMargin, gridMargin]}
            isBounded={true}
            onResize={handleResize}
            onResizeStart={() => isResizing.current = true}
            onResizeStop={handleResizeAndDragStop}
            onDragStop={handleResizeAndDragStop}
            onBreakpointChange={(newBreakpoint) => breakpoint.current = newBreakpoint}
            draggableHandle=".draggable-header">
            <div key="experiment-plot">
                <Card title={t("experiments.dashboard.graph")}
                      minimization={[savedExperimentPlotMinimization, setSavedExperimentPlotMinimization]}
                      className={"border-top-primary border-top-5 overflow-hidden h-100 is-draggable"}>
                    <div className="h-100" ref={element => experimentRefs.current["experiment-plot"] = element}>
                        <ExperimentPlot/>
                    </div>
                </Card>
            </div>
            {[dashboard.userExperiment?.experiment.device?.deviceType.name, dashboard.experiments[0].deviceType.name].includes('tom1a') && (
                <div key="experiment-animation">
                    <Card title={t("experiments.dashboard.animation")}
                          minimization={[savedExperimentAnimationMinimization, setSavedExperimentAnimationMinimization]}
                          className={"border-top-primary border-top-5 overflow-hidden h-100 is-draggable"}>
                        <div ref={element => experimentRefs.current["experiment-animation"] = element}>
                            <ExperimentAnimation/>
                        </div>
                    </Card>
                </div>
            )}
            <div key="experiment-form">
                <Card title={t("experiments.dashboard.commands")}
                      minimization={[savedExperimentFormMinimization, setSavedExperimentFormMinimization]}
                      className={"border-top-primary border-top-5  overflow-hidden h-100 is-draggable"}>
                    <div ref={element => experimentRefs.current["experiment-form"] = element}>
                        <ExperimentForm
                            experiments={dashboard.experiments}
                            userExperimentCurrent={dashboard.running ? dashboard.userExperiment : undefined}
                            handleSubmitForm={dashboard.handleSubmit}
                            handleStop={dashboard.userExperiment && dashboard.running ? dashboard.handleStop : undefined}
                            disabled={dashboard.disabledForm}
                            hasError={dashboard.hasError}
                        />
                    </div>
                </Card>
            </div>
            {dashboard.cameraIsConnected && (
                <div key="experiment-video">
                    <Card title={t("experiments.dashboard.video")}
                          minimization={[savedExperimentVideoMinimization, setSavedExperimentVideoMinimization]}
                          className={"border-top-primary border-top-5 overflow-hidden h-100 is-draggable"}>
                        <div ref={element => experimentRefs.current["experiment-video"] = element}>
                            <ExperimentVideo/>
                        </div>
                    </Card>
                </div>
            )
            }


        </ResponsiveGridLayout>
    )
}

export default ExperimentDashboard