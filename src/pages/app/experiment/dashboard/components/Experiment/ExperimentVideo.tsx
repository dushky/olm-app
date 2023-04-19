import React, {useContext, useRef, useState} from "react";
import ReactPlayer from "react-player";
import {DashboardContext} from "./ExperimentDashboardWrapper";
import {
    useStartVideoStreamMutation,
    useStopVideoStreamMutation,
    useVideoStreamStatusQuery
} from "../../../../../../__generated__/graphql";
import {CButton} from "@coreui/react";
import {useTranslation} from "react-i18next";
import { cilVideo } from "@coreui/icons";
import {SpinnerOverlay} from "../../../../../../components";
import CIcon from "@coreui/icons-react";
import {toast} from "react-toast";

type Props = {}

const ExperimentVideo: React.FC<Props> = () => {
    const dashboard = useContext(DashboardContext);
    const {t} = useTranslation()
    const playerRef = useRef<ReactPlayer>(null);
    const [loading, setLoading] = useState(false);
    const [activeStream, setActiveStream] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamUrl = useRef<string>(`https://${dashboard.experiments[0].server?.api_domain}:8080/hls/${dashboard.experiments[0].device?.name}.m3u8`);
    const videoStreamStatus = useVideoStreamStatusQuery({
            fetchPolicy: "network-only",
            variables: {
                deviceId: dashboard.experiments[0].device?.id || "0",
            },
        }
    );

    const [startVideoStreamMutation, startVideoStreamMutationVariables] = useStartVideoStreamMutation();
    const [stopVideoStreamMutation, stopVideoStreamMutationVariables] = useStopVideoStreamMutation();

    const handleStartVideoStream = async () => {
        setLoading(true);
        await startVideoStreamMutation({
            variables: {
                deviceId: dashboard.experiments[0].device?.id || "0",
            }
        }).then(
            (values) => {
                intervalRef.current = setInterval(() => {
                    fetch(streamUrl.current, {method: "HEAD"}).then((res) => {
                        if (res.ok) {
                            videoStreamStatus.refetch();
                            clearInterval(intervalRef.current as unknown as number)
                            setLoading(false);
                            setActiveStream(true);
                        }
                    });
                }, 1000)
            }
        ).catch((reason: Error) => {
            toast.error(reason.message);
            setLoading(false);
        })
    }

    const handleStopVideoStream = async () => {
        setLoading(true);
        await stopVideoStreamMutation({
            variables: {
                deviceId: dashboard.experiments[0].device?.id || "0",
            }
        }).then(
            (values) => {
                if (values.data?.stopVideoStream.isStopped){
                    setActiveStream(false)
                }
            }
        ).catch((reason: Error) => {
            toast.error(reason.message)
        }).finally(() => {
            videoStreamStatus.refetch();
            setLoading(false);
        })
    }

    return (
        <div className="position-relative pb-2 w-100">
            {loading && <SpinnerOverlay transparent={true} className="position-absolute" style={{ zIndex: 999 }} />}
            {(activeStream || videoStreamStatus.data?.videoStreamStatus?.isRunning) && (
            <div>
                <ReactPlayer
                    className={"pb-2"}
                    url={streamUrl.current}
                    ref={playerRef}
                    muted={true}
                    width="100%"
                    playing={true}
                    controls={true}
                    height="auto"
                    config={
                        {
                            file: {
                                forceHLS: true,
                                forceSafariHLS: true,
                                hlsOptions: {
                                    maxLoadingDelay: 4,
                                    minAutoBitrate: 0,
                                    lowLatencyMode: true,
                                    enableWorker: true
                                }

                            }
                        }
                    }
                />
                <CButton
                    disabled={loading}
                    className="w-100"
                    onClick={handleStopVideoStream}
                >
                    {t('experiments.actions.stop.video')}
                </CButton>
            </div>
                )
        || (
            <div>
                <div className="w-100 d-flex justify-content-center align-items-center bg-light rounded-2 border-light mb-2" style={{aspectRatio: "16 / 9"}}>
                    <CIcon content={cilVideo} size="4xl"/>
                </div>
                <CButton
                    disabled={loading}
                    className="w-100"
                    onClick={handleStartVideoStream}
                >
                    {t('experiments.actions.run.video')}
                </CButton>
            </div>
        )
            }
        </div>

    );
}
export default React.memo(ExperimentVideo);