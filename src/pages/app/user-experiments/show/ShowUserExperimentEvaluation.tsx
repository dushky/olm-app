import React from "react";
import {UserExperimentEvaluation} from "../../../../__generated__/graphql";
import {useTranslation} from "react-i18next";
import {CCol, CRow} from "@coreui/react";

type Props = {
    evaluation: UserExperimentEvaluation[][]
}
const ShowUserExperimentEvaluation: React.FC<Props> = ({evaluation}: Props) => {
    const { t } = useTranslation()

    return (
        <>
            <h5>{t('user_experiments.evaluation')}:</h5>
            {evaluation.map((userEvaluation) => {
                const requiredValue = userEvaluation.find((item) => item.name === 'required_value')
                return (
                    <div>
                        <h6><strong>{t('user_experiments.evaluation_values.' + requiredValue?.name)}: {requiredValue?.value}</strong></h6>
                        <CRow>
                            {userEvaluation.map((item) => ( item.name !== 'required_value' &&
                                <CCol md={6} key={item.name}>
                                    <strong>{t('user_experiments.evaluation_values.' + item.name)}</strong>:&nbsp;
                                    <span>{item.value}</span>
                                </CCol>
                            ))}
                        </CRow>
                        <hr/>
                    </div>

                );
            })
            }
        </>
    )
}

export default ShowUserExperimentEvaluation;