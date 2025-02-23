import React, {useEffect, useState} from "react";
import {Card, Divider, ListItem, ListItemText} from "@mui/material";
import MButton from "@/components/widgets/MaterialButton";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import General from "@/components/forms/maintenance/payer/form/General";
import Clients from "@/components/forms/maintenance/payer/form/Clients";
import Agreement from "@/components/forms/maintenance/payer/form/Agreement";
import Notes from "@/components/forms/maintenance/payer/form/notes/notes";

const drawerStyles = {
    drawer: {
        width: "250px", // Set the width of the drawer
    },
    closeButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
    },
    listItem: {
        padding: "10px 20px", // Adjust padding for list items
        "&:hover": {
            //backgroundColor: 'rgba(197,197,197,0.5)', // Change background color on hover
            cursor: "pointer", // Change cursor on hover
            scale: "0.95",
        },
        "&:active": {
            backgroundColor: "rgba(197,197,197,0.5)", // Change background color on focus
        },
    },
};

const UpdateWorkerProfile = (props) => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    // you should keep one blank space after the general
    const [selectedComponent, setSelectedComponent] = useState("General ");
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [generalEdit, setGeneralEdit] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const handleButtonClick = (info) => {
        setSelectedComponent(info);
    };

    const drawerItems = [
        `General ${generalEdit ? "*" : ""}`,
        "Clients",
        "Agreement",
        "Notes"
    ];

    const handleModalCancel = () => {
        setShowForm(false);
    };

    return (
        <div>
            {/* <Navbar /> */}
            <div
                style={{
                    margin: "1rem",
                }}
            >
                <Modal
                    style={{
                        content: {
                            maxWidth: "600px", // Set the maximum width of the modal
                            margin: "0 auto", // Center the modal horizontally
                            maxHeight: "fit-content", // Set the maximum height of the modal
                            position: "absolute",
                            top: "30%",
                        },
                        overlay: {
                            zIndex: 10,
                        },
                    }}
                    isOpen={showForm}
                    contentLabel="Message"
                >
                    <ModalHeader title="Message" onCloseButtonClick={handleModalCancel}/>
                    <br/>
                    <form>
                        <InputField
                            type="textarea"
                            id="message"
                            label={"Message:"}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                        />
                        <Button
                            label={"Send"}
                            onClick={(e) => {
                                e.preventDefault();
                                console.log(message);
                            }}
                            backgroundColor="#1976d2"
                        />
                        <br/>
                    </form>
                </Modal>
                <Card
                    style={{
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginInline: "1rem",
                            height: "5rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                                marginLeft: "10%",
                            }}
                        >
                            <MButton
                                variant="contained"
                                onClick={() => setShowForm(true)}
                                label={"Direct Message"}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                            }}
                        >
                            <MButton
                                variant="contained"
                                color="primary"
                                label={"Conversations"}
                            />
                            <MButton
                                variant="contained"
                                color="primary"
                                disabled
                                label={"Delete"}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* DRAWER STYLE*/}

            <div
                style={{
                    display: "flex",
                    justifyContent: "start",
                    margin: "1rem",
                }}
            >
                <div>
                    <Card
                        style={{
                            borderRadius: "15px",
                            width: "200px",
                            maxWidth: "200px",
                            maxHeight: "70vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                            scrollbarWidth: "thin",
                            scrollBehavior: "smooth",
                        }}
                    >
                        {drawerItems.map((text, index) => (
                            <div
                                style={{
                                    padding: "5px",
                                }}
                            >
                                <ListItem
                                    key={text}
                                    sx={{
                                        ...drawerStyles.listItem,
                                        backgroundColor:
                                            selectedComponent === text ? "blue" : "",
                                        color: selectedComponent === text ? "white" : "",
                                        //scale: selectedComponent === text ? '1.1' : '1',
                                        transition: "all 0.3s ease",
                                        borderRadius: "10px",
                                    }}
                                    onClick={() => handleButtonClick(text)}
                                >
                                    <ListItemText primary={text} sx={{textAlign: "start"}}/>
                                </ListItem>
                                <Divider color={"darkgray"} variant={"middle"}></Divider>
                            </div>
                        ))}
                    </Card>
                </div>

                <div style={{width: "80vw"}}>
                    <div style={{width: "100%"}}>
                        {selectedComponent === `General ${generalEdit ? "*" : ""}` && (
                            <General
                                setGeneralEdit={setGeneralEdit}
                                setSelectedComponent={setSelectedComponent}
                            />
                        )}
                        {selectedComponent === "Clients" && <Clients/>}

                        {selectedComponent === "Agreement" && <Agreement/>}

                        {selectedComponent === "Notes" && <Notes/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateWorkerProfile;
