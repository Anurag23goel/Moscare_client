import React, {useContext, useState} from "react";
import {Tab, Tabs} from "@mui/material";
import {Spinner} from "react-bootstrap";
import Row from "@/components/widgets/utils/Row";
import ColorContext from "@/contexts/ColorContext";
import Information from "./Information";
import Funding from "./Funding";
import Highintensity from "./Highintensity";

const NDIS = ({setSelectedComponent, onTabChange, onSaveReady, isButtonClicked, setIsButtonClicked}) => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <Spinner/>;
    // }

    const [selectedTabNdis, setSelectedTabNdis] = useState("Information");

    const handleTabChange = (tab) => {
        setSelectedTabNdis(tab)
        onTabChange(tab); // Notify parent of active tab
    };

    return (
        <div>

            <Row
                style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: "unset",
                }}
            >
                <div style={{width: "100%"}}>
                    <Tabs
                        sx={{
                            backgroundColor: "blue",
                            padding: "8px",
                            color: "white",

                        }}
                        value={selectedTabNdis}
                        onChange={(e, value) => {
                            handleTabChange(value);
                        }}
                        orientation="horizontal"
                        classes={{
                            root: "tabsContainer", // Apply the global CSS class for Tabs container
                            flexContainer: "tabsFlexContainer",
                            indicator: "tabsIndicator",
                        }}
                    >
                        {[
                            {label: "Information", value: "Information"},
                            {label: "Funding", value: "Funding"},
                            {label: "High Intensity/Complex Care", value: "High Intensity/Complex Care"},
                        ].map((tab) => (
                            <Tab
                                key={tab.value}
                                disableRipple
                                classes={{
                                    root: "tabItem",
                                    selected: "tabItemSelected",
                                }}
                                label={tab.label}
                                value={tab.value}
                            />
                        ))}
                    </Tabs>
                </div>

                {selectedTabNdis === "Information" && (<Information
                    onTabChange={onTabChange}
                    onSaveReady={onSaveReady}
                    isButtonClicked={isButtonClicked}
                    setIsButtonClicked={setIsButtonClicked}
                />)}
                {selectedTabNdis === "Funding" && <Funding
                    onTabChange={onTabChange}
                    onSaveReady={onSaveReady}
                    isButtonClicked={isButtonClicked}
                    setIsButtonClicked={setIsButtonClicked}
                />}
                {selectedTabNdis === "High Intensity/Complex Care" && <Highintensity
                    onTabChange={onTabChange}
                    onSaveReady={onSaveReady}
                    isButtonClicked={isButtonClicked}
                    setIsButtonClicked={setIsButtonClicked}
                />}
            </Row>

        </div>
    );
};

export default NDIS;
