import {Col} from "react-bootstrap";
import React from "react";

export const ForgotPassword = ({handleForgotPassword}) => {
    return (<Col style={{marginBottom: '10px'}}>
        <div onClick={handleForgotPassword}
             style={{
                 color: 'blue',
                 cursor: 'pointer',
                 textDecoration: 'underline',
                 fontSize: '16px'
             }}>Forgot Password
        </div>
    </Col>);
}