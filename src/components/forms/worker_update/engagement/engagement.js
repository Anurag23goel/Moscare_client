import React, {useEffect, useState} from "react";
import {Checkbox, Container} from "@mui/material";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/worker/engagementSlice";
import EngagementAward from "./engagementaward/engagmentaward";
import {useRouter} from "next/router";

function Engagement({setEngagementDetailsEdit, setSelectedComponent}) {
    const router = useRouter();
    const {WorkerID} = router.query;
    const dispatch = useDispatch();
    const defaultEngagementDetailsForm = useSelector(
        (state) => state.workerengagement.engagementForm
    );
    // const {colors, loading} = useContext(ColorContext);
    const [prompt, setPrompt] = useState(false);
    const [engagementForm, setEngagementForm] = useState(
        defaultEngagementDetailsForm
    );

    const [disableSection, setDisableSection] = useState(false);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // If their is any value in db table then it return that else it will written default value
    const mergeEngagementDetailsData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] == "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        const engagementDetails = await fetchData(
            `/api/getWorkerEngagementDetailsData/${WorkerID}`,
            window.location.href
        );

        const engagementEndedDetails = await fetchData(
            `/api/getWorkerEngagementEndedDetailsData/${WorkerID}`,
            window.location.href
        );

        console.log("Engagement details:", engagementDetails);
        console.log("Engagement Ended details:", engagementEndedDetails);

        const fetchedEngagementDetailsForm = {
            //engagement details
            startDate: engagementDetails.data[0]?.StartDate,
            endDate: engagementDetails.data[0]?.EndDate,
            probationDate: engagementDetails.data[0]?.ProbationDate,
            onHoldStartDate: engagementDetails.data[0]?.OnHoldStartDate,
            onHoldEndDate: engagementDetails.data[0]?.OnHoldEndDate,
            onholdReason: engagementDetails.data[0]?.OnholdReason,
            award: engagementDetails.data[0]?.Award,
            awardSector: engagementDetails.data[0]?.AwardSector,
            payPoint: engagementDetails.data[0]?.PayPoint,

            // engagement ended details
            hasResigned: engagementEndedDetails.data[0]?.HasResigned,
            canRehire: engagementEndedDetails.data[0]?.CanRehire,
            effectiveAsOf: engagementEndedDetails.data[0]?.EffectiveAsOf,
            keysReturned: engagementEndedDetails.data[0]?.KeysReturned,
            supportFileUpdated: engagementEndedDetails.data[0]?.SupportFileUpdated,
            payrollUpdated: engagementEndedDetails.data[0]?.PayrollUpdated,
            organisationNotified:
            engagementEndedDetails.data[0]?.OrganisationNotified,
            reason: engagementEndedDetails.data[0]?.Reason,
        };

        const mergeEngagementDetailsForm = mergeEngagementDetailsData(
            defaultEngagementDetailsForm,
            fetchedEngagementDetailsForm
        );

        setEngagementForm(mergeEngagementDetailsForm); // stores merged value
    };

    const handleSaveButton = () => {
        console.log("Details form:", engagementForm);

        // engagementDetailsForm
        const data1 = {
            StartDate: engagementForm.startDate,
            EndDate: engagementForm.endDate,
            ProbationDate: engagementForm.probationDate,
            OnHoldStartDate: engagementForm.onHoldStartDate,
            OnHoldEndDate: engagementForm.onHoldEndDate,
            OnholdReason: engagementForm.onholdReason,
            Award: engagementForm.award,
            AwardSector: engagementForm.awardSector,
            PayPoint: engagementForm.payPoint,
        };

        const data2 = {
            HasResigned: engagementForm.hasResigned,
            CanRehire: engagementForm.canRehire,
            EffectiveAsOf: engagementForm.effectiveAsOf,
            KeysReturned: engagementForm.keysReturned,
            SupportFileUpdated: engagementForm.supportFileUpdated,
            PayrollUpdated: engagementForm.payrollUpdated,
            OrganisationNotified: engagementForm.organisationNotified,
            Reason: engagementForm.reason,
        };

        putData(
            `/api/updateWorkerEngagementDetailsData/${WorkerID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        putData(
            `/api/updateWorkerEngagementEndedDetailsData/${WorkerID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        dispatch(deleteData());
        fetchDataAsync();
        setEngagementDetailsEdit(false);
        // you should keep one blank space after the Engagement Details
        setSelectedComponent("Engagement Details ");
    };

    const handleChange = (event) => {
        setEngagementDetailsEdit(true);
        setSelectedComponent("Engagement Details *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setEngagementForm((prevState) => {
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
        if (WorkerID) {
            fetchDataAsync();
        } else {
            console.log("WorkerID not found");
        }
        fetchUserRoles("m_wprofile", "Worker_Profile_Engagement", setDisableSection);
    }, [WorkerID]);

    return (
        <>
            <Container>
                <div
                    style={{
                        fontSize: "12px",
                        marginInline: "1rem",
                    }}
                >
                    <div
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
                        />
                    </div>

                    <div
                    >
                        <Row style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                        }}>
                            <Col style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }} sm={3}>
                                <MAccordian
                                    summaryBgColor={"blue"}
                                    summary={"Engagement Date"}
                                    disabled={disableSection}
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
                                                type={"date"}
                                                label={"Start Date"}
                                                id={"startDate"}
                                                value={engagementForm.startDate}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"End Date"}
                                                id={"endDate"}
                                                value={engagementForm.endDate}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Probation Date"}
                                                id={"probationDate"}
                                                value={engagementForm.probationDate}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    }
                                />
                            </Col>
                            <Col sm={3}>
                                <MAccordian
                                    summaryBgColor={"blue"}
                                    summary={"On-Hold"}
                                    disabled={disableSection}
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
                                                type={"date"}
                                                label={"Start Date"}
                                                id={"onHoldStartDate"}
                                                value={engagementForm.onHoldStartDate}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"End Date"}
                                                id={"onHoldEndDate"}
                                                value={engagementForm.onHoldEndDate}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"textarea"}
                                                label={"Reason"}
                                                id={"onholdReason"}
                                                value={engagementForm.onholdReason}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    }
                                />
                            </Col>
                            <Col sm={3}>
                                <MAccordian
                                    summaryBgColor={"blue"}
                                    summary={"Award Details"}
                                    disabled={disableSection}
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
                                                type={"select"}
                                                label={"Award"}
                                                id={"award"}
                                                value={engagementForm.award}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"select"}
                                                label={"Award Sector"}
                                                id={"awardSector"}
                                                value={engagementForm.award}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"select"}
                                                label={"Pay Point"}
                                                id={"payPoint"}
                                                value={engagementForm.payPoint}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    }
                                />
                            </Col>
                            <Col sm={3}>
                                <MAccordian
                                    summaryBgColor={"blue"}
                                    summary={"Engagement Ended Details"}
                                    disabled={disableSection}
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
                                                    id={"hasResigned"}
                                                    checked={engagementForm.hasResigned}
                                                    onChange={handleChange}
                                                />
                                                Has Resigned
                                            </div>
                                            <div>
                                                <Checkbox
                                                    name="checkbox"
                                                    id={"canRehire"}
                                                    checked={engagementForm.canRehire}
                                                    onChange={handleChange}
                                                />
                                                Can Rehire
                                            </div>
                                            <MButton
                                                style={{
                                                    margin: "10px 15px 10px 15px",
                                                    backgroundColor: "blue"
                                                }}
                                                label="Unallocate shifts from date"
                                                variant="contained"
                                                color="primary"
                                                disabled={disableSection}
                                                onClick={() => setModal(true)}
                                                size="small"
                                            />
                                            <MButton
                                                style={{
                                                    margin: "10px 15px 10px 15px",
                                                    backgroundColor: "blue"
                                                }}
                                                label="Transfer shifts to another worker"
                                                variant="contained"
                                                color="primary"
                                                disabled={disableSection}
                                                onClick={() => setModal(true)}
                                                size="small"
                                            />
                                            <MButton
                                                style={{
                                                    margin: "10px 15px 10px 15px",
                                                    backgroundColor: "blue"
                                                }}
                                                label="Remove from client preferences"
                                                variant="contained"
                                                color="primary"
                                                disabled={disableSection}
                                                onClick={() => setModal(true)}
                                                size="small"
                                            />
                                            <MButton
                                                style={{
                                                    margin: "10px 15px 10px 15px",
                                                    backgroundColor: "blue"
                                                }}
                                                label="Remove from chat groups"
                                                variant="contained"
                                                color="primary"
                                                disabled={disableSection}
                                                onClick={() => setModal(true)}
                                                size="small"
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Effective as of"}
                                                id={"effectiveAsOf"}
                                                value={engagementForm.effectiveAsOf}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Keys Returned"}
                                                id={"keysReturned"}
                                                value={engagementForm.keysReturned}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Support Worker File Updated"}
                                                id={"supportFileUpdated"}
                                                value={engagementForm.supportFileUpdated}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Payroll Updated"}
                                                id={"payrollUpdated"}
                                                value={engagementForm.PayrollUpdated}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"date"}
                                                label={"Organisation Notified"}
                                                id={"organisationNotified"}
                                                value={engagementForm.organisationNotified}
                                                onChange={handleChange}
                                            />
                                            <InputField
                                                type={"textarea"}
                                                label={"Reason"}
                                                id={"reason"}
                                                value={engagementForm.reason}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                    <EngagementAward WorkerID={WorkerID}/>
                </div>
            </Container>
        </>
    );
}

export default Engagement;
