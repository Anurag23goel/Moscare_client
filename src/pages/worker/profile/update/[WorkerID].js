import React, {useEffect, useState} from "react";
import {Card,} from "@mui/material";
import General from "@/components/forms/worker_update/General";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import Details from "@/components/forms/worker_update/Details";
import Skill from "@/components/forms/worker_update/skills/Skill";
import Equipment from "@/components/forms/worker_update/equipment/equipment";
import Form from "@/components/forms/worker_update/form/form";
import TrainingQualification from "@/components/forms/worker_update/training&qualification/trainingQualification";
import Finance from "@/components/forms/worker_update/Finance";
import Notes from "@/components/forms/worker_update/notes/notes";
import Document from "@/components/forms/worker_update/document/document";
import Availability from "@/components/forms/worker_update/availability/availability";
import Engagement from "@/components/forms/worker_update/engagement/engagement";
import Compliance from "@/components/forms/worker_update/compliance/compliance";
import Report from "@/components/forms/worker_update/Report";
import WorkerIncidents from "@/components/forms/worker_update/incidents/worker_incidents";

// Import Material Icons
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import NoteIcon from "@mui/icons-material/Note";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import BuildIcon from "@mui/icons-material/Build";
import DevicesIcon from "@mui/icons-material/Devices";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CustomAlert from "@/components/widgets/ClientAlert.js";
import {DollarSign, Info, Save, Users,} from "lucide-react";
import {useRouter} from "next/router";
import {Spinner} from "react-bootstrap";

