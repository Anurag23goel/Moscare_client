import {useRouter} from "next/router";
import Row from "@/components/widgets/utils/Row";
import ColorContext from "@/contexts/ColorContext";
import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import MButton from "@/components/widgets/MaterialButton";
import Checkbox from "@mui/material/Checkbox";
import {fetchData, fetchUserRoles, postData,} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/incidentSlice";
import {Col, Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import {Input} from "@mui/material";
import jsPDF from "jspdf";

const NewIncident = () => {
    const router = useRouter();
    const {ClientID: ClientID} = router.query;
    /* console.log(ClientID); */
    // const {colors, loading} = useContext(ColorContext);
    const [prompt, setPrompt] = useState(false);
    const [file, setFile] = useState(null);
    const [output, setOutput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const defaultIncidentForm = useSelector(
        (state) => state.clientincident.incidentForm
    );
    const [incidentForm, setIncidentForm] = useState(defaultIncidentForm);
    const [disableSection, setDisableSection] = useState(false);
    const [caseManagers, setCaseManagers] = useState([]);
    const [assignData, setAssignData] = useState([]);
    const [imgSrc, setImgSrc] = useState("");
    const [blob, setBlob] = useState("");

    const mergeProfileData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        const fetchDataandSetData = async () => {
            if (ClientID) {
                const masterData = await fetchData(
                    `/api/getClientMasterData/${ClientID}`,
                    window.location.href
                );
                const data = masterData.data[0];
                /* console.log("Client Data", data); */

                const response = await fetchData(
                    `/api/getClientDetailsAddressData/${ClientID}`,
                    window.location.href
                );
                const data1 = response.data[0];
                /* console.log("Client Data", response); */

                const formdata2 = await fetchData(
                    "/api/getActiveWorkerMasterData",
                    window.location.href
                );

                const caseManagersData1 = await fetchData(
                    `/api/getUserByUserGroup/Team Lead`,
                    window.location.href
                );

                const caseManagersData2 = await fetchData(
                    `/api/getUserByUserGroup/Rostering Manager`,
                    window.location.href
                );

                setCaseManagers([...caseManagersData1, ...caseManagersData2]);
                setAssignData(formdata2.data);

                const incidentID = Date.now().toString().slice(-6);

                setIncidentForm((prevState) => ({
                    ...prevState,
                    IncidentID: incidentID,
                    ClientID: ClientID,
                    FirstName: data.FirstName,
                    LastName: data.LastName,
                    Phone: data.Phone,
                    State: data.State,
                    PostCode: data.PostCode,
                    Address: data.AddressLine1,
                }));
            } else {
                console.log("ID not available");
            }
        };

        fetchProfilePicUrl(`rampup/logos/incidents/logo.jpg`);

        fetchDataandSetData();
        fetchUserRoles("m_cprofile", "Client_Profile_Incident", setDisableSection);
    }, [ClientID]);

    const handleChange = (event) => {
        const {id, value, type, checked} = event.target;
        const newValue = type === "checkbox" ? checked : value;

        setIncidentForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: newValue};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    const clearForm = () => {
        setOutput("");
        setIncidentForm(defaultIncidentForm);
    };

    const generateFolderPath = (company, incidentType, filename) => {
        return `${company}/client/${ClientID}/incidents/${incidentType}/${filename}`;
    };

    const fetchProfilePicUrl = async (FolderPath) => {
        const response = await fetchData(
            `/api/getS3Data/${FolderPath}`,
            window.location.href
        );

        const {dataURL} = response;

        if (!dataURL) {
            console.log("Failed to get Presigned Url");
            return;
        }

        const fileResponse = await fetch(dataURL);

        if (!fileResponse.ok) {
            console.error("Error while fetching file: ");
        }

        const fileBlob = await fileResponse.blob();
        setBlob(fileBlob);
        const fileUrl = URL.createObjectURL(fileBlob);
        setImgSrc(fileUrl);
        console.log("File URL: ", fileUrl);
    };

    const generatePDF = async (incidentForm) => {
        const doc = new jsPDF();

        if (!imgSrc) {
            console.log("Image URL Absent");
            return;
        }

        try {
            // Fetch the image from the URL
            const response = await fetch(imgSrc);
            if (!response.ok) throw new Error("Failed to fetch image");

            // Convert the fetched image to a Blob
            const imageBlob = await response.blob();
            console.log("ImageBlob:", imageBlob);

            // Convert Blob to Base64 using FileReader
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(imageBlob);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
            });

            const format = base64data.startsWith("data:image/png") ? "PNG" : "JPEG";
            console.log(format);
            console.log(base64data);

            // Add the image to the PDF
            doc.addImage(base64data, format, 10, 10, 40, 40);
        } catch (error) {
            console.log("Error adding image: ", error);
        }

        // Add the heading
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Incident Form", 80, 40); // Adjust position as needed

        // Reset font size for the rest of the text content
        doc.setFontSize(12);

        // Add incident details - Adjust each line's y-coordinate as needed
        let yPosition = 60; // Start position
        const lineHeight = 10; // Space between lines
        const fields = [
            "IncidentID", "ClientID", "FirstName", "LastName", "AdditionalInfo",
            "Address", "PostCode", "Phone", "Incident", "IncidentRelatesTo",
            "IncidentDate", "TimeOfIncidentDate", "LocationOfIncident",
            "TypeOfIncident", "DetailsOfIncident", "DetailsOfInjury",
            "CircumstancesTriggers", "RestrictivePracticesUsed",
            "DescriptionOfRestrictivePractice", "SuggestionsToPreventIncident",
            "ImmediateActionTaken", "OutcomeOfImmediateAction",
            "PersonReportingIncident", "HazardRiskRelatesTo", "DateOfHazardRisk",
            "TypeOfHazardRisk", "DetailsOfHazardRisk", "ImmediateActionTakenHazard",
            "SuggestionsToRemoveHazard", "AdditionalInformation",
            "PersonReportingHazardRisk", "Priority", "Category", "Note",
            "AssignTo", "LinkToWorker", "IncidentStatus", "NoteDate",
            "RemindDate", "IsReportable", "HourReportSubmitted24",
            "DayReportSubmitted5"
        ];

        fields.forEach((field) => {
            const text = `${field.replace(/([A-Z])/g, " $1")}: ${incidentForm[field] || ""}`;
            doc.text(text, 10, yPosition);
            yPosition += lineHeight;

            // Add page if content exceeds page height
            if (yPosition > 290) {
                doc.addPage();
                yPosition = 20; // Reset position on new page
            }
        });

        // To test, save the PDF directly
        //doc.save("incident_form_test.pdf");

        // Optionally, return as Blob if needed
        return doc.output("blob");
    };

    const handleSaveButton = async () => {
        setIsSubmitting(true);
        try {
            if (!file) {
                setOutput("Please select a file.");
                setIsSubmitting(false);
                return;
            }

            const company = process.env.NEXT_PUBLIC_COMPANY; // Replace with logic to get company name
            const incidentType = incidentForm.AccidentType;
            const fileName = encodeURIComponent(file.name);

            const pdfBlob = await generatePDF(incidentForm);
            const pdfFileName = `incident_${incidentForm.ClientID || "NA"}.pdf`;

            const FolderPath = generateFolderPath(company, incidentType, fileName);
            const PDFPath = generateFolderPath(company, incidentType, pdfFileName);

            const parts = FolderPath.split("/");
            const FileNameforDB = parts.pop();
            const folderforDB = parts.join("/");

            const fileResponse = await postData("/api/postS3Data", {
                FolderPath,
            });

            const pdfResponse = await postData("/api/postS3Data", {
                FolderPath: PDFPath,
            });

            const {uploadURL: fileUploadUrl} = fileResponse;
            const {uploadURL: pdfUploadUrl} = pdfResponse;

            if (!fileUploadUrl || !pdfUploadUrl) {
                setOutput("Failed to get pre-signed URL.");
                setIsSubmitting(false);
                return;
            }

            const uploadFileRes = await fetch(fileUploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            const uploadPDFRes = await fetch(pdfUploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/pdf",
                },
                body: pdfBlob,
            });

            if (uploadFileRes.ok && uploadPDFRes.ok) {
                setOutput("File uploaded successfully!");
                const combinedData = {
                    ...incidentForm,
                    Folder: folderforDB,
                    Bucket: "moscaresolutions",
                    File: FileNameforDB,
                };

                const insertResponse = await postData(
                    `/api/insertClientIncidentData`,
                    combinedData,
                    window.location.href
                );

                console.log(insertResponse);
                setOutput("Client Incident Added");
                alert("Client Incident Added");
            } else {
                setOutput("File upload failed.");
                alert("File upload failed");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client incident");
            alert("An error occurred while adding client incident");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackButton = () => {
        router.push(`/client/profile/update/${ClientID}`);
    };

    // if (loading) {
    //     return (
    //         <div>
    //             <h3>Loading...</h3>
    //         </div>
    //     );
    // }

    return (
        <div>
            {/*<Navbar />*/}
            <div
                style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <Container className={styles.MainContainer}>
                    <div style={{padding: "20px"}}>
                        {/* <SaveDelete
              saveOnClick={handleSaveButton}
              disabled={disableSection}
            /> */}

                        <Row className="mb-3" style={{marginBottom: "1rem"}}>
                            <Col>
                                <InputField
                                    onChange={handleChange}
                                    id="IncidentID"
                                    label="Incident ID"
                                    value={incidentForm.IncidentID}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    onChange={handleChange}
                                    id="ClientID"
                                    label="Client ID"
                                    value={incidentForm.ClientID}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="First Name"
                                    id="FirstName"
                                    onChange={handleChange}
                                    value={incidentForm.FirstName}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Last Name"
                                    id="LastName"
                                    onChange={handleChange}
                                    value={incidentForm.LastName}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="AdditionalInfo"
                                    label="Additional Info"
                                    value={incidentForm.AdditionalInfo}
                                    type={"textarea"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3" style={{marginBottom: "1rem"}}>
                            <Col>
                                <InputField
                                    onChange={handleChange}
                                    id="Address"
                                    label="Address"
                                    value={incidentForm.Address}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    onChange={handleChange}
                                    id="State"
                                    label="state"
                                    value={incidentForm.State}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="PostCode"
                                    onChange={handleChange}
                                    id="PostCode"
                                    value={incidentForm.PostCode}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Phone"
                                    onChange={handleChange}
                                    id="Phone"
                                    value={incidentForm.Phone}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="AccidentType"
                                    type="select"
                                    label="Please Select Type"
                                    value={incidentForm.AccidentType}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={[
                                        {label: "Incident", value: "Incident"},
                                        {label: "Hazard/Risk", value: "Hazard/Risk"},
                                        {label: "None", value: ""},
                                    ]}
                                />
                            </Col>
                        </Row>

                        {incidentForm.AccidentType === "Incident" ? (
                            <Col>
                                <Row>
                                    <Col>
                                        <InputField
                                            id="IncidentRelateTo"
                                            label="Incident Relates To"
                                            value={incidentForm.IncidentRelateTo}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {value: "Client", label: "Client"},
                                                {value: "Contractor", label: "Contractor"},
                                                {value: "Employee", label: "Employee"},
                                                {value: "Visitor", label: "Visitor"},
                                                {value: "Volunteer", label: "Volunteer"},
                                            ]}
                                        />
                                    </Col>
                                    <Col>
                                        <InputField
                                            type="date"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            id="IncidentDate"
                                            label="Incident Date"
                                            value={incidentForm.IncidentDate}
                                        />
                                    </Col>
                                    <Col>
                                        <InputField
                                            type="time"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label="Time of Incident Date (if known)"
                                            id="IncidentTime"
                                            value={incidentForm.IncidentTime}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="IncidentLocation"
                                            label="Location of Incident"
                                            value={incidentForm.IncidentLocation}
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            label="Type of Incident:"
                                            id="IncidentType"
                                            value={incidentForm.IncidentType}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value: "Abuse (e.g. financial, physical, rights)",
                                                    label: "Abuse (e.g. financial, physical, rights)",
                                                },
                                                {
                                                    value:
                                                        "Behavioural (e.g. verbal abuse, inappropriate sexual behaviour)",
                                                    label:
                                                        "Behavioural (e.g. verbal abuse, inappropriate sexual behaviour)",
                                                },
                                                {value: "Fall", label: "Fall"},
                                                {value: "Medical Episode", label: "Medical Episode"},
                                                {
                                                    value: "Missing Items / Theft",
                                                    label: "Missing Items / Theft",
                                                },
                                                {
                                                    value:
                                                        "Near Miss (Client has left usual baseline behaviour)",
                                                    label:
                                                        "Near Miss (Client has left usual baseline behaviour)",
                                                },
                                                {
                                                    value:
                                                        "Category 1 (Hospitalisation, major injury/ property damage, police involved)",
                                                    label:
                                                        "Category 1 (Hospitalisation, major injury/ property damage, police involved)",
                                                },
                                                {
                                                    value:
                                                        "Category 2 (Hitting, Self-harm, property damage, requiring first aid)",
                                                    label:
                                                        "Category 2 (Hitting, Self-harm, property damage, requiring first aid)",
                                                },
                                                {
                                                    value:
                                                        "Category 3 (Spitting, throwing, minor injury no first aid required)",
                                                    label:
                                                        "Category 3 (Spitting, throwing, minor injury no first aid required)",
                                                },
                                                {
                                                    value:
                                                        "Infectious material, body or hazardous substance",
                                                    label:
                                                        "Infectious material, body or hazardous substance",
                                                },
                                                {value: "Other", label: "Other"},
                                            ]}
                                        />
                                    </Col>
                                </Row>

                                <Row style={{margin: "1rem 0"}}>
                                    <Col>
                                        <InputField
                                            id="IncidentDetail"
                                            label="Details of Incident"
                                            value={incidentForm.IncidentDetail}
                                            type="textarea"
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="InjuryDetail"
                                            label="Details of Injury"
                                            value={incidentForm.InjuryDetail}
                                            type="textarea"
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="IncidentCircumstance"
                                            label="What were the circumstances/triggers leading up to the incident?"
                                            value={incidentForm.IncidentCircumstance}
                                            type="textarea"
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="IncidentRestrictivePractice"
                                            label="Were Restrictive Practices used?"
                                            value={incidentForm.IncidentRestrictivePractice}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value: "Chemical Restraint (mediaction)",
                                                    label: "Chemical Restraint (mediaction)",
                                                },
                                                {
                                                    value: "Physical Restraint (MAPA / MAYBO)",
                                                    label: "Physical Restraint (MAPA / MAYBO)",
                                                },
                                                {value: "Meachanical", label: "Meachanical"},
                                                {value: "Environmental", label: "Environmental"},
                                                {value: "Seclusion", label: "Seclusion"},
                                                {value: "Other", label: "Other"},
                                            ]}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="RestrictivePracticeUse"
                                            label="If used, describe how the Restrictive Practice was used"
                                            value={incidentForm.RestrictivePracticeUse}
                                            type="textarea"
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>

                                <Row style={{margin: "1rem 0"}}>
                                    <Col>
                                        <InputField
                                            id="IncidentSuggestion"
                                            label="Suggestions to further prevent this incident from occurring?"
                                            value={incidentForm.IncidentSuggestion}
                                            type="textarea"
                                            disabled={disableSection}
                                            onChange={handleChange}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="IncidentImmediateAction"
                                            label=" Immediate Action Taken:"
                                            value={incidentForm.IncidentImmediateAction}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value: "Contacted Office",
                                                    label: "Contacted Office",
                                                },
                                                {
                                                    value: "Applied First Aid",
                                                    label: "Applied First Aid",
                                                },
                                                {
                                                    value: "Called Emergency Services for Assistance",
                                                    label: "Called Emergency Services for Assistance",
                                                },
                                                {
                                                    value: "Contacted Next of Kin / Primary Contact",
                                                    label: "Contacted Next of Kin / Primary Contact",
                                                },
                                                {
                                                    value: "Person Requested No Action Taken",
                                                    label: "Person Requested No Action Taken",
                                                },
                                            ]}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="IncidentOutcome"
                                            label="Outcome of the Immediate Action Taken:"
                                            value={incidentForm.IncidentOutcome}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value:
                                                        "Next of Kin / Primary Contact to attend to person",
                                                    label:
                                                        "Next of Kin / Primary Contact to attend to person",
                                                },
                                                {
                                                    value: "Person declines further assistance",
                                                    label: "Person declines further assistance",
                                                },
                                                {
                                                    value: "Person transferred to hospital",
                                                    label: "Person transferred to hospital",
                                                },
                                                {value: "Other", label: "Other"},
                                            ]}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label="Person Reporting Incident"
                                            id="IncidentReportedBy"
                                            value={incidentForm.IncidentReportedBy}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        ) : (
                            <div></div>
                        )}

                        {incidentForm.AccidentType === "Hazard/Risk" ? (
                            <Col>
                                <Row>
                                    <Col>
                                        <InputField
                                            id="HazardRelateTo"
                                            type="multiple"
                                            label="Hazard Risk Relates To:"
                                            value={incidentForm.HazardRelateTo}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {value: "Client", label: "Client"},
                                                {value: "Contractor", label: "Contractor"},
                                                {value: "Employee", label: "Employee"},
                                                {value: "Visitor", label: "Visitor"},
                                                {value: "Volunteer", label: "Volunteer"},
                                            ]}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            type="date"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label="Date of Hazard Risk"
                                            id="HazardDate"
                                            value={incidentForm.HazardDate}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="HazardType"
                                            type="multiple"
                                            label="Type of Hazard Risk: "
                                            value={incidentForm.HazardType}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value:
                                                        "Condition of Home (e.g. clutter, unsafe flooring)",
                                                    label:
                                                        "Condition of Home (e.g. clutter, unsafe flooring)",
                                                },
                                                {value: "COVID", label: "COVID"},
                                                {
                                                    value:
                                                        "Electrical Safety (e.g. frayed electrical cords, over-loaded power points, damaged electricalswitches):",
                                                    label:
                                                        "Electrical Safety (e.g. frayed electrical cords, over-loaded power points, damaged electricalswitches):",
                                                },
                                                {
                                                    value: "Equipment (e.g. broken walker, office chair)",
                                                    label: "Equipment (e.g. broken walker, office chair)",
                                                },
                                                {
                                                    value: "Infection Risk (e.g. dog urinating inside)",
                                                    label: "Infection Risk (e.g. dog urinating inside)",
                                                },
                                                {
                                                    value:
                                                        "Safety (e.g. snake, fire hazard, poor external lighting)",
                                                    label:
                                                        "Safety (e.g. snake, fire hazard, poor external lighting)",
                                                },
                                                {
                                                    value:
                                                        "Slip / Trip (e.g. mat on floor, uneven or damaged flooring)",
                                                    label:
                                                        "Slip / Trip (e.g. mat on floor, uneven or damaged flooring)",
                                                },
                                                {value: "Other", label: "Other"},
                                            ]}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            id="HazardDetail"
                                            label="Details of Hazard Risk:"
                                            value={incidentForm.HazardDetail}
                                            onChange={handleChange}
                                            disabled={disableSection}
                                        />
                                    </Col>
                                </Row>

                                <Row style={{margin: "1rem 0"}}>
                                    <Col>
                                        <InputField
                                            id="HazardAction"
                                            label="Immediate Action Taken: "
                                            value={incidentForm.HazardAction}
                                            type="multiple"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            options={[
                                                {
                                                    value: "Contacted Office",
                                                    label: "Contacted Office",
                                                },
                                                {
                                                    value: "Contacted Next of Kin / Primary Contact",
                                                    label: "Contacted Next of Kin / Primary Contact",
                                                },
                                                {value: "Hazard Removed", label: "Hazard Removed"},
                                                {value: "Other", label: "Other"},
                                            ]}
                                        />
                                    </Col>
                                    <Col>
                                        <InputField
                                            type="textarea"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label="Suggestions to remove the Hazard or risk identified?"
                                            id="HAzardSuggestion"
                                            value={incidentForm.HAzardSuggestion}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            type="textarea"
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label=" Additional Information if Required:"
                                            id="HazardAdditionalInfo"
                                            value={incidentForm.HazardAdditionalInfo}
                                        />
                                    </Col>

                                    <Col>
                                        <InputField
                                            onChange={handleChange}
                                            disabled={disableSection}
                                            label="Person Reporting Hazard/Risk"
                                            id="HazardReportedBy"
                                            value={incidentForm.HazardReportedBy}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        ) : (
                            <div></div>
                        )}

                        {incidentForm.AccidentType === "None" ? <div></div> : <div></div>}

                        <Row className="mb-3" style={{marginBottom: "1rem"}}>
                            <Col>
                                <InputField
                                    id="Priority"
                                    label="Priority:"
                                    value={incidentForm.Priority}
                                    type="select"
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={[
                                        {value: "Low", label: "Low"},
                                        {value: "Medium", label: "Medium"},
                                        {value: "High", label: "High"},
                                        {value: "Urgent", label: "Urgent"},
                                    ]}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="Category"
                                    label="Category:"
                                    value={incidentForm.Category}
                                    type={"select"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={[
                                        {value: "Low", label: "Low"},
                                        {value: "Medium", label: "Medium"},
                                        {value: "High", label: "High"},
                                        {value: "Urgent", label: "Urgent"},
                                    ]}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="Note"
                                    label="Note:"
                                    value={incidentForm.Note}
                                    type="textarea"
                                    disabled={!incidentForm.EditNote || disableSection}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col className="checkbox">
                                <Checkbox
                                    id="EditNote"
                                    checked={incidentForm.EditNote}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    name="checkbox"
                                />
                                Edit Note
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <InputField
                                    id="AssignedTo"
                                    label="Assign To:"
                                    value={incidentForm.AssignedTo}
                                    type={"select"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={caseManagers.map((form) => ({
                                        value: form.FirstName,
                                        label: form.FirstName,
                                    }))}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="LinkToWorker"
                                    label="Link To Worker:"
                                    value={incidentForm.LinkToWorker}
                                    type={"select"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={assignData.map((form) => ({
                                        value: form.FirstName,
                                        label: form.FirstName,
                                    }))}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="IncidentStatus"
                                    label="Incident Status: "
                                    value={incidentForm.IncidentStatus}
                                    type={"select"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    options={[
                                        {value: "Low", label: "Low"},
                                        {value: "Medium", label: "Medium"},
                                        {value: "High", label: "High"},
                                        {value: "Urgent", label: "Urgent"},
                                    ]}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    type="date"
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    label="Note Date"
                                    id="NoteDate"
                                    value={incidentForm.NoteDate}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    type="date"
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    label="Remind Date"
                                    id="RemindOn"
                                    value={incidentForm.RemindOn}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col style={{fontSize: "14px"}}>
                                <Checkbox
                                    checked={incidentForm.isReportable}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    value={incidentForm.isReportable}
                                    id="isReportable"
                                />
                                is Reportable
                            </Col>
                            <Col style={{fontSize: "14px"}}>
                                <Checkbox
                                    checked={incidentForm.TwentyfourHrSubmitted}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    id="TwentyfourHrSubmitted"
                                    value={incidentForm.TwentyfourHrSubmitted}
                                />
                                24 - Hour Report Submitted
                            </Col>
                            <Col style={{fontSize: "14px"}}>
                                <Checkbox
                                    checked={incidentForm.FiveHrSubmitted}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    value={incidentForm.FiveHrSubmitted}
                                    id="FiveHrSubmitted"
                                />
                                5 - Day Report Submitted
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col>
                            {/* <MButton
                style={{ margin: "10px" }}
                label="Upload Files"
                variant="contained"
                color="secondary"
                type={"file"}
                disabled={disableSection}
                endIcon={<ArrowDropDown />}
                size="medium"
              /> */}
                            <Input type="file" onChange={handleFileChange}/>
                            <MButton
                                style={{margin: "10px"}}
                                label="Back"
                                disabled={disableSection}
                                variant="contained"
                                color="error"
                                onClick={handleBackButton}
                                size="small"
                            />
                        </Col>
                        <MButton
                            style={{margin: "10px"}}
                            label="Save"
                            disabled={disableSection}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleSaveButton}
                        />
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default NewIncident;
