import React, {useContext, useState} from "react";
import LdapLoginButton from "./LdapLoginButton";
import {
    CButton,
    CForm, CFormInput,
    CInputGroup,
    CInputGroupText,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";
import {useTranslation} from "react-i18next";
import {AppStateContext} from "../../../../provider";
import {LoginInput, useLdapLoginMutation} from "../../../../__generated__/graphql";
import {useNavigate} from "react-router-dom";
import {ErrorNotifier} from "../../../../components";
import CIcon from "@coreui/icons-react";
import {cilLockLocked, cilUser} from "@coreui/icons";

const LdapLogin: React.FC = () => {
    const [ldapModalVisible, setLdapModalVisible] = useState(false)
    const { t } = useTranslation()
    const { appSetLogin, appSetRefreshToken } = useContext(AppStateContext)
    const [ldapLogin, { loading, error }] = useLdapLoginMutation()

    const [ldapLoginInput, setLdapLoginInput] = useState<LoginInput>({
        username: '',
        password: '',
    })
    const navigate = useNavigate()

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const { data } = await ldapLogin({
                variables: {
                    ldapLoginInput,
                },
            })
            if (
                data === undefined ||
                data?.ldapLogin === undefined ||
                data.ldapLogin?.access_token === undefined ||
                data.ldapLogin?.user === undefined
            )
                throw new Error('Invalid credentials')

            appSetRefreshToken(data?.ldapLogin.refresh_token || '')
            appSetLogin(data?.ldapLogin.access_token!, data?.ldapLogin.expires_in!, data?.ldapLogin.user!)

            navigate('/')
        } catch {}
    }

    return (
        <>
            <LdapLoginButton onClick={() => { setLdapModalVisible(true)}}/>
            <CModal alignment="center" visible={ldapModalVisible} onDismiss={() => setLdapModalVisible(false)}>
                <CModalHeader className="align-items-start">
                    <div>
                        <CModalTitle>
                            <img src="/img/STU-anfh.png" alt="STU logo" width="400px"/>
                        </CModalTitle>
                        <br/>
                        <small style={{lineHeight: 1.2}}>{t('login.ldap-description')}</small>
                    </div>
                </CModalHeader>
                <CForm onSubmit={handleLogin}>
                    <CModalBody>
                        <ErrorNotifier error={error} />
                        <CInputGroup className="mb-3">
                            <CInputGroupText>
                                <CIcon content={cilUser} />
                            </CInputGroupText>
                            <CFormInput
                                placeholder={t('login.form.user-name')}
                                autoComplete="username"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                    setLdapLoginInput({ ...ldapLoginInput, username: event.target.value })
                                }
                            />
                        </CInputGroup>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon content={cilLockLocked} />
                            </CInputGroupText>
                            <CFormInput
                                type="password"
                                placeholder={t('login.form.password')}
                                autoComplete="current-password"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                    setLdapLoginInput({ ...ldapLoginInput, password: event.target.value })
                                }
                            />
                        </CInputGroup>
                    </CModalBody>
                    <CModalFooter>
                        <CButton type="submit" color="primary">{t('login.form.button')}</CButton>
                    </CModalFooter>
                </CForm>
            </CModal>
        </>
    )
}

export default LdapLogin;