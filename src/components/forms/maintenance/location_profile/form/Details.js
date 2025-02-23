// import React, { useContext, useEffect, useState } from "react";
import {Box, Card, Checkbox} from "@mui/material";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import MButton from "@/components/widgets/MaterialButton";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData,} from "@/redux/maintainance/locationdetailSlice";
import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import {logEvent} from "firebase/analytics";
import {analytics} from "../../../../../config/firebaseConfig";
import SubHeader from "@/components/widgets/SubHeader";
import styles from "@/styles/style.module.css";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";

function Details({setDetailsEdit, setSelectedComponent}) {
    const router = useRouter();
    const {UpdateID} = router.query;
    const dispatch = useDispatch();
    const defaultDetailsForm = useSelector(
        (state) => state.locationdetail.detailsForm
    );
    // const {colors, loading} = useContext(ColorContext);
    const [modal, setModal] = useState(false);
    const [prompt, setPrompt] = useState(false);
    const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);
    const [disableSection, setDisableSection] = useState(false);
    const [facilityStatus, setFacilityStatus] = useState([]);
    const [facilityType, setFacilityType] = useState([]);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleModalCancel = () => {
        setModal(false);
    };

    // If their is any value in db table then it return that else it will written default value
    const mergeDetailsData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] == "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        try {
            const [
                generalDetails,
                WorkHealthSafety,
                OtherDeatils,
                facilityType,
                facilityStatus
            ] = await Promise.all([
                fetchData(`/api/getLocationPGeneralDetailsDataByID/${UpdateID}`, window.location.href),
                fetchData(`/api/getLocationPGeneralWorkDataByID/${UpdateID}`, window.location.href),
                fetchData(`/api/getLocationPGeneralOtherDetailsDataByID/${UpdateID}`, window.location.href),
                fetchData(`/api/getFacilityType`, window.location.href),
                fetchData(`/api/getFacilityStatus`, window.location.href)
            ]);

            setFacilityType(facilityType.data);
            setFacilityStatus(facilityStatus.data);

            console.log("General details:", generalDetails);
            console.log("Work Health Safety:", WorkHealthSafety);
            console.log("OtherDetails:", OtherDeatils);

            const fetchedDetailsForm = {
                // general data
                FacilityStatus: generalDetails.data[0]?.FacilityStatus,
                FacilityType: generalDetails.data[0]?.FacilityType,
                Staff: generalDetails.data[0]?.Staff,
                Client: generalDetails.data[0]?.Client,

                // Work Health and Safety
                WorkHealthSafetyCheck: WorkHealthSafety.data[0]?.WorkHealthSafetyCheck,
                OHSNote: WorkHealthSafety.data[0]?.OHSNote,
                SafetyDevice: WorkHealthSafety.data[0]?.SafetyDevice,

                // OtherDetails
                AlertNote: OtherDeatils.data[0]?.AlertNote,
                PopUpProfile: OtherDeatils.data[0]?.PopUpProfile,
                RosterAlertNote: OtherDeatils.data[0]?.RosterAlertNote,
                PopUpRoster: OtherDeatils.data[0]?.PopUpRoster,
                FinancialLegalStatus: OtherDeatils.data[0]?.FinancialLegalStatus,
                Comments: OtherDeatils.data[0]?.Comments,
            };

            const mergedDetailsForm = mergeDetailsData(
                defaultDetailsForm,
                fetchedDetailsForm
            );

            setDetailsForm(mergedDetailsForm); // stores merged value
            console.log(fetchedDetailsForm);
            console.log(mergedDetailsForm);
        } catch (error) {
            console.error("Error fetching data in parallel:", error);
            // Add appropriate error handling here (e.g., set error state, show notification)
        }
    };

    const handleSaveButton = () => {
        console.log("Details form:", detailsForm);

        // detailsForm
        const data1 = {
            FacilityStatus: detailsForm.FacilityStatus,
            FacilityType: detailsForm.FacilityType,
            Staff: detailsForm.Staff,
            Client: detailsForm.Client,
        };

        // Work Health and Safety
        const data2 = {
            WorkHealthSafetyCheck: detailsForm.WorkHealthSafetyCheck,
            OHSNote: detailsForm.OHSNote,
            SafetyDevice: detailsForm.SafetyDevice,
        };

        //OtherDetails
        const data3 = {
            AlertNote: detailsForm.AlertNote,
            PopUpProfile: detailsForm.PopUpProfile,
            RosterAlertNote: detailsForm.RosterAlertNote,
            PopUpRoster: detailsForm.PopUpRoster,
            Comments: detailsForm.Comments,
            FinancialLegalStatus: detailsForm.FinancialLegalStatus,
        };

        putData(
            `/api/upsertLocationPGeneralDetailsData/${UpdateID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertLocationPGeneralWorkData/${UpdateID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/upsertLocationPGeneralOtherDetailsData/${UpdateID}`,
            {
                data: data3,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        dispatch(deleteData());
        fetchDataAsync();
        setDetailsEdit(false);
        addValidationMessage("Details Saved Successfully", "success");
        // you should keep one blank space after the details
        setSelectedComponent("Details ");
        logEvent(analytics, "page_view", {
            form_name: "Location_Details",
            event: "Location_Details data Saved",
        });
    };

    const handleChange = (event) => {
        setDetailsEdit(true);
        // setSelectedComponent("Details *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setDetailsForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (UpdateID) {
            fetchDataAsync();
        } else {
            console.log("UpdateID not found");
        }

        fetchUserRoles(
            "m_location_profile",
            "Maintainence_LocationProfile_GeneralDetails",
            setDisableSection
        );
    }, [UpdateID]);

    return (
        <div
            style={{
                fontSize: "14px",
                marginInline: "1.5rem",
            }}
        >
            {/* <div
        style={{
          position: "relative",
          left: "-11rem",
          top: "-4.6rem",
          width: "10%",
        }}
      >
        <MButton
          variant="contained"
          onClick={handleSaveButton}
          label={"Save"}
          size={"small"}
          disabled={disableSection}
        />
      </div> */}
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
                isOpen={modal}
                contentLabel="Add Leave"
            >
                <ModalHeader title="Add Leave" onCloseButtonClick={handleModalCancel}/>
                <br/>

                <label>Are you sure you want to add leave for isolation?</label>
                <br/>
                <br/>
                <div style={{textAlign: "right"}}>
                    <Button
                        label={"Yes"}
                        backgroundColor="#dc3545"
                        onClick={() => setModal(false)}
                        disabled={disableSection}
                    />
                    <Button
                        label={"No"}
                        backgroundColor="#1976d2"
                        onClick={() => setModal(false)}
                        disabled={disableSection}
                    />
                </div>

                <br/>
            </Modal>

            <Card
                style={{
                    backgroundColor: "#f9f9f9",
                    // margin: "1rem",
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    width: "80vw",
                    padding: "1rem 2rem",
                    border: "1px solid"
                }}
            >
                <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

                <Box sx={{marginBottom: "1rem"}}>
                    <SubHeader title={"Details"}/>
                </Box>
                {/* <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}> */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "3rem",
                        alignItems: "center",
                        border: "1px solid black",
                        padding: "1rem",
                        borderRadius: "10px",
                        marginBottom: "1rem",
                    }}
                >
                    <Box sx={{display: "flex", flexDirection: "column"}}>
            <span style={{fontSize: "1rem", fontWeight: "600"}}>
              General Details
            </span>
                        <Box
                            style={{
                                marginTop: "1rem",
                                display: "flex",
                                flexDirection: "row",
                                gap: "1rem",
                            }}
                        >
                            <Box sx={{width: "350px"}}>
                                <InputField
                                    id={"FacilityStatus"}
                                    label={"Facility Status"}
                                    value={detailsForm.FacilityStatus}
                                    type={"select"}
                                    onChange={handleChange}
                                    options={[{label: "Active", value: "active"}]} // Add dynamic options
                                />
                            </Box>
                            <Box sx={{width: "350px"}}>
                                <InputField
                                    id={"FacilityType"}
                                    label={"Facility Type"}
                                    value={detailsForm.FacilityType}
                                    type={"select"}
                                    onChange={handleChange}
                                    options={[{label: "Type A", value: "typeA"}]} // Add dynamic options
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        sx={{marginTop: "1rem", display: "flex", flexDirection: "row"}}
                    >
                        <Box
                            sx={{display: "flex", flexDirection: "column", width: "50%"}}
                        >
                            <p style={{fontWeight: "600"}}>Client Staff Ratio:</p>
                            <Box sx={{display: "flex", flexDirection: "row", gap: "1rem"}}>
                                <Box sx={{width: "350px"}}>
                                    <InputField
                                        id={"Staff"}
                                        label={"Staff"}
                                        value={detailsForm.Staff}
                                        onChange={handleChange}
                                    />
                                </Box>
                                <Box sx={{width: "350px"}}>
                                    <InputField
                                        id={"Client"}
                                        label={"Client"}
                                        value={detailsForm.Client}
                                        onChange={handleChange}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        border: "1px solid black",
                        borderRadius: "10px",
                        marginBottom: "1rem",

                    }}
                >
                    <Row>
                        <Col
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "1rem",
                                marginTop: "1rem",
                                padding: "0 1rem"
                            }}
                        >
                            <InputField
                                type={"textarea"}
                                label={"Comments"}
                                id={"Comments"}
                                value={detailsForm.Comments}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "1rem",
                                marginTop: "1rem"
                            }}
                        >
                            <InputField
                                type={"textarea"}
                                label={"Financial and Legal Status"}
                                id={"FinancialLegalStatus"}
                                value={detailsForm.FinancialLegalStatus}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                </Box>

                {/* Work health and safety */}
                <Box sx={{
                    border: "1px solid black",
                    borderRadius: "10px",
                    marginBottom: "1rem",
                    padding: "0.5rem 1rem 1rem 0.6rem"
                }}>
                    <div style={{padding: "0.5rem"}}>
        <span style={{fontSize: "1rem", fontWeight: "600",}}>
            Work health and safety
            </span>
                    </div>
                    <Row>
                        <Col md={4}>
                            <InputField
                                type={"textarea"}
                                label={"OHSNote"}
                                id={"OHSNote"}
                                value={detailsForm.OHSNote}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col md={4}>
                            <InputField
                                type={"textarea"}
                                label={"Safety Device"}
                                id={"SafetyDevice"}
                                value={detailsForm.SafetyDevice}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={4} className="mt-4">
                            <Checkbox
                                name="checkbox"
                                id={"WorkHealthSafetyCheck"}
                                checked={detailsForm.WorkHealthSafetyCheck}
                                onChange={handleChange}
                            />
                            Work Health and Safety Check
                        </Col>

                    </Row>
                </Box>

                {/* Alerts */}
                <Box sx={{border: "1px solid black", borderRadius: "10px", paddingBottom: "2rem",}}>
                    <div style={{padding: "1rem"}}>
        <span style={{fontSize: "1rem", fontWeight: "600",}}>
            Alerts
            </span>
                    </div>

                    <Box sx={{display: "flex", flexDirection: "row", gap: "1.5rem"}}>
                        <Box sx={{display: "flex", flexDirection: "column", marginLeft: "1rem"}}>
                            <Box sx={{width: "600px",}}>
                                <InputField
                                    type={"textarea"}
                                    label={"Alert Note"}
                                    id={"AlertNote"}
                                    sx={{marginBottom: "1rem"}}
                                    value={detailsForm.AlertNote}
                                    onChange={handleChange}
                                />

                            </Box>

                            <Box sx={{width: "600px", marginTop: "1rem"}}>
                                <InputField
                                    type={"textarea"}
                                    label={"Roster Alert Note"}
                                    id={"RosterAlertNote"}
                                    value={detailsForm.RosterAlertNote}
                                    onChange={handleChange}
                                />


                            </Box>
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                            <Box md={3} className='mt-4'>
                                <Checkbox
                                    name="checkbox"
                                    id={"PopUpProfile"}
                                    checked={detailsForm.PopUpProfile}
                                    onChange={handleChange}
                                />
                                Popup in profile
                            </Box>
                            <Box md={3}>
                                <Checkbox
                                    name="checkbox"
                                    id={"PopUpRoster"}
                                    checked={detailsForm.PopUpRoster}
                                    onChange={handleChange}
                                />
                                Popup in roster
                            </Box>
                        </Box>
                    </Box>
                    {/* </Row> */}
                </Box>
                {/* </div> */}
                {/* <Row
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <MAccordian
              summaryBgColor={"blue"}
              summary={"General Details"}
              disabled = {disableSection}
              details={
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <InputField
                    id={"FacilityStatus"}
                    label={"Facility Status"}
                    value={detailsForm.FacilityStatus}
                    type={"select"}
                    onChange={handleChange}
                    options={facilityStatus.map((form) => ({
                      label: form.ParamDesc,  
                      value: form.ParamValue,  
                    }))}
                  />
                  <InputField
                    id={"FacilityType"}
                    label={"Facility Type"}
                    value={detailsForm.FacilityType}
                    type={"select"}
                    onChange={handleChange}
                    options={facilityType.map((form) => ({
                      label: form.ParamDesc,  
                      value: form.ParamValue, 
                    }))}
                  />

                  <Row>
                    <p style={{ textAlign: "left" }}>Client Staff Ratio :</p>
                    <Col>
                      <InputField
                        type={"text"}
                        label={"Staff"}
                        id={"Staff"}
                        value={detailsForm.Staff}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col>
                      <InputField
                        type={"text"}
                        label={"Client"}
                        id={"Client"}
                        value={detailsForm.Client}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>

                </Col>
              }
            />
          </Col>

          <Col
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <MAccordian
              summaryBgColor={"blue"}
              summary={"Comments"}
              disabled = {disableSection}
              details={
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >

                  <InputField
                    type={"textarea"}
                    label={"Comments"}
                    id={"Comments"}
                    value={detailsForm.Comments}
                    onChange={handleChange}
                  />

                </Col>
              }
            />
          </Col>

          <Col
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <MAccordian
              summaryBgColor={"blue"}
              summary={"Financial and Legal Status"}
              disabled = {disableSection}
              details={
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <InputField
                    type={"textarea"}
                    label={"Financial and Legal Status"}
                    id={"FinancialLegalStatus"}
                    value={detailsForm.FinancialLegalStatus}
                    onChange={handleChange}
                  />

                </Col>
              }
            />

            <MAccordian
              summaryBgColor={"blue"}
              summary={"Work Health and Safety"}
              disabled = {disableSection}
              details={
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <div>
                    <Checkbox
                      name="checkbox"
                      id={"WorkHealthSafetyCheck"}
                      checked={detailsForm.WorkHealthSafetyCheck}
                      onChange={handleChange}
                    />
                    Work Health and Safety Check
                  </div>

                  <InputField
                    type={"textarea"}
                    label={"OHSNote"}
                    id={"OHSNote"}
                    value={detailsForm.OHSNote}
                    onChange={handleChange}
                  />

                  <InputField
                    type={"textarea"}
                    label={"Safety Device"}
                    id={"SafetyDevice"}
                    value={detailsForm.SafetyDevice}
                    onChange={handleChange}
                  />

                </Col>
              }
            />

            <MAccordian
              summaryBgColor={"blue"}
              summary={"Alerts"}
              disabled = {disableSection}
              details={
                <Col
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <InputField
                    type={"textarea"}
                    label={"Alert Note"}
                    id={"AlertNote"}
                    value={detailsForm.AlertNote}
                    onChange={handleChange}
                  />

                  <div>
                    <Checkbox
                      name="checkbox"
                      id={"PopUpProfile"}
                      checked={detailsForm.PopUpProfile}
                      onChange={handleChange}
                    />
                    Popup in profile
                  </div>

                  <InputField
                    type={"textarea"}
                    label={"Roster Alert Note"}
                    id={"RosterAlertNote"}
                    value={detailsForm.RosterAlertNote}
                    onChange={handleChange}
                  />

                  <div>
                    <Checkbox
                      name="checkbox"
                      id={"PopUpRoster"}
                      checked={detailsForm.PopUpRoster}
                      onChange={handleChange}
                    />
                    Popup in roster
                  </div>

                </Col>
              }
            />
          </Col>


        </Row> */}
                <div style={{marginTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <MButton
                        className={styles.maintenanceBtn}
                        variant="contained"
                        style={{
                            width: "200px",
                            backgroundColor: "blue",
                            mr: 1, mb: 1, fontSize: "12px",
                            "&:hover": {
                                backgroundColor: "blue", // Replace this with your desired hover color
                            },
                        }} size="small"
                        label="Save Details"
                        disabled={disableSection}
                        onClick={() => handleSaveButton()}
                    />
                </div>
            </Card>
        </div>
    );
}

export default Details;
