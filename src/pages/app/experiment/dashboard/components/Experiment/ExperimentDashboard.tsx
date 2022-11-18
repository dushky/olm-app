import {ItemCallback, Layout, Layouts, Responsive, WidthProvider} from "react-grid-layout";
import React, {useContext, useEffect, useRef, useState} from "react";
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
const rowHeight = 50

const countNeededRows = (height = 0): number => {
    return Math.ceil(height / rowHeight)
}

type Props = {}

const ExperimentDashboard: React.FC<Props> = () => {
    const dashboard = useContext(DashboardContext);
    const [savedLayout, setSavedLayout] = useLocalStorage<Layouts>("layout", defaultLayout)
    const {t} = useTranslation()
    const [gridLayout, setGridLayout] = useState<Layouts>(savedLayout);
    const experimentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const [, experimentFormHeight] = useSize(experimentRefs.current["experiment-form"])
    const [, experimentAnimationHeight] = useSize(experimentRefs.current["experiment-animation"])
    const isResizing = useRef(false)

    useEffect(() => {
        if (!isResizing.current) {
            handleExperimentLayoutSizeChange()
        }
    }, [experimentFormHeight, experimentAnimationHeight]);

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

        setGridLayout((gridLayout) => {
            const newLayouts: Layouts = {}
            Object.keys(gridLayout).forEach((breakpoint: string) => {
                newLayouts[breakpoint] = gridLayout[breakpoint].map(layout => {
                    const newLayout = {...layout} as Layout
                    const neededRows: number = countNeededRows(experimentRefs.current[newLayout.i]?.clientHeight)
                    newLayout.h = neededRows
                    newLayout.minH = neededRows
                    return newLayout
                })
            })
            return newLayouts
        })
    }

    const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
        setSavedLayout(allLayouts)
        if (isResizing.current) {
            setGridLayout(allLayouts)
            isResizing.current = false
        }
    }

    return (
        <ResponsiveGridLayout
            layouts={gridLayout}
            breakpoints={{lg: 992, sm: 576, xs: 0}}
            cols={{lg: 4, sm: 2, xs: 1}}
            rowHeight={rowHeight}
            isBounded={true}
            onResize={handleResize}
            onResizeStart={() => isResizing.current = true}
            onResizeStop={handleResize}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".draggable-header">
            {dashboard.userExperiment && (
                <div key="experiment-plot">
                    <Card title={t("experiments.dashboard.graph")}
                          className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                        <div ref={element => experimentRefs.current["experiment-plot"] = element}>
                            <ExperimentPlot/>
                        </div>
                    </Card>
                </div>
            )}
            {dashboard.userExperiment?.experiment.device?.deviceType.name === 'tom1a' && (
                <div key="experiment-animation">
                    <Card title={t("experiments.dashboard.animation")}
                          className={"border-top-primary border-top-5 overflow-hidden h-100"}>
                        <div className={"pb-2"}
                             ref={element => experimentRefs.current["experiment-animation"] = element}>
                            <ExperimentAnimation/>
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