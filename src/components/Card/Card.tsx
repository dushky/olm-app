import React, {useState} from 'react'
import CIcon from '@coreui/icons-react'
import {cilWindowMinimize} from '@coreui/icons'
import {CCard, CCardBody, CCardHeader} from '@coreui/react'

interface Props {
    children?: JSX.Element | string | (JSX.Element | string)[]
    icon?: any
    title: string
    actions?: JSX.Element | JSX.Element[]
    className?: string,
    itCanMinimize?: boolean
}

const Card: React.FC<Props> = ({children, icon, title, actions, className = '', itCanMinimize = false}: Props) => {
    const [showBody, setShowBody] = useState(true);
    const handleMinimize = () => {
        setShowBody((showBody) => !showBody)
    }

    return (
        <CCard className={className}>
            <CCardHeader
                className="d-flex align-items-md-center">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between flex-1">
                    <div className="draggable-header flex-1">
                        <strong className="d-flex mb-1 mb-md-0 align-items-center">
                            {icon && <CIcon content={icon} className="me-1"/>}
                            {title}
                        </strong>
                    </div>
                    {actions && <div>{actions}</div>}
                </div>
                {itCanMinimize &&
                    <CIcon style={{cursor: "pointer"}} className="ms-3" content={cilWindowMinimize} onClick={handleMinimize}/>}
            </CCardHeader>
            <CCardBody style={showBody ? {} : {display: "none"}}>{children}</CCardBody>
        </CCard>
    )
}

export default Card
