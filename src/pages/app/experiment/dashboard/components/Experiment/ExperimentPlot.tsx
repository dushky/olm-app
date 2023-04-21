import React, {useContext, useEffect, useRef, useState} from "react";
import {SpinnerOverlay} from "../../../../../../components";
import PlotlyChart from "react-plotly.js";
import {LegendClickEvent, PlotData} from "plotly.js";
import {DashboardContext} from "./ExperimentDashboardWrapper";

// type Props = {
//     loading: boolean,
//     data?: WsData[],
// }
type Props = {}


// const ExperimentalPlot: React.FC<Props> = ({loading, data}: Props) => {
const ExperimentPlot: React.FC<Props> = () => {
    const {
        loading,
        data,
        userExperiment
    } = useContext(DashboardContext)
    const [graphData, setGraphData] = useState<PlotData[]>([])
    const showDefaultVisibility = useRef(true);

    useEffect(() => {
        if (data) {
            updateGraphData()
        }
    }, [data])

    const getAxisVisibility = (name: string, defaultVisibilityFor: string[], axis?: PlotData[]) => {
        if (showDefaultVisibility.current
            && defaultVisibilityFor.includes(userExperiment?.experiment.software.name ?? ""))
        {
            return true;
        }
        return axis?.find((item) => item.name === name)?.visible ?? 'legendonly'
    }


    const updateGraphData = () => {
        if (data) {
            const time = data[0].name.toLowerCase() === 'timestamp'
                ? data[0].data.map((timestamp: string) => parseFloat(timestamp))
                : Array.from(Array(data[0].data).keys()).map((i) => i)

            setGraphData( (graphData) =>
                data.map((d) => {
                    if (d.name === 'Timestamp') return {} as PlotData
                    return {
                        name: d['name'],
                        x: time,
                        y: d['data'],
                        type: 'scatter',
                        visible: getAxisVisibility(d['name'], d["defaultVisibilityFor"], graphData)
                    } as PlotData
                }),
            )
        }

    }

    return (
        <div className="position-relative h-100 pb-3">
            {loading && <SpinnerOverlay transparent={true} className="position-absolute" style={{zIndex: 999}}/>}
            <PlotlyChart
                data={graphData}
                onLegendClick={(e: LegendClickEvent) => {
                    showDefaultVisibility.current = false
                    return true
                }}
                layout={{
                    autosize: true,
                    margin: {
                        l: 40,
                        r: 0,
                        b: 20,
                        t: 20,
                        pad: 0,
                    }
                }}
                useResizeHandler={true}
                style={{width: '100%', height: "100%"}}
            />
        </div>
    )
}


export default React.memo(ExperimentPlot)