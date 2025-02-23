import React, {useContext, useEffect, useState} from "react";
import {Col, Container, Modal, Row} from 'react-bootstrap';
import InputField from "@/components/widgets/InputField";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import {Box, Checkbox, Divider, Typography,} from "@mui/material";
import Button from "@mui/material/Button";
import StatusBar from "@/components/widgets/StatusBar";
import ColorContext from "@/contexts/ColorContext";
import styles from "@/styles/style.module.css";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrefixedInputField from "@/components/widgets/PrefixedInputField";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientExpensesData = async (ClientID) => {
    try {
        // Assuming fetchData is returning the correct data structure
        const data = await fetchData(
            `/api/getClientExpensesDataById/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);

        // Ensure the `data` object has a `data` property that is an array
        const transformedData = {
            ...data,
            data: Array.isArray(data.data)
                ? data.data.map((item) => ({
                    ...item,
                    isCharge: item.isCharge ? true : false,
                    isReimbursement: item.isReimbursement ? true : false,
                }))
                : [], // If `data.data` is not an array, return an empty array
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching client document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};


const UpdateExpenses = ({
                            setClientExpensesData,
                            clientExpensesData,
                            setShowForm,
                            ClientID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Date: "",
        TotalAmount: "",
        Quantity: "",
        Type: "",
        Category: "",
        Description: "",
        Supplier: "",
        InvoiceNumber: "",
        Note: "",
        isCharge: false,
        isReimbursement: false,
        Agreement: "",
        Service: "",
        ChargeCode: "",
        NdisNumber: "",
        Costs: "",
        MarkUpUse: "",
        MarkUpBy: "",
        HcpShowMark: false,
        MarkUpChargeCode: "",
        HcpInvoiceToClient: false,
        Worker: "",
        PayCode: "",
        MarkupDesc: "",
        ServiceRate: "",
    });


    const [editedRowData, setEditedRowData] = useState(selectedRowData);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null); // storing the api status
    const [services, setServices] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accountingCode, setAccountingCode] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const {colors, loading} = useContext(ColorContext);
    const [preSignedUrl, setPreSignedUrl] = useState(null);
    const [error, setError] = useState(null);
    //   const [expenseData,setExpenseData] = useS

    const fetchAndSetClientExpensesData = async () => {
        const data = await fetchData(
            `/api/getClientExpensesDataById/${ClientID}`,
            window.location.href
        );

        console.log("Expenes Data : ", data)
        //  const data = await fetchClientExpensesData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        console.log(data.data);
        setDocumentOptions(documentOptions.data);
        setClientExpensesData(data.data);
    };

    useEffect(() => {
        const fetchPreSignedUrl = async () => {
            try {
                const response = await fetchData(
                    `/api/getS3Data/${encodeURIComponent(
                        selectedRowData.Folder
                    )}/${encodeURIComponent(selectedRowData.File)}`
                );
                setPreSignedUrl(response.dataURL); // Set the pre-signed URL
            } catch (err) {
                console.error("Error fetching pre-signed URL:", err);
                setError("Failed to fetch document link.");
            }
        };

        if (selectedRowData.Folder) {
            fetchPreSignedUrl();
        }
    }, [selectedRowData]);
    useEffect(() => {
        fetchAndSetClientExpensesData();
        fetchUserRoles("m_cprofile", "Client_Profile_Expense", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {

        setSelectedRowData({
            ...row, // Spread the row data to include all properties
            isCharge: row.isCharge || false, // Ensure isCharge has a value
            isReimbursement: row.isReimbursement || false, // Ensure isReimbursement has a value
        });
        setShowModal(true);
        console.log("Selected Row", row);
    };

    const handleSave = async () => {
        console.log("Data to be saved:", selectedRowData);

        try {
            const data = await putData(
                `/api/updateClientExpensesData`,
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setAlert(true);
            setStatus(data.success);
            await fetchAndSetClientExpensesData(ClientID)
            handleClearForm();
        } catch (error) {
            setAlert(true);
            setStatus(false);
            console.error("Error saving data:", error);
        }
        setShowModal(false);


    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientExpensesData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientExpensesData(await fetchClientExpensesData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ClientID: ClientID,
            Date: "",
            TotalAmount: "",
            Quantity: "",
            Type: "",
            Category: "",
            Description: "",
            Supplier: "",
            InvoiceNumber: "",
            Note: "",
            isCharge: false,
            isReimbursement: false,
        });
        setEditedRowData(null);
    };

    const handleInputChange = (event) => {
        const {id, name, type, value, checked} = event.target;
        const newValue = type === "checkbox" ? checked : value;

        if (id === "Service") {
            const selectedService = services.find((serv) => serv.Service_Code === value);
            console.log("selectedService:", selectedService);

            if (selectedService) {
                setSelectedRowData((prevData) => ({
                    ...prevData,
                    Service: selectedService.Service_Code,
                    ChargeCode: selectedService.Service_Code,
                    NdisNumber: selectedService.NDISSupport_Number,
                    ServiceRate: selectedService.ChargeRate_1,
                }));
            }
        }

        if (id === "PayCode") {
            const selectedCode = accountingCode.find((code) => code.EarningsRateID === value);
            console.log(value)
            console.log(accountingCode);
            console.log("selectedCode:", selectedCode);

            if (selectedCode) {
                setSelectedRowData((prevData) => ({
                    ...prevData,
                    PayCode: selectedCode.EarningsRateID,
                }));
            }
        }

        setSelectedRowData((prevData) => ({
            ...prevData,
            [id]: newValue,
        }));
    };


    const getServices = async () => {
        try {
            console.log(ClientID);
            const allServiceData = await fetchData(
                `api/getServiceAsPerAgreement/${ClientID}`
            );
            if (allServiceData && allServiceData.data) {
                setServices(allServiceData.data);
                console.log("Service datas:", allServiceData.data); // Log the fetched data directly
            } else {
                console.error("Unexpected data format:", allServiceData);
            }
        } catch (error) {
            console.error("Error fetching service data:", error);
        }
    };

    const getAgreementsDetails = async () => {
        try {
            const agreementData = await fetchData(
                `api/getAgreementDetailsByClientID/${ClientID}`
            );
            if (agreementData) {
                setAgreements(agreementData);
                console.log("agreement datas:", agreementData); // Log the fetched data directly
            } else {
                console.error("Unexpected data format:", agreementData);
            }
        } catch (error) {
            console.error("Error fetching agreement data:", error);
        }
    };


    const getWorkers = async () => {
        try {
            const allWorkersData = await fetchData("api/getActiveWorkerMasterData");
            if (allWorkersData && allWorkersData.data) {
                setWorkers(allWorkersData.data);
            } else {
                console.error("Unexpected data format:", allWorkersData);
            }
        } catch (error) {
            console.error("Error fetching workers data:", error);
        }
    };

    const getCategories = async () => {
        try {
            const categries = await fetchData("api/getExpenses");
            if (categries && categries.data) {
                setCategories(categries.data);
            } else {
                console.error("Unexpected data format:", categries);
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };

    const getAccountingCode = async () => {
        try {
            const accountingCode = await fetchData("api/getxeroearningpayment");
            if (accountingCode && accountingCode.data) {
                setAccountingCode(accountingCode.data);
            } else {
                console.error("Unexpected data format:", accountingCode);
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };


    useEffect(() => {
        getAgreementsDetails();
        getServices();
        getWorkers();
        getCategories();
        getAccountingCode();
    }, []);


    const calculateTotalWithServiceRate = () => {
        const quantity = parseFloat(selectedRowData.Quantity) || 0;
        const serviceRate = parseFloat(selectedRowData.ServiceRate) || 0; // Replace with actual service rate field if available
        const type = selectedRowData.Type || ""; // Assuming 'Type' is either 'units' or 'minutes'

        let totalWithServiceRate = 0;

        if (type.toLowerCase() === "units") {
            totalWithServiceRate = quantity * serviceRate;
        } else if (type.toLowerCase() === "minutes") {
            totalWithServiceRate = (quantity / 60) * serviceRate; // Converts minutes to hours
        } else {
            console.warn("Unknown type for calculation:", type);
        }

        setSelectedRowData((prevData) => ({
            ...prevData,
            TotalAmount: totalWithServiceRate.toFixed(2),
        }));
        console.log("Total with Service Rate:", totalWithServiceRate);
    };


    const calculateTotalWithCostsAndMarkup = () => {
        const cost = parseFloat(selectedRowData.Costs) || 0;
        const markup = parseFloat(selectedRowData.MarkUpBy) || 0;
        const isPercentage = selectedRowData.MarkUpUse === "%";

        const markupValue = isPercentage ? (cost * markup) / 100 : markup;
        const totalWithMarkup = cost + markupValue;

        setSelectedRowData((prevData) => ({
            ...prevData,
            TotalAmount: totalWithMarkup.toFixed(2),
        }));
        console.log("Total with Costs and Markup:", totalWithMarkup);
    };

    const fields = [
        {
            id: "Date",
            label: "Date:",
            type: "date",
            value: selectedRowData.Date,
        },
        {
            id: "TotalAmount",
            label: "Total Amount:",
            type: "number",
            value: selectedRowData.TotalAmount,
        },
        {
            id: "Quantity",
            label: "Quantity (Units / Minutes):",
            type: "text",
            value: selectedRowData.Quantity,
        },
        {
            id: "Type",
            label: "Type:",
            type: "select",
            value: selectedRowData.Type,
            options: [
                {value: "Units", label: "UNITS"},
                {value: "minutes", label: "MINUTES"},
            ],
        },
        {
            id: "Category",
            label: "Category:",
            type: "select",
            value: selectedRowData.Category,
            options: categories.map((category) => ({
                value: category.Category,
                label: category.Category,
            })),
        },
        {
            id: "Description",
            label: "Description:",
            type: "text",
            value: selectedRowData.Description,
        },
        {
            id: "Supplier",
            label: "Supplier:",
            type: "text",
            value: selectedRowData.Supplier,
        },
        {
            id: "InvoiceNumber",
            label: "Invoice Number:",
            type: "text",
            value: selectedRowData.InvoiceNumber,
        },
        {
            id: "Note",
            label: "Note:",
            type: "text",
            value: selectedRowData.Note,
        },
        {
            id: "isCharge",
            label: "Is Charge?",
            type: "checkbox",
            value: selectedRowData.isCharge,
        },
        ...(selectedRowData.isCharge
            ? [
                {
                    id: "Agreement",
                    label: "Agreement:",
                    type: "select",
                    value: selectedRowData.Agreement,
                    options: agreements.map((agreement) => ({
                        value: agreement.AgreementCode,
                        label: `${agreement.AgreementCode} | Type: ${agreement.AgreementType}`,
                    })),
                },
                {
                    id: "Service",
                    label: "Service:",
                    type: "select",
                    value: selectedRowData.Service,
                    options: services.map((serv) => ({
                        value: serv.Service_Code,
                        label: `${serv.Service_Code} - ${serv.Description}`,
                    })),
                },
                {
                    id: "ChargeCode",
                    label: "Charge Code:",
                    type: "select",
                    value: selectedRowData.ChargeCode,
                    options: services.map((serv) => ({
                        value: serv.Service_Code,
                        label: `${serv.Service_Code} - ${serv.Description}`,
                    })),
                },
                {
                    id: "NdisNumber",
                    label: "NDIS Number:",
                    type: "text",
                    value: selectedRowData.NdisNumber,
                },
                {
                    id: "Costs",
                    label: "Costs:",
                    type: "text",
                    value: selectedRowData.Costs,
                },
                {
                    id: "MarkUpUse",
                    label: "Markup Use:",
                    type: "select",
                    value: selectedRowData.MarkUpUse,
                    options: [
                        {value: "%", label: "%"},
                        {value: "$", label: "$"},
                    ],
                },
                {
                    id: "MarkUpBy",
                    label: "Markup By:",
                    type: "text",
                    value: selectedRowData.MarkUpBy,
                },
                {
                    id: "MarkUpChargeCode",
                    label: "Markup Charge Code:",
                    type: "select",
                    value: selectedRowData.MarkUpChargeCode,
                    options: services.map((serv) => ({
                        value: serv.Service_Code,
                        label: `${serv.Service_Code} - ${serv.Description}`,
                    })),
                },
                {
                    id: "MarkupDesc",
                    label: "Markup Description:",
                    type: "text",
                    value: selectedRowData.MarkupDesc,
                },
                {
                    id: "HcpShowMark",
                    label: "HCP Show Markup on a Separate Line with Description",
                    type: "checkbox",
                    value: selectedRowData.HcpShowMark,
                },
                {
                    id: "HcpInvoiceToClient",
                    label: "HCP - Invoice to Client?",
                    type: "checkbox",
                    value: selectedRowData.HcpInvoiceToClient,
                },
            ]
            : []),
        {
            id: "isReimbursement",
            label: "Is Reimbursement?",
            type: "checkbox",
            value: selectedRowData.isReimbursement,
        },
        ...(selectedRowData.isReimbursement
            ? [
                {
                    id: "Worker",
                    label: "Worker:",
                    type: "select",
                    value: selectedRowData.Worker,
                    options: workers.map((worker) => ({
                        value: worker.WorkerID,
                        label: `${worker.FirstName} ${worker.LastName}`,
                    })),
                },
                {
                    id: "PayCode",
                    label: "Pay Code:",
                    type: "select",
                    value: selectedRowData.PayCode,
                    options: accountingCode.map((code) => ({
                        value: code.EarningsRateID,
                        label: code.Name,
                    })),
                },
            ]
            : []),
    ];

    const handleModalCancel = () => {
        // clearForm();
        setShowModal(false);
    };

    const handleSelectChange = (id, value) => {
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const QuantityType = [
        {value: "Units", label: "Units"},
        {value: "Minutes", label: "Minutes"},
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {
                    alert && (<StatusBar status={status} setAlert={setAlert}
                                         msg={!status ? "Something went wrong" : "Profile Updated Successfully"
                                         }/>
                    )}


            <CustomAgGridDataTable2
                rows={clientExpensesData}
                title="Client Expenses"
                primaryButton={{
                  label: "Add Client Expense",
                  icon: <PlusCircle className="h-4 w-4" />,
                  onClick: () => setShowForm(true), 
                  // disabled: disableSection,
                }}
                columns={[
                    { field: "Date", headerName: "Date" },
                    { field: "TotalAmount", headerName: "Total Amount" },
                    { field: "Quantity", headerName: "Quantity" },
                    { field: "Type", headerName: "Type" },
                    { field: "Category", headerName: "Category" },
                    { field: "Description", headerName: "Description" },
                    { field: "Supplier", headerName: "Supplier" },
                    { field: "InvoiceNumber", headerName: "Invoice Number" },
                    { field: "Note", headerName: "Note" },
                    { field: "isCharge", headerName: "Charge" },
                    { field: "isReimbursement", headerName: "Reimbursement" },
                ]}
                showActionColumn={true}
                rowSelected={handleSelectRowClick}
            />

                <Modal
                    show={showModal} onHide={handleModalCancel} centered
                    style={{backgroundColor: "rgba(255,255,255,0.75)"}}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Client Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.noScrollbar} style={{maxHeight: "60vh", overflowY: "auto"}}>
                        <form
                            style={{padding: "", transition: "all 0.5s"}}
                            //  onSubmit={handleSubmitDocument}
                        >
                            <Container>
                                <Row className="mt-2">
                                    <Col md={4}>
                                        <InputField
                                            id="Date"
                                            name="Date"
                                            label="Date:"
                                            value={selectedRowData.Date}
                                            type="date"
                                            onChange={(e) => handleInputChange(e)}
                                            disabled={disableSection}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InputField
                                            id="TotalAmount"
                                            name="TotalAmount"
                                            label="TotalAmount:"
                                            value={selectedRowData.TotalAmount}
                                            type="number"
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            onKeyDown={(event) => {
                                                if (event.key === "-" || event.key === "+" || event.key === "e") {
                                                    event.preventDefault(); // Block `-` and `e`
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InputField
                                            id="Category"
                                            label="Category:"
                                            name="Category"
                                            value={selectedRowData.Category}
                                            type="select"
                                            options={categories.map((category) => ({
                                                value: category.Category,
                                                label: category.Category,
                                            }))}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                        />
                                    </Col>
                                    {/* <Col md={4}>
                                <InputField
                                    id="Quantity"
                                    name="Quantity"
                                    label="Quantity (Units / Minutes):"
                                    value={selectedRowData.Quantity}
                                    type="number"
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    onKeyDown={(event) => {
                                        if (event.key === "-" || event.key === "+"  || event.key === "e") {
                                          event.preventDefault(); // Block `-` and `e`
                                        }
                                      }}
                                />
                            </Col> */}
                                </Row>
                                <Row className="mt-4">
                                    {/* <Col md={4}>
                                <InputField
                                    id="Type"
                                    label="Type:"
                                    name="Type"
                                    value={selectedRowData.Type}
                                    type="select"
                                    options={[
                                        { value: "Units", label: "UNTS" },
                                        { value: "minutes", label: "MINUTES" },
                                    ]}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Col> */}
                                    <Col md={4} style={{marginTop: "-0.4rem"}}>
                                        <PrefixedInputField
                                            label="Quantity"
                                            prefixType="Quantity" // Country code prefix
                                            prefixValue={selectedRowData.Type}
                                            onPrefixChange={(value) =>
                                                handleSelectChange("Type", value)
                                            }
                                            type="number"
                                            id="Quantity"
                                            value={selectedRowData.Quantity}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            placeholder={`Enter ${selectedRowData.Type}`}
                                            // containerStyle={{ width: "100%" }}
                                            prefixOptions={QuantityType} // Pass dynamic country codes
                                            onKeyDown={(event) => {
                                                // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                                if (
                                                    !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                    !["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Enter"].includes(event.key)
                                                ) {
                                                    event.preventDefault(); // Block any disallowed key
                                                }
                                            }}
                                        />
                                    </Col>
                                    {/* <Col md={4}>
                                <InputField
                                    id="Category"
                                    label="Category:"
                                    name="Category"
                                    value={selectedRowData.Category}
                                    type="select"
                                    options={categories.map((category) => ({
                                        value: category.Category,
                                        label: category.Category,
                                    }))}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Col> */}
                                    <Col md={4}>
                                        <InputField
                                            id="InvoiceNumber"
                                            name="InvoiceNumber"
                                            label="Invoice Number:"
                                            value={selectedRowData.InvoiceNumber}
                                            type="number"
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            onKeyDown={(event) => {
                                                if (event.key === "-" || event.key === "+" || event.key === "e") {
                                                    event.preventDefault(); // Block `-` and `e`
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <InputField
                                            id="Supplier"
                                            label="Supplier:"
                                            name="Supplier"
                                            value={selectedRowData.Supplier}
                                            type="text"
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mt-2">

                                    <Col md={4}>
                                        <InputField
                                            id="Description"
                                            label="Description:"
                                            name="Description"
                                            value={selectedRowData.Description}
                                            type="text"
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            options={documentOptions.map((form) => ({
                                                value: form.Description,
                                                label: form.Description,
                                            }))}
                                        />
                                    </Col>

                                    <Col md={4}>
                                        <InputField
                                            id="Note"
                                            label="Note:"
                                            name="Note"
                                            value={selectedRowData.Note}
                                            type="textarea"
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                        />
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <Col className="checkbox">
                                        <Checkbox
                                            id="isCharge"
                                            type="checkbox"
                                            checked={selectedRowData.isCharge}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            name="checkbox"
                                        />
                                        Billing Details
                                    </Col>
                                </Row>

                                {selectedRowData.isCharge && (
                                    <>
                                        <Row className="mt-2">
                                            <Col md={4}>
                                                <InputField
                                                    id="Agreement"
                                                    label="Agreement:"
                                                    name="Agreement"
                                                    value={selectedRowData.Agreement}
                                                    type="select"
                                                    options={agreements.map((agreement) => ({
                                                        value: agreement.AgreementCode,
                                                        label: `${agreement.AgreementCode} | Type: ${agreement.AgreementType}`,
                                                    }))}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>

                                            <Col md={4}>
                                                <InputField
                                                    id="Service"
                                                    label="Service"
                                                    name="Service"
                                                    value={selectedRowData.Service}
                                                    type="select"
                                                    options={services.map((serv) => ({
                                                        value: serv.Service_Code,
                                                        label: `${serv.Service_Code} -  ${serv.Description}`,
                                                    }))}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>

                                            <Col md={4}>
                                                <InputField
                                                    id="ChargeCode"
                                                    label="Charge Code:"
                                                    name="ChargeCode"
                                                    value={selectedRowData.ChargeCode}
                                                    type="select"
                                                    options={services.map((serv) => ({
                                                        value: serv.Service_Code,
                                                        label: `${serv.Service_Code} -  ${serv.Description}`,
                                                    }))}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mt-4 ">
                                            <Col md={4}>
                                                <InputField
                                                    id="NdisNumber"
                                                    label="Ndis Number:"
                                                    name="NdisNumber"
                                                    type='number'
                                                    value={selectedRowData.NdisNumber}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "-" || event.key === "+" || event.key === "e") {
                                                            event.preventDefault(); // Block `-` and `e`
                                                        }
                                                    }}
                                                />
                                            </Col>

                                            <Col md={4} className="d-flex align-items-center mt-4 mb-4 p-2">
                                                <Button
                                                    style={{
                                                        backgroundColor: "blue",
                                                        color: "white",
                                                        padding: "5px 10px",
                                                    }}
                                                    sx={{fontSize: "11px"}}
                                                    onClick={() => calculateTotalWithServiceRate()}
                                                >
                                                    Calc Total with Service Rate
                                                </Button>
                                            </Col>
                                        </Row>

                                        <Divider component=""/>

                                        <Row className="mt-2">
                                            <Col md={4}>
                                                <InputField
                                                    id="Costs"
                                                    label="Costs:"
                                                    name="Costs"
                                                    type='number'
                                                    value={selectedRowData.Costs}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <InputField
                                                    id="MarkUpUse"
                                                    label="MarkUpUse:"
                                                    name="MarkUpUse"
                                                    value={selectedRowData.MarkUpUse}
                                                    type="select"
                                                    options={[
                                                        {value: "%", label: "%"},
                                                        {value: "$", label: "$"},
                                                    ]}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>

                                            <Col md={4}>
                                                <InputField
                                                    id="MarkUpBy"
                                                    label="MarkUpBy:"
                                                    name="MarkUpBy"
                                                    value={selectedRowData.MarkUpBy}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mt-4">
                                            <Col md={4}>
                                                <InputField
                                                    id="MarkUpChargeCode"
                                                    label="Markup Charge Code"
                                                    name="MarkUpChargeCode"
                                                    type="select"
                                                    value={selectedRowData.MarkUpChargeCode}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                    options={services.map((serv) => ({
                                                        value: serv.Service_Code,
                                                        label: `${serv.Service_Code} -  ${serv.Description}`,
                                                    }))}
                                                />
                                            </Col>

                                            <Col md={4}>
                                                <InputField
                                                    id="MarkupDesc"
                                                    label="Markup Description"
                                                    name="MarkupDesc"
                                                    value={selectedRowData.MarkupDesc}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                />
                                            </Col>

                                            <Col md={4} className="d-flex align-items-center mt-4">
                                                <Button
                                                    style={{
                                                        backgroundColor: "blue",
                                                        color: "white",
                                                        padding: "5px 10px",
                                                    }}
                                                    sx={{fontSize: "11px"}}
                                                    onClick={() => calculateTotalWithCostsAndMarkup()}
                                                >
                                                    Calc Total Cost + Markup
                                                </Button>
                                            </Col>
                                        </Row>

                                        <Row className="mt-4">
                                            <Col md={12}>
                                                <Checkbox
                                                    id="HcpShowMark"
                                                    type="checkbox"
                                                    checked={selectedRowData.HcpShowMark}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                    name="checkbox"
                                                />
                                                <span style={{fontSize: "13px"}}>
                                                HCP - Show mark up on a separate line with description
                                            </span>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Checkbox
                                                    id="HcpInvoiceToClient"
                                                    type="checkbox"
                                                    checked={selectedRowData.HcpInvoiceToClient}
                                                    onChange={handleInputChange}
                                                    disabled={disableSection}
                                                    name="checkbox"
                                                />
                                                <span style={{fontSize: "13px"}}>
                                                {" "}
                                                    HCP - Invoice to Client?
                                            </span>
                                            </Col>
                                        </Row>
                                    </>
                                )}

                                <Row>
                                    <Col className="checkbox">
                                        <Checkbox
                                            id="isReimbursement"
                                            type="checkbox"
                                            checked={selectedRowData.isReimbursement}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            name="checkbox"
                                            sx={{fontSize: "0.9rem !important"}}
                                        />
                                        Is Reimbursement?
                                    </Col>
                                    <Row>
                                        {selectedRowData.isReimbursement && (
                                            <Row className="mt-2">
                                                <Col md={6}>
                                                    <InputField
                                                        id="Worker"
                                                        label="Worker"
                                                        name="Worker"
                                                        type="select"
                                                        value={selectedRowData.Worker}
                                                        onChange={handleInputChange}
                                                        disabled={disableSection}
                                                        options={workers.map((worker) => ({
                                                            value: worker.WorkerID,
                                                            label: `${worker.FirstName} ${worker.LastName}`,
                                                        }))}
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <InputField
                                                        id="PayCode"
                                                        label="Pay Code"
                                                        name="PayCode"
                                                        type="select"
                                                        value={selectedRowData.PayCode}
                                                        onChange={handleInputChange}
                                                        disabled={disableSection}
                                                        options={accountingCode.map((code) => ({
                                                            value: code.EarningsRateID,
                                                            label: code.Name,
                                                        }))}
                                                    />
                                                </Col>
                                            </Row>
                                        )}
                                        {/* <Row className="mt-2">
                <Col>
                  <Input type="file" onChange={handleFileChange} />
                </Col>
         </Row> */}
                                    </Row>
                                </Row>

                                <Box sx={{
                                    marginTop: "1rem",
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "1rem",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    {/* <Button variant="contained" onClick={handleSave} sx={{
                                    height: "35px", // Adjust the height
                                    // padding: "6px 16px", // Adjust padding to keep the text centered
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "blue",
                                    "&:hover": {
                                    backgroundColor: "blue", // Replace this with your desired hover color
            },
                                }}>
                                    Update
                                </Button> */}
                                    <Typography
                                        variant="h6"
                                        style={{}}
                                    >
                                        {preSignedUrl ? (
                                            <Button
                                                onClick={() => window.open(preSignedUrl, "_blank")}
                                                variant="outlined"

                                            >

                                                View Uploaded Document
                                            </Button>
                                        ) : error ? (
                                            <span style={{color: "red"}}>{error}</span>
                                        ) : null}
                                    </Typography>

                                    <Box className="d-flex gap-3">
                                        <MButton
                                            style={{
                                                backgroundColor: "yellow",
                                                padding: "5px 12px",
                                            }}
                                            label="Cancel"
                                            variant="contained"
                                            color="primary"
                                            startIcon={<CancelIcon/>}
                                            onClick={() => setShowModal(false)}
                                            size="small"
                                        />

                                        <MButton
                                            style={{
                                                backgroundColor: "blue",
                                                padding: "5px 12px",
                                            }}
                                            label=" Save Changes"
                                            variant="contained"
                                            color="primary"
                                            startIcon={<SaveIcon/>}
                                            onClick={handleSave}
                                            size="small"

                                        />


                                    </Box>


                                </Box>
                                {/* <Button variant="contained" >Clear</Button> */}

                                {/* <InfoOutput output={output} /> */}
                            </Container>
                        </form>
                    </Modal.Body>
                </Modal>

            </div>
        </div>
    );
};

export default UpdateExpenses;
