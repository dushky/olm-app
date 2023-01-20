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

const ResponsiveGridLayout = WidthProvider(Responsive)
const defaultLayout: Layouts = {
    lg: [
        {i: "experiment-plot", x: 0, y: 0, w: 2, h: 9, minH: 9, maxH: 9, minW: 2} as Layout,
        {i: "experiment-animation", x: 2, y: 0, w: 2, h: 7} as Layout,
        {i: "experiment-form", x: 0, y: 9, w: 4, h: 6, minH: 6} as Layout,
    ],
    sm: [
        {i: "experiment-plot", x: 0, y: 0, w: 2, h: 9, minH: 9, maxH: 9, minW: 2} as Layout,
        {i: "experiment-animation", x: 0, y: 9, w: 1, h: 7} as Layout,
        {i: "experiment-form", x: 1, y: 9, w: 1, h: 10, minH: 6} as Layout,
    ],
    xs: [
        {i: "experiment-plot", x: 0, y: 0, w: 1, h: 9, minH: 9, maxH: 9, minW: 1} as Layout,
        {i: "experiment-animation", x: 0, y: 9, w: 1, h: 7} as Layout,
        {i: "experiment-form", x: 0, y: 16, w: 1, h: 6, minH: 6} as Layout,
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
    const [savedGridLayout, setSavedGridLayout] = useLocalStorage<Layouts>("gridLayout", defaultLayout)
    const experimentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const [, experimentFormHeight] = useSize(experimentRefs.current["experiment-form"])
    const [, experimentAnimationHeight] = useSize(experimentRefs.current["experiment-animation"])
    const [, experimentPlotHeight] = useSize(experimentRefs.current["experiment-plot"])
    const isResizing = useRef(false)
    const breakpoint = useRef("")

    useEffect(() => {
        if (!isResizing.current) {
            handleExperimentLayoutSizeChange()
        }
    }, [experimentFormHeight, experimentAnimationHeight, experimentPlotHeight]);

    const handleResize: ItemCallback = (layout,
                                        oldItem,
                                        newItem,
                                        placeholder) => {
        let neededRows: number = countNeededRows(experimentRefs.current[newItem.i]?.offsetHeight)
        newItem.h = neededRows
        newItem.minH = neededRows
        newItem.maxH = neededRows
        if (placeholder) {
            placeholder.h = neededRows
            placeholder.minH = neededRows
            placeholder.maxH = neededRows
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
                    newLayout.minH = neededRows
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
            breakpoints={{lg: 992, sm: 576, xs: 0}}
            cols={{lg: 4, sm: 2, xs: 1}}
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
                      className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                    <div ref={element => experimentRefs.current["experiment-plot"] = element}>
                        <ExperimentPlot/>
                    </div>
                </Card>
            </div>
            {[dashboard.userExperiment?.experiment.device?.deviceType.name, dashboard.experiments[0].deviceType.name].includes('tom1a') && (
                <div key="experiment-animation">
                    <Card title={t("experiments.dashboard.animation")}
                          minimization={[savedExperimentAnimationMinimization, setSavedExperimentAnimationMinimization]}
                          className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                        <div ref={element => experimentRefs.current["experiment-animation"] = element}>
                            <ExperimentAnimation/>
                        </div>
                    </Card>
                </div>
            )}
            <div key="experiment-form">
                <Card title={t("experiments.dashboard.commands")}
                      minimization={[savedExperimentFormMinimization, setSavedExperimentFormMinimization]}
                      className={"border-top-primary border-top-5  overflow-hidden h-100"}>
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

        </ResponsiveGridLayout>
    )
}

export default ExperimentDashboard