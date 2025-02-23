import React, {useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Box, Card, Fade, Modal} from "@mui/material";
import {Col, Spinner} from "react-bootstrap";
import ColorContext from "@/contexts/ColorContext";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, postData, putData} from "@/utility/api_utility";
import ModalHeader from "@/components/widgets/ModalHeader";
import CHKMListingDataTable from "@/components/widgets/CHKMListingDataTable";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const Service = () => {
    const router = useRouter();
    const {metadata, dateRestrictions} = router.query;
    console.log("MetaData : ", metadata)

    const [serviceDataList, setServiceDataList] = useState([]);
    const [dateList, setDateList] = useState([]);

    useEffect(() => {
        if (metadata && dateRestrictions) {
            try {
                const dateDirect = JSON.parse(dateRestrictions);
                const serviceDirect = JSON.parse(metadata);
                console.log(dateDirect);
                console.log(serviceDirect);
                setServiceDataList(JSON.parse(metadata));
                setDateList(JSON.parse(dateRestrictions));
            } catch (error) {
                console.error("Failed to parse state:", error);
            }
        }
    }, [metadata, dateRestrictions]);

    const [detailsForm, setDetailsForm] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [serviceDescriptions, setServiceDescriptions] = useState([]);
    const [openServiceMapModal, setOpenServiceMapModal] = useState(false);
    const [servicesData, setServicesData] = useState([]);
    const [selectedServicesToInsert, setSelectedServicesToInsert] = useState([]);
    const [addServicesButtonDisabled, setAddServicesButtonDisabled] =
        useState(true);
    const [disableSection, setDisableSection] = useState(false);

    // const {colors, loading} = useContext(ColorContext);

    const handleInputChange = (index, field, value) => {
        const updatedForm = [...detailsForm];
        if (!updatedForm[index]) {
            updatedForm[index] = {};
        }
        updatedForm[index][field] = value;
        setDetailsForm(updatedForm);
    };

    const handleOnSave = async () => {
        const validationErrors = [];
        if (detailsForm.length === 0) {
            validationErrors.push(`Field cannot be empty`);
        }

        // Validate all date fields and other fields
        detailsForm.forEach((item, index) => {
            if (!item.StartDate) {
                validationErrors.push(`Start Date is missing for item ${index + 1}`);
            } else if (!dateValidation("StartDate", item.StartDate, index)) {
                validationErrors.push(`Invalid Start Date for item ${index + 1}`);
            }

            if (!item.EndDate) {
                validationErrors.push(`End Date is missing for item ${index + 1}`);
            } else if (!dateValidation("EndDate", item.EndDate, index)) {
                validationErrors.push(`Invalid End Date for item ${index + 1}`);
            }

            if (item.Budget == null || item.Budget < 0) {
                validationErrors.push(
                    `Budget must be a non-negative number for item ${index + 1}`
                );
            }

            if (item.BudgetHour == null || item.BudgetHour < 0) {
                validationErrors.push(
                    `Budget Hour must be a non-negative number for item ${index + 1}`
                );
            }
        });

        if (validationErrors.length > 0) {
            alert(`${validationErrors.join("\n")}`);
            return;
        }

        setIsLoading(true);
        const payload = detailsForm.map((item, index) => ({
            ServiceCode: serviceDataList[index].ServiceCode,
            AgreementCode: serviceDataList[index].AgreementCode,
            Description: serviceDataList[index].Description,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Budget: item.Budget,
            BudgetHour: item.BudgetHour,
        }));
        let dataParsed = await JSON.parse(metadata);

        dataParsed.forEach(async (item) => {
            const map = {
                AgreementCode: item.AgreementCode,
                ServiceCode: item.ServiceCode,
            };
            putData(
                "/api/insertClientAgreementServicesMap",
                map,
                window.location.href
            );
        });

        try {
            const response = await postData(
                "/api/postServiceBudget",
                payload,
                window.location.href
            );
            if (response.success) {
                alert("Data saved successfully!");
                router.push({
                    pathname: `/agreement/${serviceDataList[0].AgreementCode}`,
                });
            } else {
                alert("Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert("An error occurred while saving data.");
            router.push({
                pathname: `/agreement/${serviceDataList[0].AgreementCode}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const dateValidation = (field, value, index) => {
        if (!value) {
            alert(`${field} cannot be empty.`);
            handleInputChange(index, field, null);
            return false;
        }

        console.log(dateList);
        const startDateLimit = new Date(dateList.StartDate);
        const endDateLimit = new Date(dateList.EndDate);
        const selectedDate = new Date(value);

        const startDate = detailsForm[index]?.StartDate
            ? new Date(detailsForm[index].StartDate)
            : null;
        const endDate = detailsForm[index]?.EndDate
            ? new Date(detailsForm[index].EndDate)
            : null;

        if (field === "StartDate") {
            if (selectedDate < startDateLimit) {
                alert("Start Date is earlier than the agreement's Start Date.");
                handleInputChange(index, field, null);
                return false;
            } else if (endDate && selectedDate > endDate) {
                alert("Start Date cannot be later than the End Date.");
                handleInputChange(index, "EndDate", null);
                return false;
            }
        }

        if (field === "EndDate") {
            if (selectedDate > endDateLimit) {
                alert("End Date is later than the agreement's End Date.");
                handleInputChange(index, field, null);
                return false;
            } else if (startDate && selectedDate < startDate) {
                alert("End Date cannot be earlier than the Start Date.");
                handleInputChange(index, field, null);
                return false;
            }
        }

        return true;
    };

    const handleRowSelectionModelChange = (selectedIDs) => {
        console.log(selectedIDs);
        setSelectedServicesToInsert(selectedIDs);
        if (selectedIDs.length > 0) {
            setAddServicesButtonDisabled(false);
        } else {
            setAddServicesButtonDisabled(true);
        }
    };

    const handleAddServicesButtonClick = async () => {
        setIsLoading(true);
        if (servicesData.length === 0) {
            const response = await fetchData(
                "/api/getActiveServices",
                window.location.href
            );
            setServicesData(response.data);
        }
        setOpenServiceMapModal(true);
        setIsLoading(false);
    };

    const handleAddSelectedServices = () => {
        const mapdata = {current: []};

        console.log(servicesData);
        selectedServicesToInsert.forEach((id) => {
            const service = servicesData.find((service) => service.Service_ID === id);
            if (service) {
                const map = {
                    AgreementCode: service.Accounting_Code,
                    ServiceCode: service.Service_Code,
                    Description: service.Description,
                };
                mapdata.current.push(map);
            }
        });

        const updatedServiceDataList = [...serviceDataList, ...mapdata.current];

        console.log(updatedServiceDataList);
        setServiceDataList(updatedServiceDataList);
        setOpenServiceMapModal(false);

        // Force a re-render by updating the metadata
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
                metadata: JSON.stringify(updatedServiceDataList),
            },
        });
    };

    if (loading || isLoading) {
        return <Spinner/>;
    }

    // Group serviceDataList into columns of 3 items each, and then into rows of 4 columns each
    const rows = [];
    let currentRow = [];
    let currentCol = [];

    serviceDataList.forEach((item, index) => {
        currentCol.push(item);
        if (currentCol.length === 2 || index === serviceDataList.length - 1) {
            currentRow.push(currentCol);
            currentCol = [];
        }
        if (currentRow.length === 3 || index === serviceDataList.length - 1) {
            rows.push(currentRow);
            currentRow = [];
        }
    });

    return (
        <div style={{fontSize: "14px", marginInline: "1rem"}}>
            {/*<DashMenu />*/}
            <Card
                style={{
                    backgroundColor: "#f9f9f9",
                    margin: "1rem",
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    width: "80vw",
                    padding: "1rem 2rem",
                }}
            >
                <div style={{display: "flex", gap: "1.5rem"}}>
                    <MButton
                        variant="contained"
                        label={"Save"}
                        size={"small"}
                        onClick={handleOnSave}
                        disabled={isLoading}
                    />
                    <MButton
                        variant="contained"
                        label={"Edit Services"}
                        size={"small"}
                        onClick={handleAddServicesButtonClick}
                        disabled={isLoading}
                    />
                    <MButton
                        color={"error"}
                        variant="contained"
                        label={"Cancel"}
                        size={"small"}
                        onClick={() => {
                            router.push({
                                pathname: `/agreement/${serviceDataList[0].AgreementCode}`,
                            });
                        }}
                        disabled={isLoading}
                    />
                </div>
                {rows.map((row, rowIndex) => (
                    <Row
                        key={rowIndex}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            marginTop: "10px",
                        }}
                    >
                        {row.map((col, colIndex) => (
                            <Col
                                key={colIndex}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                {col.map((item, itemIndex) => (
                                    <MAccordian
                                        key={itemIndex}
                                        summaryBgColor={"blue"}
                                        summary={item.Description || item.ServiceCode}
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
                                                    type={"number"}
                                                    label={"Budget $ "}
                                                    id={`Budget_${itemIndex}`}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            itemIndex,
                                                            "Budget",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <InputField
                                                    type={"number"}
                                                    label={"Budget Hour"}
                                                    id={`BudgetHour_${itemIndex}`}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            itemIndex,
                                                            "BudgetHour",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <InputField
                                                    type={"date"}
                                                    label={"Service Start Date"}
                                                    id={`StartDate_${itemIndex}`}
                                                    onChange={(e) => {
                                                        handleInputChange(
                                                            itemIndex,
                                                            "StartDate",
                                                            e.target.value
                                                        );
                                                        dateValidation(
                                                            "StartDate",
                                                            e.target.value,
                                                            itemIndex
                                                        );
                                                    }}
                                                />
                                                <InputField
                                                    type={"date"}
                                                    label={"Service End Date"}
                                                    id={`EndDate_${itemIndex}`}
                                                    onChange={(e) => {
                                                        handleInputChange(
                                                            itemIndex,
                                                            "EndDate",
                                                            e.target.value
                                                        );
                                                        dateValidation(
                                                            "EndDate",
                                                            e.target.value,
                                                            itemIndex
                                                        );
                                                    }}
                                                />
                                            </Col>
                                        }
                                    />
                                ))}
                            </Col>
                        ))}
                    </Row>
                ))}
            </Card>

            <Modal
                open={openServiceMapModal}
                onClose={() => {
                    setOpenServiceMapModal(false);
                }}
            >
                <Fade in={openServiceMapModal}>
                    <Box sx={style}>
                        <ModalHeader
                            onCloseButtonClick={() => {
                                setOpenServiceMapModal(false);
                            }}
                        />
                        <CHKMListingDataTable
                            rows={servicesData}
                            rowSelected={() => {
                            }}
                            handleRowSelectionModelChange={(selectedIDs) =>
                                handleRowSelectionModelChange(selectedIDs)
                            }
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "end",
                                marginTop: "1rem",
                            }}
                        >
                            <MButton
                                label={"Add Selected Services"}
                                variant="outlined"
                                color="primary"
                                disabled={addServicesButtonDisabled || disableSection}
                                onClick={handleAddSelectedServices}
                            />
                        </div>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};

export default Service;
