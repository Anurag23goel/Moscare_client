import React from "react";
import {Card} from "@mui/material";
import MButton from "../widgets/MaterialButton";
import {getOAuth2Token} from "@/utility/api_utility";

const handleLogin = async () => {

    const getToken = async () => {
        const tokenData = await getOAuth2Token();
        return tokenData;
    };

    const token = await getToken();
    const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
    console.log(baseAPIUrl);

    const response = await fetch(`${baseAPIUrl}/xero/login`, {
        method: "GET",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Encoding": "",
            Authorization: `Bearer ${token}`,
            'M-Client-ID': process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
        },
    });
    const data = await response.json();
    console.log(data);

    if (data.status === "redirect" && data.url) {
        const redirectUrl = data.url;
        console.log(redirectUrl);
        window.location.href = redirectUrl;
    }

}

const Connector = () => {
    return (
        <div style={{fontSize: "14px", marginInline: "1rem"}}>
            {/*<DashMenu />*/}
            <Card
                style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    width: "80vw",
                    padding: "1rem 2rem",
                    margin: " 1rem auto"
                }}
            >
                <div style={{display: "flex", gap: "1.5rem", justifyContent: "flex-end"}}>
                    <MButton
                        variant="contained"
                        label={"Connect to Xero"}
                        size={"small"}
                        onClick={handleLogin}
                    />
                </div>
            </Card>
        </div>
    );
};

export default Connector;
