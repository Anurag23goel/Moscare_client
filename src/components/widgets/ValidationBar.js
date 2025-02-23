import React from "react";
import PropTypes from "prop-types";
import {Alert} from "@mui/material";

const ValidationBar = ({messages, onClose}) => {
    return (
        <div className="validation-bar-container">
            {messages?.map((msg) => (
                <Alert
                    key={msg.id}
                    severity={msg.type}
                    variant="filled"
                    onClose={() => onClose(msg.id)} // Updated line
                    sx={{
                        width: "100%",
                        margin: "8px 0",
                        padding: "16px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: msg.type === "error" ? "#ff4444" : "",
                        color: "#fff",
                    }}
                >
                    {msg.content}
                </Alert>
            ))}
        </div>
    );
};

ValidationBar.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.oneOf(["error", "warning", "info", "success"]).isRequired,
            content: PropTypes.string.isRequired,
        })
    ).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ValidationBar;
