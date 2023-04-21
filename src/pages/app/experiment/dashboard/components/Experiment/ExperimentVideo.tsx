import React, {useContext, useRef, useState} from "react";
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
import { can } from 'utils/permissions'
import {AppStateContext} from "../../../../../../provider";


type Props = {}

const ExperimentVideo: React.FC<Props> = () => {
    const dashboard = useContext(DashboardContext);
    const { appState } = useContext(AppStateContext)
    const {t} = useTranslation()
    const [loading, setLoading] = useState(false);
    const streamUrl = useRef<string>(`https://${dashboard.experiments[0].server?.api_domain}:9000/stream`);
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
                if (!values.data?.startVideoStream.isRunning){
                    toast.error(values.data?.startVideoStream.status ?? "Error");
                }
            }
        ).catch((reason: Error) => {
            toast.error(reason.message);
        }).finally(() => {
            videoStreamStatus.refetch().finally(() => {
                setLoading(false);
            });
        });
    }

    const handleStopVideoStream = async () => {
        setLoading(true);
        await stopVideoStreamMutation({
            variables: {
                deviceId: dashboard.experiments[0].device?.id || "0",
            }
        }).then(
            (values) => {
                if (!values.data?.stopVideoStream.isStopped){
                    toast.error(values.data?.stopVideoStream.status ?? "Error")
                }
            }
        ).catch((reason: Error) => {
            toast.error(reason.message)
        }).finally(() => {
            videoStreamStatus.refetch().finally(() => {
                setLoading(false);
            });
        })
    }

    return (
        <div className="position-relative pb-2 w-100">
            {(loading || videoStreamStatus.loading) && <SpinnerOverlay transparent={true} className="position-absolute" style={{ zIndex: 999 }} />}
            {(videoStreamStatus.data?.videoStreamStatus?.isRunning) && (
            <div>
                <img className="w-100" src={streamUrl.current} alt="experiment stream"/>
                {can('server.stop_video', appState.authUser) && (
                    <CButton
                        disabled={loading}
                        className="w-100 mt-2"
                        onClick={handleStopVideoStream}
                    >
                        {t('experiments.actions.stop.video')}
                    </CButton>
                )}
            </div>
                )
        || (
            <div>
                <div className="w-100 d-flex justify-content-center align-items-center bg-light rounded-2 border-light" style={{aspectRatio: "4 / 3"}}>
                    <CIcon content={cilVideo} size="4xl"/>
                </div>
                {can('server.start_video', appState.authUser) &&
                    (
                        <CButton
                            disabled={loading}
                            className="w-100 mt-2"
                            onClick={handleStartVideoStream}
                        >
                            {t('experiments.actions.run.video')}
                        </CButton>
                    )
                }

            </div>
        )
            }
        </div>

    );
}
export default React.memo(ExperimentVideo);