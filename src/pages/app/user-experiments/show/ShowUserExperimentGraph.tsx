import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import PlotlyChart from 'react-plotly.js'
import { PlotType } from 'plotly.js'
import {ExperimentOutputArguments} from "../../../../__generated__/graphql";

type graphData = { name: string; data: Array<number> }[]

type Props = {
  data: graphData
  title: string
  outputArguments: ExperimentOutputArguments[]
  software: string
}

const ShowUserExperimentGraph: React.FC<Props> = ({ data, title, outputArguments, software }: Props) => {
  const { t } = useTranslation()
  const [graphData, setGraphData] = useState<Plotly.Data[]>()
  console.log(t('experiment-output.'+'time'))
  useEffect(() => {
    const time = data.length
      ? data[0].name === 'time'
        ? data[0].data
        : Array.from(Array(data[0].data).keys()).map((i) => i)
      : []

    const formatedData: Plotly.Data[] = data.map((d) => {
      if (d.name === 'time') return {}
      return {
        name: t('experiment-output.'+d.name),
        x: time,
        y: d.data,
        type: 'scatter' as PlotType,
        visible: outputArguments
            .find((outputArgument) => outputArgument.name === d.name)
            ?.defaultVisibilityFor?.includes(software) ?? 'legendonly',
      } as Plotly.Data
    })

    setGraphData(formatedData)
  }, [data])

  return (
    <PlotlyChart
      data={graphData || []}
      layout={{
        title: title,
        xaxis: {
          title: {
            text: t('user_experiments.simulation_time'),
          },
        },
        yaxis: {
          title: {
            text: t('user_experiments.measurement_value'),
          },
        },
      }}
      useResizeHandler={true}
      style={{ width: '100%' }}
    />
  )
}

export default ShowUserExperimentGraph
