import React, {useCallback, useEffect, useRef, useState,} from "react";
import {Col, Container, Modal, Row} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
// import Button from "@/components/widgets/Button";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateExpenses from "@/components/forms/client_update/expenses/update_expenses";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {styled} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import {Checkbox, Divider,} from "@mui/material";
import {useRouter} from "next/router";
import styles from "@/styles/style.module.css";
import PrefixedInputField from "@/components/widgets/PrefixedInputField";
import MButton from "@/components/widgets/MaterialButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import Button from "@mui/material/Button";
// import e from "cors";

// Modal.setAppElement("#__next");

const Expenses = () => {
    const IOSSwitch = styled((props) => (
        <Switch
            focusVisibleClassName=".Mui-focusVisible"
            disableRipple
            {...props}
        />
    ))(({theme}) => ({
        width: 50,
        height: 26,
        padding: 0,
        "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: 2,
            transition: "all 300ms ease", // Smooth transition
            transitionDuration: "300ms",
            "&.Mui-checked": {
                transform: "translateX(16px)",
                color: "#fff",
                "& + .MuiSwitch-track": {
                    backgroundColor:
                        theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
                    opacity: 1,
                    border: 0,
                },
                "&.Mui-disabled + .MuiSwitch-track": {
                    opacity: 0.5,
                },
            },
            "&.Mui-focusVisible .MuiSwitch-thumb": {
                color: "#33cf4d",
                border: "6px solid #fff",
            },
            "&.Mui-disabled .MuiSwitch-thumb": {
                color:
                    theme.palette.mode === "light"
                        ? theme.palette.grey[100]
                        : theme.palette.grey[600],
            },
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
            },
        },
        "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 22,
            height: 22,
        },
        "& .MuiSwitch-track": {
            borderRadius: 26 / 2,
            backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
            opacity: 1,
            transition: theme.transitions.create(["background-color"], {
                duration: 500,
            }),
        },
    }));

    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        ClientID: ClientID,
        Supplier: "",
        Description: "",
        TotalAmount: "",
        InvoiceNumber: "",
        Quantity: "",
        isCharge: false,
        isReimbursement: false,
        Note: "",
        Category: "",
        Type: "",
        Date: "",
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

    const [clientExpenseData, setClientExpenseData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disableSection, setDisableSection] = useState(false);
    const [documentOptions, setDocumentOptions] = useState([]);
    const [file, setFile] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accountingCode, setAccountingCode] = useState([]);
    const [services, setServices] = useState([]);
    const fetchAndSetClientExpenseData = useCallback(async () => {
        const data = await fetchData(`/api/getClientExpensesDataById/${ClientID}`);
        setClientExpenseData(data.data);
    }, [ClientID]);
    // const {colors, loading} = useContext(ColorContext);
    const fileInputRef = useRef(null);

    const fetchAndSetClientDocumentData = useCallback(async () => {
        const data = await fetchAndSetClientExpenseData(ClientID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setClientExpenseData(data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetClientExpenseData();
        fetchUserRoles("m_cprofile", "Client_Profile_Expense", setDisableSection);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            console.log("Company:", company);
            const expenseCategory = formData.Category;
            const invoice = formData.InvoiceNumber;

            if (file) {
                const fileName = encodeURIComponent(file.name);
                const FolderPath = generateFolderPath(
                    company,
                    expenseCategory,
                    fileName
                );
                const parts = FolderPath.split("/");
                const FileNameforDB = parts.pop();
                const folderforDB = parts.join("/");

                const response = await postData("/api/postS3Data", {FolderPath});
                const {uploadURL} = response;

                if (!uploadURL) {
                    setOutput("Failed to get pre-signed URL.");
                    return;
                }

                const uploadRes = await fetch(uploadURL, {
                    method: "PUT",
                    headers: {"Content-Type": file.type},
                    body: file,
                });

                if (!uploadRes.ok) {
                    setOutput("File upload failed.");
                    return;
                }

                setOutput("File uploaded successfully!");
                formData.Folder = folderforDB;
                formData.Bucket = "moscaresolutions";
                formData.File = FileNameforDB;
            }

            const insertResponse = await postData(
                `/api/postClientExpensesData/${ClientID}`,
                formData,
                window.location.href
            );

            if (insertResponse.success) {
                setOutput("Client Document added successfully");
                clearForm();
                await fetchAndSetClientExpenseData();
            } else {
                setOutput("Failed to add client document");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding client document");
        } finally {
            setIsSubmitting(false);
            setFile(null);
        }
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            Supplier: "",
            Description: "",
            TotalAmount: "",
            InvoiceNumber: "",
            Quantity: "",
            isCharge: false,
            isReimbursement: false,
            Note: "",
            Category: "",
            Type: "",
            Date: "",
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    const generateFolderPath = (company, expenseCategory, filename) => {
        return `${company}/client/${ClientID}/expenses/${expenseCategory}_${filename}/${filename}`;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutput("");
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleInputChange = (event) => {
        const {name, value, checked, type, id} = event.target;
        console.log(id, ":", value);
        const inputValue = type === "checkbox" ? checked : value;
        if (id === "Service") {
            const selectedService = services.find(
                (serv) => serv.Service_Code === value
            );
            console.log("selectedService:", selectedService);

            if (selectedService) {
                setFormData((prevData) => ({
                    ...prevData,
                    Service: selectedService.Service_Code,
                    ChargeCode: selectedService.Service_Code,
                    NdisNumber: selectedService.NDISSupport_Number,
                    ServiceRate: selectedService.ChargeRate_1,
                }));
            }
        }
        setFormData((prevData) => ({
            ...prevData,
            [id]: inputValue,
        }));
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

    useEffect(() => {
        getAgreementsDetails();
        getServices();
        getWorkers();
        getCategories();
        getAccountingCode();
    }, []);

    const calculateTotalWithServiceRate = () => {
        const quantity = parseFloat(formData.Quantity) || 0;
        const serviceRate = parseFloat(formData.ServiceRate) || 0; // Replace with actual service rate field if available
        const type = formData.Type || ""; // Assuming 'Type' is either 'units' or 'minutes'

        let totalWithServiceRate = 0;

        if (type.toLowerCase() === "units") {
            totalWithServiceRate = quantity * serviceRate;
        } else if (type.toLowerCase() === "minutes") {
            totalWithServiceRate = (quantity / 60) * serviceRate; // Converts minutes to hours
        } else {
            console.warn("Unknown type for calculation:", type);
        }

        setFormData((prevData) => ({
            ...prevData,
            TotalAmount: totalWithServiceRate.toFixed(2),
        }));
        console.log("Total with Service Rate:", totalWithServiceRate);
    };

    const calculateTotalWithCostsAndMarkup = () => {
        const cost = parseFloat(formData.Costs) || 0;
        const markup = parseFloat(formData.MarkUpBy) || 0;
        const isPercentage = formData.MarkUpUse === "%";

        const markupValue = isPercentage ? (cost * markup) / 100 : markup;
        const totalWithMarkup = cost + markupValue;

        setFormData((prevData) => ({
            ...prevData,
            TotalAmount: totalWithMarkup.toFixed(2),
        }));
        console.log("Total with Costs and Markup:", totalWithMarkup);
    };

    const handleSelectChange = (id, value) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const QuantityType = [
        {value: "Units", label: "Units"},
        {value: "Minutes", label: "Minutes"},
    ];

    const handleFileClick = () => {
        fileInputRef.current.click(); // Trigger file input click
    };

    return (
        <div style={{width: "100%"}}>
            <UpdateExpenses
                clientExpensesData={clientExpenseData}
                setClientExpensesData={setClientExpenseData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <Modal
                show={showForm}
                onHide={handleModalCancel}
                centered
                style={{backgroundColor: "rgba(255,255,255,0.75)"}}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Client Expense</Modal.Title>
                </Modal.Header>

                <Modal.Body
                    className={styles.noScrollbar}
                    style={{maxHeight: "60vh", overflowY: "auto"}}
                >
                    <form
                        style={{padding: "", transition: "all 0.5s"}}
                        onSubmit={handleSubmit}
                    >
                        <Container>
                            <Row className="mt-2">
                                <Col md={4}>
                                    <InputField
                                        id="Date"
                                        name="Date"
                                        label="Date:"
                                        value={formData.Date}
                                        type="date"
                                        onChange={(e) => handleInputChange(e)}
                                        disabled={disableSection}
                                    />
                                </Col>
                                <Col md={4}>
                                    <div>
                                        {/* <span style={{ marginRight: "5px",position:"absolute",top:35,left:10,zIndex:10 }}>$</span> */}
                                        <InputField
                                            id="TotalAmount"
                                            name="TotalAmount"
                                            label="TotalAmount:"
                                            startIcon={"$"}
                                            iconStyle={{marginLeft: "0px"}}
                                            value={formData.TotalAmount}
                                            type="number"
                                            sx={{
                                                paddingLeft: "15px", // Add padding to the left to create space for the $ icon
                                            }}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            onKeyDown={(event) => {
                                                // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                                if (
                                                    !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                    ![
                                                        "Backspace",
                                                        "Tab",
                                                        "Delete",
                                                        "ArrowLeft",
                                                        "ArrowRight",
                                                        "Enter",
                                                    ].includes(event.key)
                                                ) {
                                                    event.preventDefault(); // Block any disallowed key
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <InputField
                                        id="Category"
                                        label="Category:"
                                        name="Category"
                                        value={formData.Category}
                                        type="select"
                                        options={categories.map((category) => ({
                                            value: category.Category,
                                            label: category.Category,
                                        }))}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4">
                                <Col md={4} style={{marginTop: "-0.4rem"}}>
                                    <PrefixedInputField
                                        label="Quantity"
                                        prefixType="Quantity" // Country code prefix
                                        prefixValue={formData.Type}
                                        onPrefixChange={(value) =>
                                            handleSelectChange("Type", value)
                                        }
                                        type="number"
                                        id="Quantity"
                                        value={formData.Quantity}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        placeholder={`Enter ${formData.Type}`}
                                        // containerStyle={{ width: "100%" }}
                                        prefixOptions={QuantityType} // Pass dynamic country codes
                                        onKeyDown={(event) => {
                                            // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                            if (
                                                !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                ![
                                                    "Backspace",
                                                    "Tab",
                                                    "Delete",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "Enter",
                                                ].includes(event.key)
                                            ) {
                                                event.preventDefault(); // Block any disallowed key
                                            }
                                        }}
                                    />
                                </Col>

                                <Col md={4}>
                                    <InputField
                                        id="InvoiceNumber"
                                        name="InvoiceNumber"
                                        label="Invoice Number:"
                                        value={formData.InvoiceNumber}
                                        type="number"
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        onKeyDown={(event) => {
                                            // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                            if (
                                                !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                ![
                                                    "Backspace",
                                                    "Tab",
                                                    "Delete",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "Enter",
                                                ].includes(event.key)
                                            ) {
                                                event.preventDefault(); // Block any disallowed key
                                            }
                                        }}
                                    />
                                </Col>
                                <Col md={4}>
                                    <InputField
                                        id="Supplier"
                                        label="Supplier:"
                                        name="Supplier"
                                        value={formData.Supplier}
                                        type="text"
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-1">
                                <Col md={4}>
                                    <InputField
                                        id="Description"
                                        label="Description:"
                                        name="Description"
                                        value={formData.Description}
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
                                        value={formData.Note}
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
                                        checked={formData.isCharge}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        name="checkbox"
                                    />
                                    Add Billing Details
                                </Col>
                                {/* <FormGroup>
                <FormControlLabel
        control={<IOSSwitch sx={{ m: 1 }}
         id="isCharge"
        checked={formData.isCharge} // Bind it to your form state
        onChange={handleInputChange} // Handle change event
        name="isCharge" // Match the field name in your formData
        disabled={disableSection} // Disable toggler if needed
        
         />}
        label="Add Billing Details"
      />
                </FormGroup> */}
                                {/* <div className={style.permissionWrapper}>
        <label className={style.permissionToggle}>
          <input
            type="checkbox"
            checked={formData.isCharge}
            onChange={handleInputChange}
          />
          <span className={style.toggleSlider}></span> 
        </label>
        {formData.isCharge
          ? <span className={`${style.permissionLabel} ${style.readOnlyLabel}`}>Read Only</span>
          : <span className={`${style.permissionLabel} ${style.readWriteLabel}`}>Read/Write</span>
        }
      </div> */}
                            </Row>

                            {formData.isCharge && (
                                <>
                                    <Row>
                                        <Col md={4}>
                                            <InputField
                                                id="Agreement"
                                                label="Agreement:"
                                                name="Agreement"
                                                value={formData.Agreement}
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
                                                value={formData.Service}
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
                                                value={formData.ChargeCode}
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

                                    <Row className="mt-4 mb-4">
                                        <Col md={4}>
                                            <InputField
                                                id="NdisNumber"
                                                label="Ndis Number:"
                                                type="number"
                                                name="NdisNumber"
                                                value={formData.NdisNumber}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                                onKeyDown={(event) => {
                                                    // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                                    if (
                                                        !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                        ![
                                                            "Backspace",
                                                            "Tab",
                                                            "Delete",
                                                            "ArrowLeft",
                                                            "ArrowRight",
                                                            "Enter",
                                                        ].includes(event.key)
                                                    ) {
                                                        event.preventDefault(); // Block any disallowed key
                                                    }
                                                }}
                                            />
                                        </Col>

                                        <Col md={4} className="d-flex align-items-center mt-3">
                                            <Button
                                                style={{
                                                    backgroundColor: "blue",
                                                    color: "white",
                                                    padding: "5px 10px",
                                                }}
                                                sx={{fontSize: "11px"}}
                                                onClick={() => calculateTotalWithServiceRate()}
                                            >
                                                Calc Total w/Service Rate
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Divider component=""/>

                                    <Row className="mt-4">
                                        <Col md={4}>
                                            <InputField
                                                id="Costs"
                                                label="Costs:"
                                                name="Costs"
                                                type="number"
                                                value={formData.Costs}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                                onKeyDown={(event) => {
                                                    // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                                    if (
                                                        !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                        ![
                                                            "Backspace",
                                                            "Tab",
                                                            "Delete",
                                                            "ArrowLeft",
                                                            "ArrowRight",
                                                            "Enter",
                                                        ].includes(event.key)
                                                    ) {
                                                        event.preventDefault(); // Block any disallowed key
                                                    }
                                                }}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <InputField
                                                id="MarkUpUse"
                                                label="MarkUpUse:"
                                                name="MarkUpUse"
                                                value={formData.MarkUpUse}
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
                                                type="number"
                                                value={formData.MarkUpBy}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                                onKeyDown={(event) => {
                                                    // Allow only digits (0-9), Backspace, Tab, Delete, Arrow keys, and Enter
                                                    if (
                                                        !/[0-9]/.test(event.key) && // Prevent non-numeric keys
                                                        ![
                                                            "Backspace",
                                                            "Tab",
                                                            "Delete",
                                                            "ArrowLeft",
                                                            "ArrowRight",
                                                            "Enter",
                                                        ].includes(event.key)
                                                    ) {
                                                        event.preventDefault(); // Block any disallowed key
                                                    }
                                                }}
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
                                                value={formData.MarkUpChargeCode}
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
                                                value={formData.MarkupDesc}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                            />
                                        </Col>

                                        <Col md={4} className="d-flex align-items-center mt-4">
                                            <Button
                                                sx={{fontSize: "11px"}}
                                                style={{
                                                    backgroundColor: "blue",
                                                    color: "#fff",
                                                    padding: "5px 10px",
                                                }}
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
                                                checked={formData.HcpShowMark}
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
                                                checked={formData.HcpInvoiceToClient}
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

                                    {/* <Box sx={{marginTop:"1rem",display:"flex" , gap:"1rem"}}>
       <Button variant="outlined" sx={{fontSize:"11px"}} onClick = {() => calculateTotalWithServiceRate()}>Calc Total with service rate</Button>
       <Button variant="outlined" sx={{fontSize:"11px"}} onClick={() => calculateTotalWithCostsAndMarkup()}>Calc total with costs and markup</Button>
         </Box> */}
                                </>
                            )}

                            <Row>
                                <Col className="checkbox">
                                    <Checkbox
                                        id="isReimbursement"
                                        type="checkbox"
                                        checked={formData.isReimbursement}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        name="checkbox"
                                    />
                                    {/* Is Reimbursement? */}
                                    Request Reimbursement
                                </Col>
                                <Row>
                                    {formData.isReimbursement && (
                                        <Row className="mt-2">
                                            <Col md={6}>
                                                <InputField
                                                    id="Worker"
                                                    label="Worker"
                                                    name="Worker"
                                                    type="select"
                                                    value={formData.Worker}
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
                                                    value={
                                                        accountingCode.find(
                                                            (code) => code.EarningsRateID === formData.PayCode
                                                        )?.Name || ""
                                                    }
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
                                </Row>

                                <Row className="mt-4">
                                    <Col>
                                        {/* <Input
                    type="file" onChange={handleFileChange} /> */}
                                        <div style={{display: "flex", alignItems: "center"}}>
                                            {/* File input (hidden) */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                style={{display: "none"}}
                                            />
                                            {/* Custom File Selector Button */}
                                            <MButton
                                                style={{
                                                    backgroundColor: "blue",
                                                    padding: "5px 12px",
                                                    width: "200px",
                                                }}
                                                label="Upload"
                                                variant="contained"
                                                color="primary"
                                                startIcon={<CloudUploadIcon/>} // Conditional rendering of icons
                                                size="small"
                                                onClick={handleFileClick} // Trigger file input click
                                            />
                                            <span
                                                style={{
                                                    marginLeft: "0.5rem",
                                                    color: "blue",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                        {file?.name}
                      </span>
                                        </div>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="mt-3">
                                <Col className="d-flex justify-content-end gap-3">
                                    {/* <Button
                    onClick={handleModalCancel}
                    style={{
                      backgroundColor: "darkgray",
                      border: "none",
                      borderRadius: "25px",
                      padding: "8px 16px",
                      fontSize: "12px",
                      width: "115px",
                      color:"#fff"
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "blue",
                      border: "none",
                      borderRadius: "25px",
                      padding: "8px 16px",
                      fontSize: "12px",
                      width: "115px",
                       color:"#fff"
                    }}
                  >
                    Create
                  </Button> */}

                                    <MButton
                                        style={{
                                            backgroundColor: "yellow",
                                            padding: "5px 12px",
                                        }}
                                        label="Cancel"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CancelIcon/>}
                                        onClick={handleModalCancel}
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
                                        onClick={handleSubmit}
                                        size="small"
                                    />

                                    {/* <Button variant="contained"   disabled={isSubmitting || disableSection} onClick={handleSubmit}>Create</Button>

                <Button variant="contained"    onClick={clearForm}>Clear</Button> */}
                                </Col>
                            </Row>
                            {/* <InfoOutput output={output} /> */}
                        </Container>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Expenses;
