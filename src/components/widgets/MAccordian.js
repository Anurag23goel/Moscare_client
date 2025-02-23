import {Accordion, AccordionDetails, AccordionSummary,} from "@mui/material";
import {ExpandMoreTwoTone} from "@mui/icons-material";
import React from "react";

const MAccordian = ({
                        icon,
                        summaryBgColor,
                        detailsBgColor,
                        summary,
                        details,
                        defaultExpanded = false,
                        disabled = false,
                    }) => {
    return (
        <div>
            <Accordion defaultExpanded={defaultExpanded} disabled={disabled}>
                <AccordionSummary
                    expandIcon={
                        icon ? (
                            icon
                        ) : (
                            <ExpandMoreTwoTone sx={{color: "white", margin: "0 1rem"}}/>
                        )
                    }
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={{
                        backgroundColor: summaryBgColor ? summaryBgColor : "#f9f9f9",
                        color: "white",
                        width: "100%",
                        borderRadius: "4px",
                        fontSize: "12px",
                    }}
                >
                    {summary}
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        backgroundColor: detailsBgColor ? detailsBgColor : "#f9f9f9",
                        padding: "1rem",
                        borderRadius: "10px",
                        overflow: "hidden",
                        // height: "40rem"
                    }}
                >
                    {details}
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default MAccordian;