const UpdateWorkerProfile = (props) => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    const router = useRouter();
    if (!router.isReady) return <Spinner/>;
    // you should keep one blank space after the general
    // Initialize state with a default component (e.g., "general")
    const [selectedComponent, setSelectedComponent] = useState(
        router.isReady && router.query.c ? router.query.c : "general"
    );
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [generalEdit, setGeneralEdit] = useState(false);
    const [detailsEdit, setDetailsEdit] = useState(false);
    const [financeEdit, setFinanceEdit] = useState(false);
    const [availabilityEdit, setAvailabilityEdit] = useState(false);
    const [engagementDetailsEdit, setEngagementDetailsEdit] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [activeGeneralTab, setActiveGeneralTab] = useState(null);
    const [saveFunctions, setSaveFunctions] = useState({});
    const [isButtonClicked, setIsButtonClicked] = useState(false);
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
        if (router.isReady && router.query.component) {
            setSelectedComponent(router.query.component);
        }
    }, [router.isReady, router.query.component]);

    const handleTabChange = (tab) => {
        setActiveGeneralTab(tab); // Update active tab in General
    };

    const registerSaveFunction = (tab, saveFunction) => {
        console.log(`Registered save function for ${tab} ${saveFunction}`);
        setSaveFunctions((prev) => ({...prev, [tab]: saveFunction}));
    };
    const handleClose = () => {
        // setIsButtonClicked(false)
        setOpenConfirmation(false);
    };

    const handleConfirmation = () => {
        setOpenConfirmation(true);
    };

    const handleButtonClick = (componentId) => {
        // Update URL query parameter "component" with shallow routing.
        window.history.replaceState(null, null, `/worker/profile/update/${router.query.WorkerID}?c=${componentId}`);
        setSelectedComponent(componentId);
    };

    // Updated drawerItems to include icons
    const drawerItems = [
        {
            text: `General ${generalEdit ? "*" : ""}`,
            icon: <PersonIcon/>,
        },
        {
            text: `Details ${detailsEdit ? "*" : ""}`,
            icon: <InfoIcon/>,
        },
        {
            text: `Finance ${financeEdit ? "*" : ""}`,
            icon: <AttachMoneyIcon/>,
        },
        {
            text: `Availability ${availabilityEdit ? "*" : ""}`,
            icon: <CalendarTodayIcon/>,
        },
        {
            text: "Training/Qualifications",
            icon: <AccessibilityIcon/>,
        },
        {text: "Skills", icon: <BuildIcon/>},
        {text: "Compliance", icon: <GavelIcon/>},
        //  Commented engagement details for now may use in future versions
        // {
        //   text: `Engagement Details ${engagementDetailsEdit ? "*" : ""}`,
        //   icon: <SettingsIcon />,
        // },
        {text: "Equipment", icon: <DevicesIcon/>},
        {text: "Forms", icon: <DescriptionIcon/>},
        {text: "Documents", icon: <InsertDriveFileIcon/>},
        {text: "Notes", icon: <NoteIcon/>},
        {text: "Incidents", icon: <ReportProblemIcon/>},
        // { text: "Report", icon: <AssessmentIcon /> },
    ];

    const handleModalCancel = () => {
        setShowForm(false);
    };

    const navItems = [
        {id: "general", label: `General`, icon: Users},
        {id: "details", label: `Details`, icon: Info},
        {id: "finance", label: "Finance", icon: DollarSign},
        {id: "availability", label: "Availability", icon: CalendarTodayIcon},
        {
            id: "trainingQualifications",
            label: "Training/Qualifications",
            icon: AccessibilityIcon,
        },
        {id: "skills", label: "Skills", icon: BuildIcon},
        {id: "compliance", label: "Compliance", icon: GavelIcon},
        {id: "equipment", label: "Equipment", icon: DevicesIcon},
        {id: "forms", label: "Forms", icon: DescriptionIcon},
        {id: "documents", label: "Documents", icon: InsertDriveFileIcon},
        {id: "notes", label: "Notes", icon: NoteIcon},
        {id: "incidents", label: "Incidents", icon: ReportProblemIcon},
    ];

    // This useEffect reads the "component" query parameter on page load (or when it changes)
    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.c) {
            setSelectedComponent(router.query.c);
        }
    }, [router.isReady, router.query.c]);

    return (
        <>
            <div className="min-h-screen gradient-background pt-24">
                {/*<Navbar />*/}
                <div>
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
                        <ModalHeader
                            title="Message"
                            onCloseButtonClick={handleModalCancel}
                        />
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
                </div>

                {/* DRAWER STYLE*/}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "start",
                        margin: "1rem",
                    }}
                >
                    <div className="w-80 flex-shrink-0 fixed top-24 bottom-0 left-0 px-4">
                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 h-full overflow-hidden">
                            <div className="p-4">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                    Worker Profile
                                </h2>
                                <nav className="space-y-1">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleButtonClick(item.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    selectedComponent === item.id
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5"/>
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 ml-80 px-6 pb-8 overflow-y-auto">
                        <Card
                            className="clientProfileCard"
                            style={{
                                backgroundColor: "transparent",
                                margin: "5px 10px",
                                padding: "1rem",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.02)",
                                borderRadius: "15px",
                                border: "none",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "1rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "1rem",
                                        alignItems: "center",
                                        marginLeft: "10%",
                                    }}
                                ></div>
                                <div style={{minWidth: "100px"}}>

                                    <button
                                        onClick={() => setOpenConfirmation(true)}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                    >
                                        <Save className="h-5 w-5"/>
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {selectedComponent === `general` && (
                            <General
                                setGeneralEdit={setGeneralEdit}
                                setSelectedComponent={setSelectedComponent}
                                onTabChange={handleTabChange}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                            />
                        )}
                        {selectedComponent === `details` && (
                            <Details
                                setDetailsEdit={setDetailsEdit}
                                setSelectedComponent={setSelectedComponent}
                                onTabChange={handleTabChange}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                            />
                        )}
                        {selectedComponent === 'finance' && (
                            <Finance
                                setFinanceEdit={setFinanceEdit}
                                setSelectedComponent={setSelectedComponent}
                                onTabChange={handleTabChange}
                                onSaveReady={registerSaveFunction}
                                isButtonClicked={isButtonClicked}
                                setIsButtonClicked={setIsButtonClicked}
                            />
                        )}
                        {selectedComponent ===
                            `availability` && (
                                <Availability
                                    setAvailabilityEdit={setAvailabilityEdit}
                                    setSelectedComponent={setSelectedComponent}
                                />
                            )}
                        {selectedComponent === "trainingQualifications" && (
                            <TrainingQualification/>
                        )}
                        {selectedComponent === "skills" && <Skill/>}
                        {selectedComponent === "compliance" && <Compliance/>}
                        {selectedComponent ===
                            `Engagement Details ${engagementDetailsEdit ? "*" : ""}` && (
                                <Engagement
                                    setEngagementDetailsEdit={setEngagementDetailsEdit}
                                    setSelectedComponent={setSelectedComponent}
                                />
                            )}
                        {selectedComponent === "equipment" && <Equipment/>}
                        {selectedComponent === "forms" && <Form/>}
                        {selectedComponent === "documents" && <Document/>}
                        {selectedComponent === "notes" && <Notes/>}
                        {selectedComponent === "incidents" && <WorkerIncidents/>}
                        {selectedComponent === "report" && <Report/>}
                    </div>
                </div>
                <CustomAlert
                    open={openConfirmation}
                    onClose={handleClose}
                    selectedComponent={selectedComponent}
                    action={"update"}
                    onConfirmation={handleConfirmation}
                    activeGeneralTab={activeGeneralTab}
                    setIsButtonClicked={setIsButtonClicked}
                    saveFunctions={saveFunctions}
                />
            </div>
        </>
    );
};

export default UpdateWorkerProfile;
