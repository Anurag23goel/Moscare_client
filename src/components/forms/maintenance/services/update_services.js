import React, {useContext, useEffect, useRef, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, getOAuth2Token, putData} from "@/utility/api_utility"; // Assuming fetchData is defined in api_utility
import InputField from "@/components/widgets/InputField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Box, FormGroup, Grid, Tab, Tabs} from "@mui/material";
import labelsData from "./payroll.json";
import ColorContext from "@/contexts/ColorContext";
import {styled} from "@mui/system";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
// import { FileText, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";
import {
    ArrowLeft,
    BookOpen as BookIcon,
    Database,
    DollarSign,
    FileCheck,
    FileText,
    Layers,
    PlusCircle,
    RefreshCw,
    Save,
} from "lucide-react";

export const fetchServicesData = async () => {
    try {
        return await fetchData("/api/getServicesData", window.location.href);
    } catch (error) {
        console.error("Error fetching services data:", error);
        return null; // Return null or an empty object in case of error
    }
};

export const fetchCCCServicesData = async () => {
    try {
        return await fetchData("/api/getCCCServices", window.location.href);
    } catch (error) {
        console.error("Error fetching services data:", error);
        return null; // Return null or an empty object in case of error
    }
};

const UpdateServices = ({
                            servicesData,
                            setServicesData,
                            setShowForm,
                            addValidationMessage,
                        }) => {
    const initialSelectedRowData = {};
    for (let i = 1; i <= 48; i++) {
        initialSelectedRowData[`LabelPayrollCode_${i}`] = ""; // Initial empty strings or default values
    }
    const [selectedRowData, setSelectedRowData] = useState(initialSelectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [xeroInvoice, setXeroInvoice] = useState([]);
    const [payItems, setPayItems] = useState([]);
    const [cccServices, setCccServices] = useState([]);
    const [payRollData, setPayrollData] = useState([]);
    const [serviceCategory, setServiceCategory] = useState([]);
    const [shiftType, setShiftType] = useState([]);
    const [serviceType, setServiceType] = useState([]);
    const [expenseCategory, setExpenseCategory] = useState([]);
    const [payRollLabels, setPayRollLabels] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [columns, setColumns] = useState([]);
    const scrollRef = useRef(null);
    // const {colors} = useContext(ColorContext);

    const CustomTab = styled(Tab)(({theme}) => ({
        backgroundColor: "blue",
        color: "#fff",
        borderRadius: "5px",
        padding: "5px 10px",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "blue",
        },
        "&.Mui-selected": {
            backgroundColor: "blue",
            color: "#fff",
        },
    }));

    // const fetchShifttypeData = async () => {
    //   try {
    //     const data = await fetchData("/api/getShiftType", window.location.href);
    //     /* console.log("Fetched data:", data); */
    //     setShiftType(data.data);
    //     return data;
    //   } catch (error) {
    //     console.error("Error fetching services data:", error);
    //   }
    // };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const tabLabels = [
        "Rates 1-7",
        "Rates 8-14",
        "Rates 15-21",
        "Rates 22-28",
        "Rates 29-35",
        "Rates 36-42",
        "Rates 43-49",
        "Rates 50-56",
        "Rates 57-63",
        "Rates 64-70",
    ];
    const fieldsPerTab = 7;

    const getToken = async () => {
        const tokenData = await getOAuth2Token();
        /* console.log("Token from getOAuth2Token:", tokenData); */
        return tokenData;
    };

    const fetchDataAsync = async () => {
        try {
            const [
                xeroInvoiceData,
                payRollCode
            ] = await Promise.all([
                fetchData(`/api/getxeroinvoice`, window.location.href),
                fetchData(`/api/getxeroearningpayment`, window.location.href),
            ]);

            /* console.log("Xero Invoice Data:", xeroInvoiceData); */
            setXeroInvoice(xeroInvoiceData.data);
            console.log("Payroll Code Data:", payRollCode);
            setPayItems(payRollCode.data);
        } catch (error) {
            console.error("Error fetching Xero data:", error);
        }
    };

    useEffect(() => {
        const fetchAndSetServicesData = async () => {
            try {
                const [
                    data,
                    data1
                ] = await Promise.all([
                    fetchServicesData(),
                    fetchCCCServicesData(),
                ]);

                if (data) {
                    setServicesData(data);
                    setColumns(getColumns(data));
                    console.log("Services Data : ", data);
                }
                if (data1) {
                    setCccServices(data1.data);
                    console.log("CCC Services Data : ", data1);
                }
            } catch (error) {
                console.error("Error fetching services data:", error);
            }
        };

        fetchAndSetServicesData();
        fetchUserRoles("m_maint_services", "Maintainence_Services", setDisableSection);
        // fetchShifttypeData();
        fetchDataAsync();
    }, []);

    const fetchXeroAccounts = async () => {
        console.log("Fetching Xero Accounts");
        try {
            const token = await getToken();
            /* console.log("Token used in fetchXeroAccounts:", token); */
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/accounting/items/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Encoding": "",
                    "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const accounts = data.Items.map((account) => ({
                ItemID: account.ItemID,
                Code: account.Code,
                Name: account.Name,
                UnitPrice: account.SalesDetails.UnitPrice,
            }));

            console.log(accounts);

            console.log("Inserting Data...");

            const xeroData = await putData(
                `/api/upsertxeroinvoice`,
                {accounts: accounts},
                window.location.href
            );

            console.log("Xero Accounts: ", xeroData);
        } catch (error) {
            console.error("Error fetching Xero accounts:", error);
        }
    };

    const fetchXeroPayItems = async () => {
        console.log("PayItems Searching..");
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/payroll-au/PayItems/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
            });

            console.log("PayItems Response:", response);

            if (!response.ok) {
                console.log("Error in Fetching Pay Items");
            }

            const data = await response.json();
            const payItems = data.PayItems.EarningsRates.map((payitem) => ({
                EarningsRateID: payitem.EarningsRateID,
                Name: payitem.Name,
                EarningsType: payitem.EarningsType,
                RateType: payitem.RateType,
                AccountCode: payitem.AccountCode,
                TypeOfUnits: payitem.TypeOfUnits,
                Multiplier: payitem.Multiplier,
                RatePerUnit: payitem.RatePerUnit,
            }));

            console.log("Xero Pay Items: ", payItems);

            const xeroData = await putData(
                `/api/upsertxeroearningrate`,
                {payItems: payItems},
                window.location.href
            );

            console.log("Xero Pay Items: ", xeroData);

            // Handle the response data as needed
        } catch (error) {
            console.error("Error fetching Pay Items:", error);
        }
    };

    const postXeroPayItems = async () => {
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(
                `${baseAPIUrl}/xero/payroll-au/PayItems/earningsrate`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                    },
                    body: JSON.stringify({
                        EarningsRateID: "GUID",
                        Name: "Regular Pay",
                        AccountCode: "400",
                        TypeOfUnits: "Hours",
                        IsExemptFromTax: false,
                        IsExemptFromSuper: false,
                        RateType: "FIXEDAMOUNT",
                        EarningsType: "OrdinaryTimeEarnings",
                        ExpenseAccount: "478",
                        IsReportedToSingleTouchPayroll: true,
                        IsOvertime: false,
                        AllowanceType: "",
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Posted Xero Earnings Rate:", data);
            // Handle the response data as needed
        } catch (error) {
            console.error("Error posting Xero Earnings Rate:", error);
        }
    };

    const fetchXeroContacts = async () => {
        console.log("Fetching Xero Contacts");
        try {
            const token = await getToken();
            const baseAPIUrl = process.env.NEXT_PUBLIC_ACCOUNTING_API_BASE_URL;
            const response = await fetch(`${baseAPIUrl}/xero/accounting/contacts/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "M-Client-ID": process.env.NEXT_PUBLIC_ACCOUNTING_API_M_CLIENT_ID,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const contacts = data.Contacts.map((contact) => ({
                ContactID: contact.ContactID,
                Name: contact.Name,
                ContactStatus: contact.ContactStatus,
            }));

            console.log(contacts);
            /*  console.log("Xero Contact:", data.Contacts); */

            const xeroData = await putData(
                `/api/upsertxerocontact`,
                {contacts: contacts},
                window.location.href
            );

            console.log("Xero Contacts: ", xeroData);

            // Handle the response data as needed
        } catch (error) {
            console.error("Error fetching Contact:", error);
        }
    };

    const handleRowUnselected = () => {
        setSelectedRowData(null);
    };

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
        console.log("Selected Row service:", row);
    };

    const handleSave = async () => {
        console.log("DataToSend : ", selectedRowData);

        // console.log("DataToSend : " , dataToSend)
        try {
            const data = await putData(
                `/api/updateServiceInfo/${selectedRowData.Service_ID}`,
                selectedRowData,
                window.location.href
            );
            if (data.success) {
                addValidationMessage("Services Updated Successfully", "success");
                console.log("Save clicked:", data);
                setServicesData(await fetchServicesData());
            }
        } catch (error) {
            console.error("Error fetching address data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteServices",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setServicesData(await fetchServicesData());
        } catch (error) {
            console.error("Error fetching address data:", error);
        }
    };

    const handleInputChange = (event) => {
        const {id, value, checked, type} = event.target;
        // Convert checkbox values to "Y" or "N"
        const newValue = type === "checkbox" ? (checked ? "Y" : "N") : value;

        setSelectedRowData((prevState) => ({
            ...prevState,
            [id]: newValue
        }));

        // If the field is a Payroll_Code, update the corresponding Pay_Rate field as well
        if (id.includes("Payroll_Code_")) {
            const labelIndex = id.split("_")[2];
            setSelectedRowData((prevState) => ({
                ...prevState,
                [`Pay_Rate_${labelIndex}`]:
                payItems.find((item) => item.EarningsRateID === value)?.RatePerUnit ||
                "",
            }));
        }
    };

    const labels = labelsData.labels;

    const defaultPayrollCode = "Select Payroll Code"; // You can replace this with your default payroll code value

    const handlePayrollCodeChange = (event, labelIndex) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    // Fetch payroll code labels
    const getPayRollCode = async () => {
        console.log("Fetching payroll codes...");
        try {
            const data = await fetchData("/api/getPayRollCode", window.location.href);
            console.log("Payroll Data:", data);
            setPayrollData(data.data);
        } catch (err) {
            console.log("Error fetching payroll codes:", err);
        }
    };

    useEffect(() => {
        getPayRollCode();
    }, []);

    // Extract payroll labels from payroll data
    useEffect(() => {
        if (payRollData) {
            const labelsArray = [];
            for (let i = 1; i <= 70; i++) {
                const key = `LabelPayrollCode_${i}`;
                labelsArray.push(payRollData[key] || `Pay Rate (${i})`);
            }
            setPayRollLabels(labelsArray);
        }
    }, [payRollData]);

    const getServiceCategory = async () => {
        try {
            const serviceCategory = await fetchData("api/getServiceCategory");
            if (serviceCategory && serviceCategory.data) {
                setServiceCategory(serviceCategory.data);
                console.log("serviceCategory", serviceCategory.data);
            } else {
                console.error("Unexpected data format:");
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };

    const getExpenses = async () => {
        try {
            const expensesCategory = await fetchData("api/getExpenses");
            if (expensesCategory && expensesCategory.data) {
                console.log("getExpenses", expensesCategory.data);
                setExpenseCategory(expensesCategory.data);
            } else {
                console.error("Unexpected data format:");
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };

    const getAllServicesType = async () => {
        try {
            const serviceType = await fetchData("api/getAllServicesType");
            if (serviceType && serviceType.data) {
                console.log("getAllServicesType", serviceType.data);
                setServiceType(serviceType.data);
            } else {
                console.error("Unexpected data format:");
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };

    const getAllShiftType = async () => {
        try {
            const shiftType = await fetchData("api/getAllShiftType");
            if (shiftType && shiftType.data) {
                console.log("getAllShiftType", shiftType.data);
                setShiftType(shiftType.data);
            } else {
                console.error("Unexpected data format:");
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        }
    };

    useEffect(() => {
        const fetchSecondaryData = async () => {
            try {
                const [
                    payRollCodeData,
                    serviceCategoryData,
                    expensesData,
                    serviceTypeData,
                    shiftTypeData,
                ] = await Promise.all([
                    getPayRollCode(),
                    getServiceCategory(),
                    getExpenses(),
                    getAllServicesType(),
                    getAllShiftType(),
                ]);
            } catch (error) {
                console.error("Error fetching secondary data:", error);
            }
        };

        fetchSecondaryData();
    }, []);

    return (
        <div className="min-h-screen  gradient-background">
            <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
                {/* Top Buttons */}
                {servicesData && (
                    <CustomAgGridDataTable2
                        title="Service"
                        primaryButton={{
                            label: "Add Service",
                            icon: <PlusCircle className="h-4 w-4"/>,
                            onClick: () => setShowForm(true),
                            // disabled: disableSection,
                        }}
                        rows={servicesData.data || {}}
                        columns={columns}
                        rowSelected={handleSelectRowClick}
                        handleRowUnselected={handleRowUnselected}
                    />
                )}
                <div className="flex flex-wrap items-center gap-4 mt-8 mb-8">
                    <button
                        onClick={() => {
                        }}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <FileText className="h-4 w-4"/>
                        <span>Audit Trail</span>
                    </button>
                    <button
                        onClick={() => {
                        }}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <BookIcon className="h-4 w-4"/>
                        <span>All Services</span>
                    </button>
                    <button
                        onClick={() => {
                        }}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <Layers className="h-4 w-4"/>
                        <span>NDIS Support Catalogue</span>
                    </button>
                    <button
                        onClick={() => {
                        }}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <FileCheck className="h-4 w-4"/>
                        <span>Award Payroll Matrix</span>
                    </button>
                    <button
                        onClick={fetchXeroAccounts}
                        disabled={disableSection}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                    >
                        <Database className="h-4 w-4"/>
                        <span>Sync Xero Invoice Items</span>
                    </button>
                    <button
                        onClick={fetchXeroPayItems}
                        disabled={disableSection}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                    >
                        <DollarSign className="h-4 w-4"/>
                        <span>Sync Xero Pay Items</span>
                    </button>
                    <button
                        onClick={fetchXeroContacts}
                        disabled={disableSection}
                        className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className="h-4 w-4"/>
                        <span>Sync Contacts</span>
                    </button>
                </div>

                {/* <Grid container spacing={3} ref={scrollRef}> */}
                {/* First Form */}
                <Grid item xs={12} md={4}>
                    <Box
                        className="glass"
                        sx={{
                            // backgroundColor: "white",
                            borderRadius: "15px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            padding: "20px",
                            // // minHeight: "500px",
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Service_Code"
                                    label="Service Code"
                                    value={selectedRowData.Service_Code || ""}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Unit"
                                    label="Unit"
                                    value={selectedRowData.Unit || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <InputField
                                    id="Description"
                                    label="Description"
                                    value={selectedRowData.Description || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="NDIS_Support_Number"
                                    label="NDIS Support Number"
                                    value={selectedRowData.NDIS_Support_Number || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="NdisGstCode"
                                    label="NDIS GST Code"
                                    value={selectedRowData.NdisGstCode || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="NdisKm"
                                    type="select"
                                    label="NDIS Km"
                                    value={selectedRowData.NdisKm || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={[
                                        {value: "1", label: "NONE"},
                                        {value: "2", label: "Accounting Code 2"},
                                        {value: "3", label: "Accounting Code 3"},
                                        {value: "4", label: "Accounting Code 4"},
                                    ]}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="CentreCapitalCosts"
                                    type="select"
                                    label="Centre Capital Costs"
                                    value={selectedRowData.CentreCapitalCosts || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={cccServices.map((ccc) => ({
                                        value: ccc.Service_Code,
                                        label: ccc.Description,
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Reference1"
                                    label="Reference 1"
                                    value={selectedRowData.Reference1 || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Reference2"
                                    label="Reference 2"
                                    value={selectedRowData.Reference2 || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id="Is_Sleepover"
                                            // The checkbox is checked only if the state value is "Y"
                                            checked={selectedRowData.Is_Sleepover === "Y"}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            sx={{"& .MuiSvgIcon-root": {fontSize: 18}}}
                                        />
                                    }
                                    label="Is Sleepover / Fixed Fee"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            id="GST"
                                            checked={selectedRowData.GST === "Y"}
                                            onChange={handleInputChange}
                                            disabled={disableSection}
                                            sx={{"& .MuiSvgIcon-root": {fontSize: 18}}}
                                        />
                                    }
                                    label="GST"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                type="checkbox"
                                                id="IsActive"
                                                // Only check if the value is "Y"
                                                checked={selectedRowData.IsActive === "Y"}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                                sx={{"& .MuiSvgIcon-root": {fontSize: 18}}}
                                            />
                                        }
                                        label="IsActive"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                type="checkbox"
                                                id="DeleteStatus"
                                                checked={selectedRowData.DeleteStatus === "Y"}
                                                onChange={handleInputChange}
                                                disabled={disableSection}
                                                sx={{"& .MuiSvgIcon-root": {fontSize: 18}}}
                                            />
                                        }
                                        label="Delete"
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Second Form */}
                <Grid item xs={12} md={4}>
                    <Box
                        className="glass"
                        sx={{
                            marginTop: "1.5rem",
                            // backgroundColor: "white",
                            borderRadius: "15px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            padding: "20px",
                            // minHeight: "500px",
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Charge_Rate_1"
                                    label="Charge Rate ($)"
                                    value={selectedRowData.Charge_Rate_1 || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Charge_Rate_2"
                                    label="Charge Rate 2 ($)"
                                    value={selectedRowData.Charge_Rate_2 || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Charge_Rate_3"
                                    label="Charge Rate 3 ($)"
                                    value={selectedRowData.Charge_Rate_3 || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="ServiceCategory"
                                    type="select"
                                    label="Service Category"
                                    value={selectedRowData.ServiceCategory || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={serviceCategory.map((serv) => ({
                                        value: serv.Code,
                                        label: serv.Description,
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="Accounting_Code"
                                    type="select"
                                    label="Accounting Code"
                                    value={selectedRowData.Accounting_Code || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={
                                        payItems &&
                                        payItems.map((item) => ({
                                            value: item.EarningsRateID,
                                            label: item.Name,
                                        }))
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="ExpenseCategory"
                                    type="select"
                                    label="Expense Category"
                                    value={selectedRowData.ExpenseCategory || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={expenseCategory.map((expense) => ({
                                        value: expense.ID,
                                        label: expense.Category,
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="ServiceType"
                                    type="select"
                                    label="Service Type"
                                    value={selectedRowData.ServiceType || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={serviceType.map((sType) => ({
                                        value: sType.id,
                                        label: sType.service_name,
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    id="ShiftType"
                                    type="select"
                                    label="Shift Type"
                                    value={selectedRowData.ShiftType || ""}
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                    options={shiftType.map((sType) => ({
                                        value: sType.id,
                                        label: sType.shift_name,
                                    }))}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Third Form with Tabs */}
                <Grid item xs={12} md={4}>
                    <Box
                        className="glass"
                        sx={{
                            marginTop: "1.5rem",
                            // backgroundColor: "white",
                            borderRadius: "15px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            padding: "20px",
                            // minHeight: "500px",
                        }}
                    >
                        <Tabs
                            value={tabIndex}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{marginBottom: 2}}
                        >
                            {tabLabels.map((label, index) => (
                                //    <MButton
                                //    className={styles.MaintBtn}
                                //    sx={{
                                //      backgroundColor: "blue",
                                //      "&:hover": {
                                //        backgroundColor: "blue", // Replace this with your desired hover color
                                //      },
                                //    }}
                                //    label={label}
                                //    key={index}
                                //  variant="contained"
                                //  color="primary"
                                //  disabled={disableSection}
                                //  onClick={() => setShowForm(true)}
                                //  size="small"
                                //  />
                                //
                                <Tab label={label} key={index}/>
                                //
                            ))}
                        </Tabs>

                        {tabLabels.map((_, tabIdx) => (
                            <div
                                role="tabpanel"
                                hidden={tabIndex !== tabIdx}
                                key={tabIdx}
                                id={`tabpanel-${tabIdx}`}
                            >
                                {tabIndex === tabIdx && (
                                    <Grid container spacing={2}>
                                        {payRollLabels
                                            .slice(
                                                tabIdx * fieldsPerTab,
                                                tabIdx * fieldsPerTab + fieldsPerTab
                                            )
                                            .map((label, index) => {
                                                const globalIndex = tabIdx * fieldsPerTab + index;
                                                return (
                                                    <Grid
                                                        container
                                                        item
                                                        xs={12}
                                                        key={globalIndex}
                                                        spacing={2}
                                                    >
                                                        <Grid item xs={12} sm={6}>
                                                            <InputField
                                                                id={`Pay_Rate_${globalIndex + 1}`}
                                                                label={label}
                                                                // label={`Pay_Rate_${globalIndex + 1}`}
                                                                value={
                                                                    selectedRowData[
                                                                        `Pay_Rate_${globalIndex + 1}`
                                                                        ] || ""
                                                                }
                                                                onChange={handleInputChange}
                                                                disabled={disableSection}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <InputField
                                                                id={`Payroll_Code_${globalIndex + 1}`}
                                                                type="select"
                                                                label={`Payroll Code (${globalIndex + 1})`}
                                                                value={
                                                                    selectedRowData[
                                                                        `Payroll_Code_${globalIndex + 1}`
                                                                        ] || ""
                                                                }
                                                                onChange={handleInputChange}
                                                                disabled={disableSection}
                                                                options={[
                                                                    {value: "", label: "Select Payroll Code"},
                                                                    ...payItems.map((item) => ({
                                                                        value: item.EarningsRateID,
                                                                        label: item.Name,
                                                                    })),
                                                                ]}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                );
                                            })}
                                    </Grid>
                                )}
                            </div>
                        ))}
                    </Box>
                </Grid>
                {/* </Grid> */}

                {/* Add Service Button */}

                {/* Data Table */}
                <div className="flexitems-center justify-center  gap-4 mt-8">
                    <button
                        onClick={() => {
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        <span>Back</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={disableSection}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Save className="h-4 w-4"/>
                        <span>Save Services</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateServices;