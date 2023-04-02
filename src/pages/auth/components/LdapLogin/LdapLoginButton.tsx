import React from "react";
import {CButtonProps} from "@coreui/react/dist/components/button/CButton";

const LdapLoginButton: React.FC<CButtonProps> = ({onClick}: CButtonProps) => {
    return (
        <button type="button" className="btn login-with-button" onClick={ onClick }>
            <div className="me-3">
                <img src="/img/STU-zfv_bordova.png" alt="STU logo" width="60px"/>
            </div>
            <span>Log in with STUBA LDAP</span>
        </button>
    )
}

export default LdapLoginButton