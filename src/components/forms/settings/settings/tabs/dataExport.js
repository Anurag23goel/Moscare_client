import React, {useEffect, useState} from "react";
import {Box, Button, Card, Checkbox, FormControlLabel, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import styles from "../../../../../styles/settings.module.css"; // Assuming you use a separate CSS module
import {Col, Row} from "react-bootstrap";
import MButton from "@/components/widgets/MaterialButton";
import InfoIcon from "@mui/icons-material/Info";
import {fetchData, postData, putData} from "@/utility/api_utility";
import style from "@/styles/style.module.css";

const DataExport = () => {
    const [AccountingSoftware, setAccountingSoftware] = useState({
        invoice_export: "",
        timesheet_export: "",
        invoice_prefix: "",
        next_invoice_no: "",
        invoice_length: "",
        sleepover_export_type: "",
        charge_client_for_break_time: "",
        group_invoices_by_export_type: false,
        group_invoice_by_1: "",
        group_invoice_by_2: "",
        group_purchase_order: false,
        xero_myob_journal_memo: "",
        qbo_sage_intacct_memo: "",
        xero_reckon_one_invoice_reference: "",
        expenses_invoice_xero_description: "",
        expenses_invoice_xero_reference: "",
        shift_cancelled_message_on_data_export: "",
    });
    const [isExistsAccountingSoftware, setIsExistsAccountingSoftware] = useState(false);
    const [isExistsXero, setIsExistsXero] = useState(false);
    const [isExistsTravelAndAward, setIsExistsTravelAndAward] = useState(false);
    // Generic handleChange function for select and text fields
    const handleAccountingSoftware = (e) => {
        const {name, value, type, checked} = e.target;
        setAccountingSoftware((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    //const {colors} = useContext(ColorContext)

    // Handling Xero
    const [xero_inputs, setXeroInputs] = useState({
        ReckonOneAPIgst_code: "",
        ReckonOneAP_gst_free_code: "",
        ReckonOneAP_KM_Charge_Desc: "",
        ReckonOneAPI_Km_Payroll_desc: "",
        Xero_line_amount_type: "",
        Xero_km_gst: "",
        Xero_purchase_gst_code: "",
        Xero_invoice_days: "",
        Xero_Km_payType: "",
        Xero_invoice_tracking: false,
        Xero_Use_GST: false,
        Xero_category1_name: "",
        Xero_category1_link_field: "",
        Xero_category2_name: "",
        Xero_category2_link_field: "",
    });

    // Handler for xero_inputs inputs
    const handleXeroInputs = (event) => {
        const {name, value, type, checked} = event.target;
        setXeroInputs((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    // Handling travel award
    const [travelAndAward, setTravelAndAward] = useState({
        Travel_desc_labour_cost_time: '',
        Travel_desc_nonLabour_cost: '',
        Award_interpreter: false,
        Award_awardHours: '',
        Award_export_award: '',
        Award_brokenShift: '',
        Award_useThreshold_travel_time: ''
    });

    const handletravelAndAward = (e) => {
        const {name, value, type, checked} = e.target;
        setTravelAndAward((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? checked : value
        }));
    };


    const handleSubmitAll = async () => {
        try {
            // AccountingSoftware
            if (!isExistsAccountingSoftware) {
                console.log("Submitting AccountingSoftware data:", AccountingSoftware);
                const accountingResponse = await postData(`/api/postDataExportsAccSoftware`, AccountingSoftware);
                console.log("AccountingSoftware data submitted successfully:", accountingResponse);
                setIsExistsAccountingSoftware(true)
            } else {
                console.log("Updating AccountingSoftware data:", AccountingSoftware);
                const accountingResponse = await putData(`/api/updateDataExportsAccSoftware`, AccountingSoftware);
                console.log("AccountingSoftware data updated successfully:", accountingResponse);
            }

            // Xero
            if (!isExistsXero) {
                console.log("Submitting Xero data:", xero_inputs);
                const xeroResponse = await postData(`/api/postDataExportsXero`, xero_inputs);
                console.log("Xero data submitted successfully:", xeroResponse);
                setIsExistsXero(true)
            } else {
                console.log("Updating Xero data:", xero_inputs);
                const xeroResponse = await putData(`/api/updateDataExportsXero`, xero_inputs);
                console.log("Xero data updated successfully:", xeroResponse);
            }

            // TravelAndAward
            if (!isExistsTravelAndAward) {
                console.log("Submitting TravelAndAward data:", travelAndAward);
                const travelAndAwardResponse = await postData(`/api/postDataExportsTravelAndAward`, travelAndAward);
                console.log("TravelAndAward data submitted successfully:", travelAndAwardResponse);
                setIsExistsTravelAndAward(true)
            } else {
                console.log("Updating TravelAndAward data:", travelAndAward);
                const travelAndAwardResponse = await putData(`/api/updateDataExportsTravelAndAward`, travelAndAward);
                console.log("TravelAndAward data updated successfully:", travelAndAwardResponse);
            }

        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };


    const fetchDataExportsAccSoftware = async () => {
        try {
            const response = await fetchData('/api/fetchDataExportsAccSoftware');
            const data = response.data;
            console.log("fetchDataExportsAccSoftware : ", response)
            if (response.success && response.data) {
                console.log("fetchDataExportsAccSoftware : ", data)
                // Data exists in DB, so update the state accordingly
                setIsExistsAccountingSoftware(true);
                setAccountingSoftware({
                    invoice_export: data.invoice_export || "",
                    timesheet_export: data.timesheet_export || "",
                    invoice_prefix: data.invoice_prefix || "",
                    next_invoice_no: data.next_invoice_no || "",
                    invoice_length: data.invoice_length || "",
                    sleepover_export_type: data.sleepover_export_type || "",
                    charge_client_for_break_time: data.charge_client_for_break_time || "",
                    group_invoices_by_export_type: data.group_invoices_by_export_type || false,
                    group_invoice_by_1: data.group_invoice_by_1 || "",
                    group_invoice_by_2: data.group_invoice_by_2 || "",
                    group_purchase_order: data.group_purchase_order || false,
                    xero_myob_journal_memo: data.xero_myob_journal_memo || "",
                    qbo_sage_intacct_memo: data.qbo_sage_intacct_memo || "",
                    xero_reckon_one_invoice_reference: data.xero_reckon_one_invoice_reference || "",
                    expenses_invoice_xero_description: data.expenses_invoice_xero_description || "",
                    expenses_invoice_xero_reference: data.expenses_invoice_xero_reference || "",
                    shift_cancelled_message_on_data_export: data.shift_cancelled_message_on_data_export || "",
                }); // Set the fetched data
            } else {
                // Data not found, set state to false
                setIsExistsAccountingSoftware(false);
                setAccountingSoftware({});  // Or keep empty/default values if data is not found
            }
        } catch (err) {
            console.log(err);
            setIsExistsAccountingSoftware(false);  // Set as false in case of error
        }
    };


    const fetchDataExportsXero = async () => {
        try {
            const response = await fetchData('/api/fetchDataExportsXero')
            const data = response.data;
            console.log("fetchDataExportsXero : ", data);
            if (response.success && response.data) {
                setIsExistsXero(true)
                setXeroInputs({
                    ReckonOneAPIgst_code: data.ReckonOneAPIgst_code || "",
                    ReckonOneAP_gst_free_code: data.ReckonOneAP_gst_free_code || "",
                    ReckonOneAP_KM_Charge_Desc: data.ReckonOneAP_KM_Charge_Desc || "",
                    ReckonOneAPI_Km_Payroll_desc: data.ReckonOneAPI_Km_Payroll_desc || "",
                    Xero_line_amount_type: data.Xero_line_amount_type || "",
                    Xero_km_gst: data.Xero_km_gst || "",
                    Xero_purchase_gst_code: data.Xero_purchase_gst_code || "",
                    Xero_invoice_days: data.Xero_invoice_days || "",
                    Xero_Km_payType: data.Xero_Km_payType || "",
                    Xero_invoice_tracking: data.Xero_invoice_tracking || false,
                    Xero_Use_GST: data.Xero_Use_GST || false,
                    Xero_category1_name: data.Xero_category1_name || "",
                    Xero_category1_link_field: data.Xero_category1_link_field || "",
                    Xero_category2_name: data.Xero_category2_name || "",
                    Xero_category2_link_field: data.Xero_category2_link_field || "",
                });
            } else {
                // Data not found, set state to false
                setIsExistsXero(false);
                setXeroInputs({});  // Or keep empty/default values if data is not found
            }

        } catch (err) {
            console.log(err)
            setIsExistsXero(false)
        }
    }


    const fetchDataExportsTravelAndAward = async () => {
        try {
            const response = await fetchData('/api/fetchDataExportsTravelAndAward');
            const data = response.data;
            console.log("fetchDataExportsTravelAndAward: ", response);
            if (response.success && response.data) {
                setIsExistsTravelAndAward(true)
                setTravelAndAward({
                    Travel_desc_labour_cost_time: data.Travel_desc_labour_cost_time || "",
                    Travel_desc_nonLabour_cost: data.Travel_desc_nonLabour_cost || "",
                    Award_interpreter: data.Award_interpreter || false,
                    Award_awardHours: data.Award_awardHours || "",
                    Award_export_award: data.Award_export_award || "",
                    Award_brokenShift: data.Award_brokenShift || "",
                    Award_useThreshold_travel_time: data.Award_useThreshold_travel_time || "",
                });
            } else {
                setIsExistsTravelAndAward(false)
                setTravelAndAward({})
            }
        } catch (err) {
            setIsExistsTravelAndAward(false)
            console.log("Error fetching data:", err);
        }
    };


    useEffect(() => {
        fetchDataExportsAccSoftware()
        fetchDataExportsXero()
        fetchDataExportsTravelAndAward()
    }, []);

    const timeSheetData = [
        "XERO2/ KeyPay",
        "MYOB AccountRight",
        "No",
        "MYOB_API",
        "MYOB Advanced",
        "RECKON_API",
        "RECKON Desktop",
        "RECKON ONE",
        "Attache",
        "Microkeeper",
        "MicroPay",
        'ADP',
        'ELMO',
        'Roubler'
    ];


    const gstCode = [
        "BAS Excluded (0%)",
        "KM Payroll",
        "GST Free Expenses (0%)",
        "GST Free Income (0%)",
        "[date] [wo",
        "GST on Expenses (10%)",
        "GST on Imports (0%)",
        "GST on Income (10%)"
    ];

    const Category_1 = [
        "Area",
        "Client Funding Type",
        "Worker Name",
        "Client Division",
        "Client Type",
        "Service Type",
        "Service Reference 1",
        "Agreement Type",
        "Agreement Reference 1",
        "Category 2"
    ];

    const Category_2 = [
        "Agreement Type",
        "Agreement Reference 1",
        "Area",
        "Client Division",
        "Client Funding Type",
        "Client Name",
        "Client Type",
        "Service Type",
        "Service Reference 1",
        "Worker Division Description",
        "Worker Name"
    ];


    return (
        <div className={styles.financeContainer}>
            <div className={styles.header}>
                <Button variant="contained" color="primary" size="small" sx={{
                    backgroundColor: "blue",
                    ":hover": {
                        backgroundColor: "blue", // Prevent hover effect
                    },
                }} className={style.maintenanceBtn} onClick={() => handleSubmitAll()}>
                    Save
                </Button>
            </div>
            <Row>
                <Col md={6}>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Accounting Software</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Invoice Export"
                                        name="invoice_export"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={AccountingSoftware.invoice_export}
                                        onChange={handleAccountingSoftware}
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="XERO2">XERO2</MenuItem>
                                        <MenuItem value="MYOB AccountRight">MYOB AccountRight</MenuItem>
                                        <MenuItem value="MYOB_API">MYOB_API</MenuItem>
                                        <MenuItem value="MYOB Advanced">MYOB Advanced</MenuItem>
                                        <MenuItem value="RECKON_API">RECKON_API</MenuItem>
                                        <MenuItem value="RECKON Desktop">RECKON Desktop</MenuItem>
                                        <MenuItem value="RECKON One">RECKON One</MenuItem>
                                        <MenuItem value="Quick Books">Quick Books</MenuItem>
                                        <MenuItem value="Attache">Attache</MenuItem>
                                        <MenuItem value="Sage intact">Sage intact</MenuItem>
                                    </TextField>
                                </Col>

                                <Col>
                                    <TextField
                                        label="Timesheet Export"
                                        name="timesheet_export"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={AccountingSoftware.timesheet_export}
                                        onChange={handleAccountingSoftware}
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        {timeSheetData.map((item, index) => (
                                            <MenuItem key={index} value={item}>{item}</MenuItem>
                                        ))}
                                    </TextField>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <MButton
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        className={styles.saveButton}
                                        backgroundColor={"blue"}
                                        label={"Show connected org details"}
                                    />

                                    <MButton
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        className={styles.saveButton}
                                        backgroundColor={"blue"}
                                        label={"Disconnect Xero"}
                                    />

                                    <MButton
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        className={styles.saveButton}
                                        backgroundColor={"blue"}
                                        label={"Clear Xero Token"}
                                    />

                                    <MButton
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        className={styles.saveButton}
                                        backgroundColor={"blue"}
                                        label={"KeyPay Connection"}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-2">
                                <Col>
                                    <TextField
                                        label="Invoice Prefix"
                                        name="invoice_prefix"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.invoice_prefix}
                                        onChange={handleAccountingSoftware}
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        label="Next Invoice No"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.next_invoice_no}
                                        onChange={handleAccountingSoftware}
                                        name="next_invoice_no"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        label="Invoice Length"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.invoice_length}
                                        onChange={handleAccountingSoftware}
                                        name="invoice_length"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        select
                                        label="Sleepover Export Type"
                                        fullWidth
                                        value={AccountingSoftware.sleepover_export_type}
                                        onChange={handleAccountingSoftware}
                                        name="sleepover_export_type"
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="PER SHIFT">PER SHIFT</MenuItem>
                                        <MenuItem value="PER UNIT">PER UNIT</MenuItem>
                                    </TextField>
                                </Col>
                                <Col>
                                    <TextField
                                        select
                                        label="Charge Client for Break Time"
                                        fullWidth
                                        value={AccountingSoftware.charge_client_for_break_time}
                                        onChange={handleAccountingSoftware}
                                        name="charge_client_for_break_time"
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="Yes">Yes</MenuItem>
                                        <MenuItem value="No">No</MenuItem>
                                    </TextField>
                                </Col>

                                <FormControlLabel
                                    sx={{paddingTop: "1rem"}}
                                    control={
                                        <Checkbox
                                            checked={AccountingSoftware.group_invoices_by_export_type}
                                            onChange={handleAccountingSoftware}
                                            name="group_invoices_by_export_type"
                                        />
                                    }
                                    label="Group Invoices by Export "
                                    className={styles.formControl}
                                />

                                <Col className="mt-2">
                                    <TextField
                                        select
                                        label="Group Invoice By 1"
                                        fullWidth
                                        value={AccountingSoftware.group_invoice_by_1}
                                        onChange={handleAccountingSoftware}
                                        name="group_invoice_by_1"
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="Client Code">Client Code</MenuItem>
                                        <MenuItem value="Client Accounting Code">Client Accounting Code</MenuItem>
                                        <MenuItem value="Payer">Payer</MenuItem>
                                    </TextField>
                                </Col>

                                <Col className="mt-2">
                                    <TextField
                                        select
                                        label="Group Invoice By 2"
                                        fullWidth
                                        value={AccountingSoftware.group_invoice_by_2}
                                        onChange={handleAccountingSoftware}
                                        name="group_invoice_by_2"
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="Client Code">Client Code</MenuItem>
                                        <MenuItem value="Client Accounting Code">Client Accounting Code</MenuItem>
                                        <MenuItem value="Payer">Payer</MenuItem>
                                    </TextField>
                                </Col>

                                {/* <FormControlLabel
                  control={<Checkbox checked />}
                  label="Group Purchase Order"
                  className={styles.formControl}
                /> */}

                                <FormControlLabel
                                    sx={{paddingTop: "1rem"}}
                                    control={
                                        <Checkbox
                                            checked={AccountingSoftware.group_purchase_order}
                                            onChange={handleAccountingSoftware}
                                            name="group_purchase_order"
                                        />
                                    }
                                    label="Group Purchase Order"
                                    className={styles.formControl}
                                />

                                {/* <Divider className={styles.divider} /> */}

                                <Col className="mt-2">
                                    <TextField
                                        label="XERO / MYOB Journal Memo / QBO Memo / Sage Intacct Memo / Reckon One Invoice Description"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.xero_myob_journal_memo}
                                        onChange={handleAccountingSoftware}
                                        name="xero_myob_journal_memo"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{color: "gray"}}
                                >
                                    Default: Client name and date of service
                                </Typography>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong> Valid Tags:</strong>
                                    Shift fields: [worker], [date], [starttime], [endtime],
                                    [code], [NDISSupportNumber], [ClaimType], [desc], [period],
                                    [category_code], [category_desc] Agreement Fields:
                                    [Reference1], [Reference2], [Reference3] Client fields:
                                    [client], [NDISNo], [ClientNo], [DVA], [TRN], [WSM], [REH],
                                    [CouncilReference], [MyAgedCareReference], [BillingPref]
                                </Typography>
                                {/* <Divider className={styles.divider} /> */}

                                <Col className="mt-2">
                                    <TextField
                                        label="Fixed Fee Invoice Description / Journal Memo Format (XERO and MYOB only) / Sage Intacct Memo"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.qbo_sage_intacct_memo}
                                        onChange={handleAccountingSoftware}
                                        name="qbo_sage_intacct_memo"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    Default: Client name and date of service
                                </Typography>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong> Valid Tags:</strong>
                                    Same as above
                                </Typography>

                                {/* <Divider className={styles.divider} /> */}
                                <Col className="mt-2">
                                    <TextField
                                        label="XERO / Sage Intacct Memo / Reckon One Invoice Reference"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.xero_reckon_one_invoice_reference}
                                        onChange={handleAccountingSoftware}
                                        name="xero_reckon_one_invoice_reference"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong> Valid Tags:</strong>
                                    Shift Fields: [period], [date], [starttime], [endtime],
                                    [InvoiceNumber] Agreement Fields: [Reference1], [Reference2],
                                    [Reference3] Client Fields: [client], [Address1], [Address2],
                                    [Suburb], [State], [Postcode], [NDISNo], [ClientNo], [DVA],
                                    [TRN], [WSM], [REH], [CouncilReference],
                                    [MyAgedCareReference], [BillingPref]
                                </Typography>

                                {/* <Divider className={styles.divider} /> */}

                                <Col className="mt-2">
                                    <TextField
                                        label="Expenses Invoice (XERO Description / MYOB Description)"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.expenses_invoice_xero_description}
                                        onChange={handleAccountingSoftware}
                                        name="expenses_invoice_xero_description"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong> Valid Tags:</strong>
                                    [client], [Address1], [Address2], [Suburb], [State],
                                    [Postcode], [NDISNo], [date], [desc], [InvoiceNo], [supplier],
                                    [note], [ClientType]
                                </Typography>

                                {/* <Divider className={styles.divider} /> */}

                                <Col className="mt-2">
                                    <TextField
                                        label="Expenses Invoice (XERO Reference / MYOB Journal)"
                                        variant="outlined"
                                        fullWidth
                                        value={AccountingSoftware.expenses_invoice_xero_reference}
                                        onChange={handleAccountingSoftware}
                                        name="expenses_invoice_xero_reference"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong> Valid Tags:</strong>
                                    [client], [Address1], [Address2], [Suburb], [State],
                                    [Postcode], [NDISNo], [date], [desc], [InvoiceNo], [supplier],
                                    [note], [ClientType]
                                </Typography>

                                {/* <Divider className={styles.divider} /> */}

                                <Col className="mt-2">
                                    <TextField
                                        label="Shift cancelled message on data export"
                                        variant="outlined"
                                        fullWidth
                                        value={
                                            AccountingSoftware.shift_cancelled_message_on_data_export
                                        }
                                        onChange={handleAccountingSoftware}
                                        name="shift_cancelled_message_on_data_export"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Typography
                                    className={styles.typo}
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    <strong>Valid Tags: [cancel_rate]</strong>
                                    This message will be shown appended to the above message when
                                    there is a cancelled shift with a charge associated with it.
                                </Typography>


                            </Row>
                        </div>
                    </Card>
                </Col>

                <Col>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>
                                XERO / MYOB API / Sage Intacct / Reckon One API
                            </Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="GST Code"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={xero_inputs.ReckonOneAPIgst_code}
                                        onChange={handleXeroInputs}
                                        name="ReckonOneAPIgst_code"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        {gstCode.map((item, index) => (
                                            <MenuItem key={index} value={item}>{item}</MenuItem>
                                        ))}
                                    </TextField>
                                </Col>
                                <Col>
                                    <TextField
                                        label="GST Free Code"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={xero_inputs.ReckonOneAP_gst_free_code}
                                        onChange={handleXeroInputs}
                                        name="ReckonOneAP_gst_free_code"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        {gstCode.map((item, index) => (
                                            <MenuItem key={index} value={item}>{item}</MenuItem>
                                        ))}
                                    </TextField>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="KM Charge Description"
                                        variant="outlined"
                                        fullWidth
                                        value={xero_inputs.ReckonOneAP_KM_Charge_Desc}
                                        onChange={handleXeroInputs}
                                        name="ReckonOneAP_KM_Charge_Desc"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        label="KM Payroll Description"
                                        variant="outlined"
                                        fullWidth
                                        value={xero_inputs.ReckonOneAPI_Km_Payroll_desc}
                                        onChange={handleXeroInputs}
                                        name="ReckonOneAPI_Km_Payroll_desc"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    <Row>
                        <Col>
                            <Card className={styles.card}>
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>Provider Travel</Typography>
                                </div>
                                <div className={styles.cardContent}>
                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Description for Labour Costs (Time)"
                                                variant="outlined"
                                                fullWidth
                                                value={travelAndAward.Travel_desc_labour_cost_time}
                                                onChange={handletravelAndAward}
                                                name="Travel_desc_labour_cost_time"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col>
                                            <TextField
                                                label="Description for Non-Labour Costs"
                                                variant="outlined"
                                                fullWidth
                                                value={travelAndAward.Travel_desc_nonLabour_cost}
                                                onChange={handletravelAndAward}
                                                name="Travel_desc_nonLabour_cost"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Card className={styles.card}>
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>XERO</Typography>
                                </div>
                                <div className={styles.cardContent}>
                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Line Amount Types"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={xero_inputs.Xero_line_amount_type}
                                                onChange={handleXeroInputs}
                                                name="Xero_line_amount_type"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px", // Set a consistent height
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Tax Exclusive">Tax Exclusive</MenuItem>
                                                <MenuItem value="Tax Inclusive">Tax Inclusive</MenuItem>

                                            </TextField>
                                        </Col>

                                        <FormControlLabel
                                            sx={{paddingTop: "1rem", paddingBottom: "1.3rem"}}
                                            control={
                                                <Checkbox
                                                    checked={xero_inputs.Xero_Use_GST}
                                                    onChange={handleXeroInputs}
                                                    name="Xero_Use_GST"
                                                />
                                            }
                                            label="Xero Use GST (By ticking this, the GST codes will be used in data export. Otherwise, Xero uses the inventory item setting)"
                                            className={styles.formControl}
                                        />

                                        <Row>
                                            <Col className='mb-4'>
                                                <TextField
                                                    label="KM GST (If 'Xero Use GST' is ticked above)"
                                                    variant="outlined"
                                                    select
                                                    fullWidth
                                                    value={xero_inputs.Xero_km_gst}
                                                    onChange={handleXeroInputs}
                                                    name="Xero_km_gst"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px", // Set a consistent height
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="Same as Service">Same as Service</MenuItem>
                                                    <MenuItem value="Has Gst">Has Gst</MenuItem>
                                                    <MenuItem value="No Gst">No Gst</MenuItem>
                                                </TextField>
                                            </Col>
                                        </Row>

                                        <Col className='mb-4'>
                                            <TextField
                                                label="Purchase Xero GST Code"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={xero_inputs.Xero_purchase_gst_code}
                                                onChange={handleXeroInputs}
                                                name="Xero_purchase_gst_code"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px", // Set a consistent height
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                {gstCode.map((item, index) => (
                                                    <MenuItem key={index} value={item}>{item}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Col>

                                        {/* <Divider className={styles.divider} /> */}

                                        <Row>
                                            <Col className='mb-4'>
                                                <TextField
                                                    label="Xero Invoice Days"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={xero_inputs.Xero_invoice_days}
                                                    onChange={handleXeroInputs}
                                                    name="Xero_invoice_days"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px", // Set a consistent height
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                />
                                                <span>Use -1 to use the default in Xero</span>
                                            </Col>
                                        </Row>

                                        {/* <Divider className={styles.divider} /> */}

                                        <Row>
                                            <Col>
                                                <TextField
                                                    label="KM Pay Type"
                                                    variant="outlined"
                                                    select
                                                    fullWidth
                                                    value={xero_inputs.Xero_Km_payType}
                                                    onChange={handleXeroInputs}
                                                    name="Xero_Km_payType"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px", // Set a consistent height
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="Pay Item">Pay Item</MenuItem>
                                                    <MenuItem value="Reimbursement">Reimbursement</MenuItem>
                                                    <MenuItem value="50%">50%</MenuItem>
                                                </TextField>

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={xero_inputs.Xero_invoice_tracking}
                                                            onChange={handleXeroInputs}
                                                            name="Xero_invoice_tracking"
                                                        />
                                                    }
                                                    label="Use Xero Tracking - Invoicing"
                                                    className={styles.formControl}
                                                />
                                            </Col>
                                        </Row>

                                        {/* <Divider className={styles.divider} /> */}

                                        <Row
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                alignContent: "center",
                                            }}
                                        >
                                            <Row>
                                                <Col></Col>
                                                <Col>
                                                    <Typography
                                                        className={styles.typo}
                                                        variant="body2"
                                                        sx={{color: "gray"}}
                                                    >
                                                        Xero Category Name
                                                    </Typography>
                                                </Col>
                                                <Col>
                                                    <Typography
                                                        className={styles.typo}
                                                        variant="body2"
                                                        sx={{color: "gray"}}
                                                    >
                                                        Link to Field
                                                    </Typography>
                                                </Col>
                                            </Row>
                                            <Row
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    alignContent: "center",

                                                }}
                                            >
                                                <Col>
                                                    <Typography>Category 1</Typography>
                                                </Col>
                                                <Col md={4}>
                                                    <TextField
                                                        label=""
                                                        variant="outlined"
                                                        fullWidth
                                                        value={xero_inputs.Xero_category1_name}
                                                        onChange={handleXeroInputs}
                                                        name="Xero_category1_name"
                                                        className={styles.formControl}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px", // Set a consistent height
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    />
                                                </Col>

                                                <Col md={4}>
                                                    <TextField
                                                        label=""
                                                        variant="outlined"
                                                        select
                                                        fullWidth
                                                        value={xero_inputs.Xero_category1_link_field}
                                                        onChange={handleXeroInputs}
                                                        name="Xero_category1_link_field"
                                                        className={styles.formControl}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px", // Set a consistent height
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    >
                                                        {Category_1.map((item, index) => (
                                                            <MenuItem key={index} value={item}>{item}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Col>
                                            </Row>
                                            {/* <Divider className={styles.divider} /> */}
                                            <Row
                                                style={{
                                                    marginTop: "1rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    alignContent: "center",
                                                }}
                                            >
                                                <Col>
                                                    <Typography>Category 2</Typography>
                                                </Col>
                                                <Col md={4}>
                                                    <TextField
                                                        label=""
                                                        variant="outlined"
                                                        fullWidth
                                                        value={xero_inputs.Xero_category2_name}
                                                        onChange={handleXeroInputs}
                                                        name="Xero_category2_name"
                                                        className={styles.formControl}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px", // Set a consistent height
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    />
                                                </Col>

                                                <Col md={4}>
                                                    <TextField
                                                        label=""
                                                        variant="outlined"
                                                        select
                                                        fullWidth
                                                        value={xero_inputs.Xero_category2_link_field}
                                                        onChange={handleXeroInputs}
                                                        name="Xero_category2_link_field"
                                                        className={styles.formControl}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px", // Set a consistent height
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    >
                                                        {Category_2.map((item, index) => (
                                                            <MenuItem key={index} value={item}>{item}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Col>
                                            </Row>

                                        </Row>
                                    </Row>
                                    <Row className='mt-4'>
                                        <Col style={{gap: "8px"}}>
                                            <MButton
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                className={styles.saveButton_2}
                                                backgroundColor={"blue"}
                                                label={"Sync Contacts"}
                                            />

                                            <MButton
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                className={styles.saveButton_2}
                                                backgroundColor={"blue"}
                                                label={"Sync Invoice Items"}
                                            />

                                            <MButton
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                className={styles.saveButton_2}
                                                backgroundColor={"blue"}
                                                label={"Sync Employees"}
                                            />

                                            <MButton
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                className={styles.saveButton_2}
                                                backgroundColor={"blue"}
                                                label={"Sync Xero Pay Items"}
                                            />

                                            <MButton
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                className={styles.saveButton_2}
                                                backgroundColor={"blue"}
                                                label={"Sync Tax Rates"}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>

                        <Row>
                            <Col>
                                <Card className={styles.card}>
                                    <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                        <Typography variant="h6" color={"#fff"}>Award Interpreter</Typography>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={travelAndAward.Award_interpreter}
                                                    onChange={handletravelAndAward}
                                                    name="Award_interpreter"
                                                />
                                            }
                                            label="Award Interpreter Do not allow a shift to be created if there is over time"
                                            className={styles.formControl}
                                        />

                                        <Row>
                                            <Col>
                                                <TextField
                                                    label="Award Hours"
                                                    variant="outlined"
                                                    select
                                                    fullWidth
                                                    value={travelAndAward.Award_awardHours}
                                                    onChange={handletravelAndAward}
                                                    name="Award_awardHours"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px",
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="76%">76</MenuItem>
                                                    <MenuItem value="38%">38</MenuItem>
                                                </TextField>
                                            </Col>
                                            <Col>
                                                <TextField
                                                    label="Export award interpretation results to payroll software"
                                                    variant="outlined"
                                                    select
                                                    fullWidth
                                                    value={travelAndAward.Award_export_award}
                                                    onChange={handletravelAndAward}
                                                    name="Award_export_award"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px",
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="100%">Yes</MenuItem>
                                                    <MenuItem value="50%">No</MenuItem>
                                                </TextField>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <Tooltip
                                                    title="This is for reporting only. eg. 'Use Rosters' in the award report. Broken shift driven by timesheets when doing data export">
                                                    <TextField
                                                        label={
                                                            <>
                                                                Broken Shift Threshold
                                                                <InfoIcon
                                                                    fontSize="small"
                                                                    style={{marginLeft: 4}}
                                                                />
                                                            </>
                                                        }
                                                        variant="outlined"
                                                        fullWidth
                                                        value={travelAndAward.Award_brokenShift}
                                                        onChange={handletravelAndAward}
                                                        name="Award_brokenShift"
                                                        className={styles.formControl}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px",
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Col>

                                            <Col>
                                                <Tooltip
                                                    title="If time between shift is less than or equal to threshold, travel time will be filled by the gap when doing Calc KM in timesheets."> </Tooltip>
                                                <TextField
                                                    label={
                                                        <>
                                                            Use threshold to fill travel time
                                                            <InfoIcon
                                                                fontSize="small"
                                                                style={{marginLeft: 4}}
                                                            />
                                                        </>
                                                    }
                                                    variant="outlined"
                                                    select
                                                    fullWidth
                                                    value={
                                                        travelAndAward.Award_useThreshold_travel_time
                                                    }
                                                    onChange={handletravelAndAward}
                                                    name="Award_useThreshold_travel_time"
                                                    className={styles.formControl}
                                                    InputProps={{
                                                        sx: {
                                                            height: "43px",
                                                            borderRadius: "7px",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="YES">YES</MenuItem>
                                                    <MenuItem value="NO">NO</MenuItem>
                                                </TextField>

                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Row>
                </Col>
            </Row>
            <Box sx={{display: "flex", justifyContent: "right", alignItems: "center"}}>
                <Button variant="contained" sx={{
                    backgroundColor: "blue",
                    ":hover": {
                        backgroundColor: "blue", // Prevent hover effect
                    },
                }} className={style.maintenanceBtn} onClick={() => handleSubmitAll()}>Save</Button>
                {/* <Button variant = "contained" className={styles.saveButton_2} sx={{width:"300px"}}  onClick={() => update()}>Update</Button> */}
            </Box>
        </div>
    );
};

export default DataExport;
