import React, {useEffect, useState} from "react";
import {SpinnerOverlay} from "../../../../../../components";
import PlotlyChart from "react-plotly.js";
import {LegendClickEvent} from "plotly.js";
import { WsData } from "types";
import {PlotData} from 'plotly.js'

type Props = {
    loading: boolean,
    data?: WsData[],
}


const getAxisVisibility = (name: string, axis?: PlotData[]) => {
    return axis?.find((item) => item.name === name)?.visible ?? 'legendonly'
}

const ExperimentalPlot: React.FC<Props> = ({loading, data}: Props) => {
    const [graphData, setGraphData] = useState<PlotData[]>()

    useEffect(() => {
        if (data)
        updateGraphData()
    }, [data])


    const updateGraphData = () => {
        if (data) {
            const time = data[0].name.toLowerCase() === 'timestamp'
                ? data[0].data.map((timestamp: string) => parseFloat(timestamp))
                : Array.from(Array(data[0].data).keys()).map((i) => i)

            setGraphData(
                data.map((d) => {
                    if (d.name === 'Timestamp') return {} as PlotData
                    return {
                        name: d['name'],
                        x: time,
                        y: d['data'],
                        type: 'scatter',
                        visible: getAxisVisibility(d['name'], graphData)
                    } as PlotData
                }),
            )
        }

    }

    return (
        <div className="position-relative">
            {loading && <SpinnerOverlay transparent={true} className="position-absolute" style={{zIndex: 999}}/>}
            <PlotlyChart
                data={graphData || []}
                onLegendClick={(e: Readonly<LegendClickEvent>) => {
                    setGraphData( e?.data as PlotData[] )
                    return true
                }}
                layout={{}}
                useResizeHandler={true}
                style={{width: '100%'}}
            />
        </div>
    )
}


export default React.memo(ExperimentalPlot)