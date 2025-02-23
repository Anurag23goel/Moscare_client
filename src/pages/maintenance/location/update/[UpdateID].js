import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Card, Divider, ListItem, ListItemIcon, ListItemText,} from "@mui/material";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import General from "@/components/forms/maintenance/location_profile/form/General";
import Details from "@/components/forms/maintenance/location_profile/form/Details";
import LocProfClients from "@/components/forms/maintenance/location_profile/form/clients/LocProfClients";
import Contacts from "@/components/forms/maintenance/location_profile/form/contacts/Contacts";
import Rosters from "@/components/forms/maintenance/location_profile/form/Rosters";
import Forms from "@/components/forms/maintenance/location_profile/form/forms/Forms";
import Compliance from "@/components/forms/maintenance/location_profile/form/compliance/Compliance";
import Notes from "@/components/forms/maintenance/location_profile/form/note/Note";
import Assets from "@/components/forms/maintenance/location_profile/form/assets/Assets";
import Documents from "@/components/forms/maintenance/location_profile/form/document/Documents";
import Rooms from "@/components/forms/maintenance/location_profile/form/rooms/Rooms";

// Import Material Icons
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GavelIcon from "@mui/icons-material/Gavel";
import NoteIcon from "@mui/icons-material/Note";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import HandymanIcon from '@mui/icons-material/Handyman';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import {Spinner} from "react-bootstrap";
// import Clients from "@/components/forms/maintenance/location_profile/form/Clients";
// import Agreement from "@/components/forms/maintenance/location_profile/form/Agreement";
// import Notes from "@/components/forms/maintenance/location_profile/form/Notes";

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

const UpdateLocationProfile = (props) => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    if (!router.isReady) return <Spinner/>;
    const [selectedComponent, setSelectedComponent] = useState(
        router.isReady && router.query.c ? router.query.c : "general"
    );
    const [generalEdit, setGeneralEdit] = useState(false);
    const [detailsEdit, setDetailsEdit] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (router.isReady && router.query.c) {
            setSelectedComponent(router.query.c);
        }
    }, [router.isReady, router.query.c]);

    const handleButtonClick = (info) => {
        window.history.replaceState(null, null, `/maintenance/location/update/${router.query.UpdateID}?c=${info}`);
        setSelectedComponent(info);
    };

    const drawerItems = [
        {
            text: `General ${generalEdit ? "*" : ""}`,
            icon: <PersonIcon/>, // Replace with an appropriate location-related icon if needed
        },
        {
            text: `Details ${detailsEdit ? "*" : ""}`,
            icon: <InfoIcon/>,
        },
        {text: "Clients", icon: <GroupAddIcon/>}, // Replace with a relevant icon
        {text: "Contacts", icon: <PhoneIcon/>},
        // { text: "Rosters", icon: <ScheduleIcon /> }, // Uncomment if rosters are required
        {text: "Forms", icon: <DescriptionIcon/>},
        {text: "Compliance", icon: <GavelIcon/>},
        {text: "Notes", icon: <NoteIcon/>},
        {text: "Assets", icon: <HandymanIcon/>}, // Replace with a relevant icon
        {text: "Documents", icon: <InsertDriveFileIcon/>},
        {text: "Rooms", icon: <RoomPreferencesIcon/>}, // Replace with a room-related icon
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
                    {/* <div
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
             
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
           
            </div>
          </div> */}
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
                            maxHeight: "100%",
                            overflowY: "auto",
                            overflowX: "hidden",
                            scrollbarWidth: "thin",
                            scrollBehavior: "smooth",
                            background: "linear-gradient(145deg, #f9f9f9, #f9f9f9)",
                            padding: "6px 0",
                            position: "sticky",
                            top: "10px",
                            alignSelf: "flex-start",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
                        }}
                    >
                        {drawerItems.map((item, index) => (
                            <div key={index}>
                                <ListItem
                                    key={item.text}
                                    sx={{
                                        backgroundColor:
                                            selectedComponent === item.text
                                                ? "blue"
                                                : "transparent",
                                        color:
                                            selectedComponent === item.text
                                                ? "white"
                                                : "#4a4a4a",
                                        borderRadius: "8px",
                                        padding: "12px 16px",
                                        marginBottom: "6px", // Keep spacing tight
                                        transition: "all 0.3s ease",
                                        position: "relative", // For hover indicator
                                        "&:hover": {
                                            backgroundColor:
                                                selectedComponent === item.text
                                                    ? "blue"
                                                    : "#f5f5f5",
                                            boxShadow:
                                                selectedComponent === item.text
                                                    ? "none"
                                                    : "0px 2px 6px rgba(0, 0, 0, 0.08)", // Light shadow on hover
                                        },
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            height: "70%",
                                            width: "3px",
                                            backgroundColor:
                                                selectedComponent === item.text
                                                    ? "white"
                                                    : "transparent",
                                            borderRadius: "2px",
                                            transition: "background-color 0.3s ease",
                                        },
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleButtonClick(item.text)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color:
                                                selectedComponent === item.text
                                                    ? "white"
                                                    : "blue",
                                            minWidth: "40px",
                                            marginRight: "10px", // Adjust spacing
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            textAlign: "start",
                                            fontWeight:
                                                selectedComponent === item.text
                                                    ? "bold"
                                                    : "normal",
                                            fontSize: "16px",
                                        }}
                                    />
                                </ListItem>
                                {index < drawerItems.length - 1 && (
                                    <Divider
                                        sx={{
                                            backgroundColor: "#dcdcdc", // Light divider
                                            margin: "0 16px",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </Card>
                </div>

                <div style={{width: "100%"}}>
                    <div style={{width: "100%"}}>
                        {selectedComponent === `General ${generalEdit ? "*" : ""}` && (
                            <General
                                setGeneralEdit={setGeneralEdit}
                                setSelectedComponent={setSelectedComponent}
                            />
                        )}
                        {selectedComponent === `Details ${detailsEdit ? "*" : ""}` && (
                            <Details
                                setDetailsEdit={setDetailsEdit}
                                setSelectedComponent={setSelectedComponent}
                            />
                        )}

                        {selectedComponent === "Clients" && <LocProfClients/>}

                        {selectedComponent === "Contacts" && <Contacts/>}

                        {selectedComponent === "Rosters" && <Rosters/>}

                        {selectedComponent === "Forms" && <Forms/>}

                        {selectedComponent === "Compliance" && <Compliance/>}

                        {selectedComponent === "Notes" && <Notes/>}

                        {selectedComponent === "Assets" && <Assets/>}

                        {selectedComponent === "Documents" && <Documents/>}

                        {selectedComponent === "Rooms" && <Rooms/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateLocationProfile;
