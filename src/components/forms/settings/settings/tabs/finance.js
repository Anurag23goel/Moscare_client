import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@mui/material";
import styles from "../../../../../styles/settings.module.css"; // Assuming you use a separate CSS module
import {Col, Row} from "react-bootstrap";
import {fetchData, postData, putData} from "../../../../../utility/api_utility";
import style from "@/styles/style.module.css";

const Finance = () => {
    const [timeSheetData, setTimeSheetData] = useState({
        PayrollStartDate: "",
        PayrollCycleDays: "",
        DefaultCanCharge: "",
        LoadDataOnDataExport: "",
    });

    const handleTimeSheetData = (field, newValue) => {
        setTimeSheetData((prevState) => ({
            ...prevState,
            [field]: newValue,
        }));
    };

    // Initialize state to store the values of 48 payroll codes
    const [payLevels, setPayLevels] = useState(
        Array.from({length: 48}, (_, i) => ({
            label: `LabelPayrollCode_${i + 1}`,
            value: "",
        }))
    );

    const [errState, setErrState] = useState(
        Array(70).fill("") // Initially, no errors
    );

    // storing payroll data in db
    const submitPayrollData = async () => {
        // Transform payLevels to the required format
        const formattedData = payLevels.reduce((acc, item, index) => {
            acc[`LabelPayrollCode_${index + 1}`] = item.value;
            return acc;
        }, {});

        const dataToSend = {
            ...formattedData,
            ...timeSheetData,
        };

        // Add other fields as necessary
        console.log("payrolDaat ", dataToSend);
        try {
            const response = await postData(`/api/postPayLevelData`, dataToSend);
            console.log("Data submitted successfully:", response);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    // Function to handle the input change
    // const handleInputChange = (index, newValue) => {
    //   const updatedPayLevels = [...payLevels];
    //   updatedPayLevels[index].value = newValue;
    //   setPayLevels(updatedPayLevels);
    // };

    const handleInputChange = (index, newValue) => {
        // Regular expression for validation
        const regex = /^SCHADS (CL|PL|TL) \d{1,2}(\.\d+)?\(\$\)$/;

        const updatedPayLevels = [...payLevels];
        updatedPayLevels[index].value = newValue;

        // Validate the input
        const updatedErrState = [...errState];
        if (regex.test(newValue) || newValue === "") {
            updatedErrState[index] = ""; // Clear error if valid or empty
        } else {
            updatedErrState[index] =
                "Invalid format! Use this format: SCHADS CL|PL|TL 12.5($)";
        }

        setPayLevels(updatedPayLevels);
        setErrState(updatedErrState);
    };


    const [selectedPackageRate, setSelectedPackageRate] = useState("FlatRate");
    const [selectedCareRate, setSelectedCareRate] = useState("FlatRate");
    const [kmServiceDefault, setKmServiceDefault] = useState(false);
    const [workerName, setWorkerName] = useState("First Name");
    const [chargeCode, setChargeCode] = useState("");
    const [thresholdHours, setThresholdHours] = useState("");
    const [thresholdAmount, setThresholdAmount] = useState("");
    const [isExistingChargeExpense, setIsExistingChargeExpense] = useState(false)
    const [isExistingPayLevels, setIsExistingPayLevels] = useState(false)
    const [isExistingExpenseDesc, setIsExistingExpenseDesc] = useState(false)
    //const {colors} = useContext(ColorContext)

    const [maxPayLevels, setMaxPayLevels] = useState(70); // Max number of fields
    const [expenseDescription, setExpenseDescription] = useState({
        BasicDailyFee_Level1: "",
        BasicDailyFee_Level2: "",
        BasicDailyFee_Level3: "",
        BasicDailyFee_Level4: "",

        // Section 2: Package Management Fee
        PackageManagementFee_Type: "Flat Rate", // Default to 'Flat Rate'
        PackageManagementFee_Level1: "",
        PackageManagementFee_Level2: "",
        PackageManagementFee_Level3: "",
        PackageManagementFee_Level4: "",

        // Section 3: Care Management Fee
        CareManagementFee_Type: "Flat Rate", // Default to 'Flat Rate'
        CareManagementFee_Level1: "",
        CareManagementFee_Level2: "",
        CareManagementFee_Level3: "",
        CareManagementFee_Level4: "",

        // Section 4: Contingency Fund
        ContingencyFund_Level1: "",
        ContingencyFund_Level2: "",
        ContingencyFund_Level3: "",
        ContingencyFund_Level4: "",
        AddKMToServiceTotal: false,
        ShowWorkerName: false,
        MaxContingencyFund: "",

        // Section 5: Service Description
        ServiceDescription: "",
        InvoiceDesc: "",
        LabelExpenseS4: "",
        LabelExpenseS5: "",
        LabelExpenseS6: "",
        DefaultNote: "",
        DefaultUnspentFundNotice: "",
        BCCEmail: "",
        ExportManagementFeeRef: "",
        PackageManagementFeeChargeCode: "",
        PackageManagementFeeInvoiceDescription: "",
        PackageManagementFeeInvoiceReference: "",
        CareManagementFeeChargeCode: "",
        CareManagementFeeInvoiceDescription: "",
        CareManagementFeeInvoiceReference: "",
        ExportInvoiceToClientsRef: "",
        ITFInvoiceChargeCode: "",
        ITFInvoiceDescription: "",
        ITFInvoiceReference: "",
        TopUpInvoiceChargeCode: "",
        TopUpInvoiceDescription: "",
        TopUpInvoiceReference: "",
        BasicDailyFeeInvoiceChargeCode: "",
        BasicDailyFeeInvoiceDescription: "",
        BasicDailyFeeInvoiceReference: "",
        ExpenseS4InvoiceChargeCode: "",
        ExpenseS4InvoiceDescription: "",
        ExpenseS4InvoiceReference: "",
        ExpenseS5InvoiceChargeCode: "",
        ExpenseS5InvoiceDescription: "",
        ExpenseS5InvoiceReference: "",
    });

    const handleExpenseDescriptionChange = (e) => {
        const {name, value, type, checked} = e.target;
        setExpenseDescription((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const [chargeExpense, setChargeExpense] = useState({
        ChargeRate: "",
        ChargeCode: "",
        ExtraChargeToClientCode: "",
        ExpenseReimbursementCode: "",
        ExtraChargeMealCode: "",
        ExtraChargeTransportCode: "",
        SupplementCode: "",
        SupplementRate: "",
    });

    const handleInputChangeHours = (event) => {
        setThresholdHours(event.target.value);
        setThresholdAmount(event.target.value)
    };


    const handleSave = async () => {
        try {
            const data = {thresholdHours, thresholdAmount}; // Prepare the data to be sent
            const response = await postData("/api/upsertThresholdHours", data); // Make the API call
            console.log("API Response:", response); // Handle the response (e.g., success message, etc.)
        } catch (error) {
            console.error("Error saving threshold hours:", error); // Handle the error
        }
    };
    // Function to handle input changes
    const handleLevelChange = (type, index, value) => {
        const updatedLevels = {...planLevels};
        updatedLevels[type][index] = value;
        setPlanLevels(updatedLevels);
    };

    // Function to handle radio button changes for Package Management and Care Management Fee
    const handleRateChange = (type, value) => {
        setPlanLevels({...planLevels, [type]: value});
    };

    // handle charge Expense onchange
    const handleChargeExpense = (field, newValue) => {
        setChargeExpense((prevState) => ({
            ...prevState,
            [field]: newValue,
        }));
    };
    console.log("handleChargeExpense", chargeExpense);

    // post postChargeExpenseData data
    const postChargeExpenseData = async () => {
        try {
            const response = await postData(
                `/api/postChargeExpenseData`,
                chargeExpense
            );
            console.log("Data submitted successfully:", response);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    const postHomeCarePackages = async () => {
        console.log(expenseDescription);
        try {
            const response = await postData(
                `/api/postHomeCarePackages`,
                expenseDescription
            );
            console.log("Data submitted successfully:", response);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    // const handleSubmitAll = async () => {
    //   // Helper function to check if a state has any meaningful values
    //   const hasMeaningfulValues = (state, ignoreDefaults = []) =>
    //     Object.entries(state).some(
    //       ([key, value]) =>
    //         value !== "" && value !== false && !ignoreDefaults.includes(value)
    //     );

    //   // Specific checks for each state
    //   const isTimeSheetDataPopulated = hasMeaningfulValues(timeSheetData);
    //   const isPayLevelsPopulated = payLevels.some((level) => level.value !== "");
    //   const isExpenseDescriptionPopulated = hasMeaningfulValues(
    //     expenseDescription,
    //     ["Flat Rate"]
    //   );
    //   const isChargeExpensePopulated = hasMeaningfulValues(chargeExpense);

    //   // Collect API calls based on populated states
    //   const apiCalls = [];

    //   if (isTimeSheetDataPopulated || isPayLevelsPopulated) {
    //     apiCalls.push(submitPayrollData());
    //   }

    //   if (isExpenseDescriptionPopulated) {
    //     apiCalls.push(postHomeCarePackages());
    //   }

    //   if (isChargeExpensePopulated) {
    //     apiCalls.push(postChargeExpenseData());
    //   }

    //   // Execute all relevant API calls concurrently
    //   if (apiCalls.length > 0) {
    //     try {
    //       await Promise.all(apiCalls);
    //       console.log("All applicable data submitted successfully");
    //       alert("Data inserted successfully");
    //     } catch (error) {
    //       console.error("Error submitting data:", error);
    //     }
    //   } else {
    //     console.log("No changes detected, no data submitted");
    //   }
    // };

    const handleSubmitAll = async () => {
        try {
            // PayLevels
            const formattedData = payLevels.reduce((acc, item, index) => {
                acc[`LabelPayrollCode_${index + 1}`] = item.value;
                return acc;
            }, {});

            const dataToSend = {
                ...formattedData,
                ...timeSheetData,
            };
            if (!isExistingPayLevels) {
                console.log("Submitting payLevels data:", payLevels);
                const payLevelsResponse = await postData(`/api/postPayLevelData`, dataToSend);
                console.log("payLevels data submitted successfully:", payLevelsResponse);
                setIsExistingPayLevels(true)
            } else {
                console.log("Updating payLevels data:", payLevels);
                const payLevelsUpdateResponse = await putData(`/api/updatePayLevels`, dataToSend);
                console.log("payLevels data updated successfully:", payLevelsUpdateResponse);
            }

            // Charge Expense
            if (!isExistingChargeExpense) {
                console.log("Submitting Charge Expense data:", chargeExpense);
                const chargeExpenseResponse = await postData(`/api/postChargeExpenseData`, chargeExpense);
                console.log("Charge Expense data submitted successfully:", chargeExpenseResponse);
                setIsExistingChargeExpense(true)
            } else {
                console.log("Updating Charge Expense data:", chargeExpense);
                const chargeExpenseResponse = await putData(`/api/updateChargeExpenseData`, chargeExpense);
                console.log("Charge Expense data updated successfully:", chargeExpenseResponse);
            }

            // Expense Description
            if (!isExistingExpenseDesc) {
                console.log("Submitting Expense Description data:", expenseDescription);
                const expenseDescriptionResponse = await postData(`/api/postHomeCarePackages`, expenseDescription);
                console.log("expenseDescription data submitted successfully:", expenseDescriptionResponse);
                setIsExistingExpenseDesc(true)
            } else {
                console.log("Updating expenseDescription data:", expenseDescription);
                const expenseDescriptionResponse = await putData(`/api/updateHomeCarePackages`, expenseDescription);
                console.log("expenseDescription data updated successfully:", expenseDescriptionResponse);
            }

        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };


    const getPayRollCode = async () => {
        try {
            const response = await fetchData("/api/getPayRollCode");
            const payRollData = response?.data;
            console.log("payRollData", payRollData);

            if (response.success && payRollData) {
                setIsExistingPayLevels(true);

                // Initialize the updatedPayLevels array to ensure it supports up to 70 entries.
                const updatedPayLevels = Array.from({length: 70}, (_, index) => {
                    const label = `LabelPayrollCode_${index + 1}`;
                    const value = payRollData[label] || "";  // Set the value or empty string if not present
                    return {label, value};
                }).filter(item => item.value !== "");  // Filter out empty values

                setPayLevels(updatedPayLevels);

                setTimeSheetData((prevData) => ({
                    ...prevData,
                    PayrollStartDate: payRollData.PayrollStartDate || "",
                    PayrollCycleDays: payRollData.PayrollCycleDays || "",
                    DefaultCanCharge: payRollData.DefaultCanCharge || "",
                    LoadDataOnDataExport: payRollData.LoadDataOnDataExport || "",
                }));
            } else {
                setIsExistingPayLevels(false);
            }

            console.log("PayRollCode data set in payLevels:", payLevels);
        } catch (error) {
            setIsExistingPayLevels(false);
            console.error("Error fetching payroll data:", error);
        }
    };

    useEffect(() => {
        console.log("paylevels", payLevels)
    }, [payLevels])

    // const getPayRollCode = async () => {
    //   try {
    //     const response = await fetchData("/api/getPayRollCode");
    //     const payRollData = response?.data;

    //     if (response.success && payRollData) {
    //       setIsExistingPayLevels(true);

    //       // Set the extra fields (these are outside the payroll code fields)
    //       setTimeSheetData((prevData) => ({
    //                 ...prevData,
    //                 PayrollStartDate: payRollData.PayrollStartDate || "",
    //                 PayrollCycleDays: payRollData.PayrollCycleDays || "",
    //                 DefaultCanCharge: payRollData.DefaultCanCharge || "",
    //                 LoadDataOnDataExport: payRollData.LoadDataOnDataExport || "",
    //               }));

    //       // Set payroll code fields dynamically
    //       const updatedPayLevels = [...payLevels];

    //       let filledFields = 0;
    //       for (let i = 0; i < Math.min(payRollData.length, maxPayLevels); i++) {
    //         const key = `LabelPayrollCode_${i + 1}`;
    //         if (payRollData[key]) {
    //           updatedPayLevels[i] = { value: payRollData[key] };
    //           filledFields++;
    //         }
    //       }

    //       // Update payLevels to match the user input length
    //       setPayLevels(updatedPayLevels);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching payroll data:", error);
    //   }
    // };


    const getChargeExpenseData = async () => {
        try {
            const response = await fetchData(`/api/getChargeAndExpenses`);
            const data = response.data;
            console.log("getChargeExpenseData : ", response)
            if (response.success && response.data) {
                setIsExistingChargeExpense(true)
                setChargeExpense({
                    ExtraChargeToClientCode: data.ExtraChargeToClientCode || "",
                    ExtraChargeMealCode: data.ExtraChargeMealCode || "",
                    ExtraChargeTransportCode: data.ExtraChargeTransportCode || "",
                    ExpenseReimbursementCode: data.ExpenseReimbursementCode || "",
                    ChargeCode: data.ChargeCode || "",
                    ChargeRate: data.ChargeRate || "",
                    SupplementCode: data.SupplementCode || "",
                    SupplementRate: data.SupplementRate || "",
                });
            } else {
                setIsExistingChargeExpense(false)
            }
        } catch (err) {
            console.log(err)
            setIsExistingChargeExpense(false)
        }
    }


    const getHomeCarePackages = async () => {
        try {
            const response = await fetchData(`/api/getHomeCarePackages`);
            console.log("getHomeCarePackages : ", response)
            const data = response.data;
            if (response.success && response.data) {
                setIsExistingExpenseDesc(true)
                setExpenseDescription((prevState) => ({
                    ...prevState, // Preserve previous values
                    ...data, // Override with data from the response
                }));
            } else {
                setIsExistingExpenseDesc(false)
            }

        } catch (err) {
            console.log(err)
            setIsExistingExpenseDesc(false)
        }
    }

    const getThresholdHours = async () => {
        try {
            const response = await fetchData(`/api/getThresholdValues`);
            console.log("Threshold response", response)
            setThresholdHours(response.data.thresholdHours || "")
            setThresholdAmount(response.data.thresholdAmount || "")
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getPayRollCode();
        getChargeExpenseData()
        getHomeCarePackages()
        getThresholdHours()
    }, []);


    const AddMoreBtn = () => {
        if (payLevels.length < 70) {
            setPayLevels((prevPayLevels) => [
                ...prevPayLevels,
                {
                    label: `LabelPayrollCode_${prevPayLevels.length + 1}`,
                    value: "",
                },
            ]);
        }
    };


    return (
        <div className={styles.financeContainer}>
            {/* Block for Timesheets (left) */}
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
                <Col>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Timesheets</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Payroll Start Date"
                                        variant="outlined"
                                        fullWidth
                                        type="datetime-local"
                                        value={timeSheetData.PayrollStartDate}
                                        onChange={(e) =>
                                            handleTimeSheetData("PayrollStartDate", e.target.value)
                                        }
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
                                <Col>
                                    <TextField
                                        label="Payroll Cycle Days"
                                        variant="outlined"
                                        fullWidth
                                        value={timeSheetData.PayrollCycleDays}
                                        onChange={(e) =>
                                            handleTimeSheetData("PayrollCycleDays", e.target.value)
                                        }
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
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Default Cancellation Charge %"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={timeSheetData.DefaultCanCharge}
                                        onChange={(e) =>
                                            handleTimeSheetData("DefaultCanCharge", e.target.value)
                                        }
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="100%">100%</MenuItem>
                                        <MenuItem value="50%">50%</MenuItem>
                                    </TextField>
                                </Col>
                                <Col>
                                    <TextField
                                        label="Load Data on Data Export Page by Default"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={timeSheetData.LoadDataOnDataExport}
                                        onChange={(e) =>
                                            handleTimeSheetData(
                                                "LoadDataOnDataExport",
                                                e.target.value
                                            )
                                        }
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px", // Set a consistent height
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

                    {/* Block for Kilometre */}
                    <Card sx={{mt: 4}} className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Kilometre</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Max minutes between shifts"
                                        variant="outlined"
                                        fullWidth
                                        value="120"
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
                                        label="Max KM warning"
                                        variant="outlined"
                                        fullWidth
                                        value="50.00"
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

                            <FormControlLabel
                                control={<Checkbox checked/>}
                                label="Avoid Toll"
                            />
                        </div>
                    </Card>

                    {/* Pay Level Card */}
                    <Row>
                        <Col>
                            <Card sx={{mt: 2}} className={styles.card}>
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>Pay Levels</Typography>
                                </div>
                                <div className={styles.cardContent}>
                                    <Typography variant="body2" sx={{mb: 2}}>
                                        Please enter the pay levels for all 48 payroll codes below.
                                    </Typography>
                                    <Row>
                                        <Col>
                                            {/* All Pay Levels in a single column */}
                                            {payLevels.map((payLevel, index) => (
                                                <div key={index} style={{margin: "25px 0"}}>
                                                    <TextField
                                                        label={payLevel.label}
                                                        variant="outlined"
                                                        fullWidth
                                                        value={payLevel.value}
                                                        onChange={(e) =>
                                                            handleInputChange(index, e.target.value)
                                                        }
                                                        className={styles.formControl}
                                                        InputLabelProps={{shrink: true}}
                                                        InputProps={{
                                                            sx: {
                                                                height: "43px", // Set a consistent height
                                                                borderRadius: "7px",
                                                            },
                                                        }}
                                                    />
                                                    {/* Display error message if any */}
                                                    {errState[index] && (
                                                        <Typography
                                                            style={{color: "red", marginTop: "5px", fontSize: "14px"}}
                                                        >
                                                            {errState[index]}
                                                        </Typography>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Add More Button */}
                                            {payLevels.length < maxPayLevels && (
                                                <Button variant="contained" onClick={AddMoreBtn}
                                                        style={{backgroundColor: "blue"}}>
                                                    Add More
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col>
                    {/* Block for setting Threshold hours */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Threshold Hours</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <TextField
                                label="Enter Threshold Hours"
                                variant="outlined"
                                type="number"
                                value={thresholdHours}
                                fullWidth
                                className={styles.formControl}
                                onChange={(e) => setThresholdHours(e.target.value)}
                                InputProps={{
                                    sx: {
                                        height: "43px", // Set a consistent height
                                        borderRadius: "7px",

                                    },
                                }}
                            />
                            <TextField
                                label="Enter Threshold Amount"
                                variant="outlined"
                                type="number"
                                value={thresholdAmount}
                                fullWidth
                                className={styles.formControl}
                                onChange={(e) => setThresholdAmount(e.target.value)}
                                InputProps={{
                                    sx: {
                                        height: "43px", // Set a consistent height
                                        borderRadius: "7px",
                                    },
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    // marginTop: "10px",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    sx={{
                                        backgroundColor: "blue",
                                        ":hover": {
                                            backgroundColor: "blue", // Prevent hover effect
                                        },
                                    }} className={style.maintenanceBtn}
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Block for Charge & Expense */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Charge & Expense</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Extra Charge to Client Code"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.ExtraChargeToClientCode}
                                        onChange={(e) =>
                                            handleChargeExpense(
                                                "ExtraChargeToClientCode",
                                                e.target.value
                                            )
                                        }
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
                                        label="Expense Reimbursement Code"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.ExpenseReimbursementCode}
                                        onChange={(e) =>
                                            handleChargeExpense(
                                                "ExpenseReimbursementCode",
                                                e.target.value
                                            )
                                        }
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
                                        label="Extra Charge Meal Code"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.ExtraChargeMealCode}
                                        onChange={(e) =>
                                            handleChargeExpense("ExtraChargeMealCode", e.target.value)
                                        }
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
                                        label="Extra Charge Transport Code"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.ExtraChargeTransportCode}
                                        onChange={(e) =>
                                            handleChargeExpense(
                                                "ExtraChargeTransportCode",
                                                e.target.value
                                            )
                                        }
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
                                        label="First Aid Allowance Code"
                                        variant="outlined"
                                        type="text"
                                        fullWidth
                                        value={chargeExpense.ChargeCode}
                                        onChange={(e) =>
                                            handleChargeExpense("ChargeCode", e.target.value)
                                        }
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
                                        label="First Aid Allowance Rate"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.ChargeRate}
                                        onChange={(e) =>
                                            handleChargeExpense("ChargeRate", e.target.value)
                                        }
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
                                        label="Supplement Code (XERO Purchase Order)"
                                        variant="outlined"
                                        fullWidth
                                        value={chargeExpense.SupplementCode}
                                        onChange={(e) =>
                                            handleChargeExpense("SupplementCode", e.target.value)
                                        }
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
                                        label="Supplement Rate (XERO Purchase Order)"
                                        variant="outlined"
                                        type="number"
                                        fullWidth
                                        value={chargeExpense.SupplementRate}
                                        onChange={(e) =>
                                            handleChargeExpense("SupplementRate", e.target.value)
                                        }
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

                    {/* Main Card for Home Care Packages */}
                    <Row>
                        <Col>
                            {/* Main Card for Home Care Packages */}
                            <Card
                                sx={{
                                    mt: 4,
                                    padding: "2rem",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                }}
                                className={styles.card}

                            >
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>
                                        Home Care Packages
                                    </Typography>
                                </div>

                                {/* Basic Daily Fee Section */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Basic Daily Fee $
                                </Typography>
                                <Divider sx={{marginBottom: "1rem"}}/>
                                <Row>
                                    {["Level1", "Level2", "Level3", "Level4"].map((level) => (
                                        <Col key={level} md={3} sx={{padding: "0.5rem"}}>
                                            <TextField
                                                label={`Level ${level}`}
                                                name={`BasicDailyFee_${level}`}
                                                variant="outlined"
                                                fullWidth
                                                value={expenseDescription[`BasicDailyFee_${level}`]}
                                                onChange={(e) => handleExpenseDescriptionChange(e)}
                                                sx={{marginBottom: "1rem"}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Package Management Fee Section */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Package Management Fee
                                </Typography>
                                <Divider sx={{marginBottom: "1rem"}}/>
                                <RadioGroup
                                    row
                                    name="PackageManagementFee_Type"
                                    value={expenseDescription.PackageManagementFee_Type}
                                    onChange={(e) => handleExpenseDescriptionChange(e)}
                                    sx={{marginBottom: "1.5rem", paddingLeft: "1rem"}}
                                >
                                    <FormControlLabel
                                        value="FlatRate"
                                        control={<Radio/>}
                                        label="Flat Rate $"
                                    />
                                    <FormControlLabel
                                        value="Percentage"
                                        control={<Radio/>}
                                        label="% of Total Income"
                                    />
                                </RadioGroup>
                                <Row>
                                    {["Level1", "Level2", "Level3", "Level4"].map((level) => (
                                        <Col key={level} md={3} sx={{padding: "0.5rem"}}>
                                            <TextField
                                                label={`Level ${level}`}
                                                name={`PackageManagementFee_${level}`}
                                                variant="outlined"
                                                fullWidth
                                                value={
                                                    expenseDescription[`PackageManagementFee_${level}`]
                                                }
                                                onChange={(e) => handleExpenseDescriptionChange(e)}
                                                sx={{marginBottom: "1rem"}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Care Management Fee Section */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Care Management Fee
                                </Typography>
                                <Divider sx={{marginBottom: "1rem"}}/>
                                <RadioGroup
                                    row
                                    name="CareManagementFee_Type"
                                    value={expenseDescription.CareManagementFee_Type}
                                    onChange={handleExpenseDescriptionChange}
                                    sx={{marginBottom: "1.5rem", paddingLeft: "1rem"}}
                                >
                                    <FormControlLabel
                                        value="FlatRate"
                                        control={<Radio/>}
                                        label="Flat Rate $"
                                    />
                                    <FormControlLabel
                                        value="Percentage"
                                        control={<Radio/>}
                                        label="% of Total Income"
                                    />
                                </RadioGroup>
                                <Row>
                                    {["Level1", "Level2", "Level3", "Level4"].map((level) => (
                                        <Col key={level} md={3} sx={{padding: "0.5rem"}}>
                                            <TextField
                                                label={`Level ${level}`}
                                                name={`CareManagementFee_${level}`}
                                                variant="outlined"
                                                fullWidth
                                                value={expenseDescription[`CareManagementFee_${level}`]}
                                                onChange={handleExpenseDescriptionChange}
                                                sx={{marginBottom: "1rem"}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Contingency Fund Section */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Contingency Fund $
                                </Typography>
                                <Divider sx={{marginBottom: "1rem"}}/>
                                <Row>
                                    {["Level1", "Level2", "Level3", "Level4"].map((level) => (
                                        <Col key={level} md={3} sx={{padding: "0.5rem"}}>
                                            <TextField
                                                label={`Level ${level}`}
                                                name={`ContingencyFund_${level}`}
                                                variant="outlined"
                                                fullWidth
                                                value={expenseDescription[`ContingencyFund_${level}`]}
                                                onChange={handleExpenseDescriptionChange}
                                                sx={{marginBottom: "1rem"}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                {/* Checkbox for Adding KM */}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={kmServiceDefault}
                                            onChange={(e) => setKmServiceDefault(e.target.checked)}
                                        />
                                    }
                                    label="Add KM to service total by default"
                                    sx={{marginBottom: "1.5rem"}}
                                />

                                {/* Worker Name and Contingency Fund */}
                                <Row sx={{marginBottom: "1.5rem"}}>
                                    <Col md={6}>
                                        <TextField
                                            select
                                            label="Show worker name"
                                            fullWidth
                                            name="ShowWorkerName"
                                            value={expenseDescription.ShowWorkerName}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                        >
                                            <MenuItem value="First Name">First Name</MenuItem>
                                            <MenuItem value="Last Name">Last Name</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={6}>
                                        <TextField
                                            label="Maximum for Contingency Fund $"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="0.00"
                                            name="MaxContingencyFund"
                                            value={expenseDescription.MaxContingencyFund}
                                            onChange={handleExpenseDescriptionChange}
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>

                                {/* Service Description */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Service Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="[desc] ([starttime] - [endtime]) [leavetype] [km]"
                                    sx={{marginBottom: "1rem"}}
                                    name="ServiceDescription"
                                    value={expenseDescription.ServiceDescription}
                                    onChange={handleExpenseDescriptionChange}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    Valid Tags: [desc], [starttime], [endtime], [leavetype], [km]
                                </Typography>

                                {/* Expense Description */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "600",
                                        marginTop: "1rem",
                                        marginBottom: "1rem",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    Expense Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="[invoiceno] - [desc]"
                                    sx={{marginBottom: "1rem"}}
                                    name="InvoiceDesc"
                                    value={expenseDescription.InvoiceDesc}
                                    onChange={handleExpenseDescriptionChange}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{marginBottom: "1rem", color: "gray"}}
                                >
                                    Valid Tags: [desc], [invoiceno]
                                </Typography>

                                {/* Labels for Expenses S4 - S16 */}
                                {[...Array(13)].map((_, index) => {
                                    const labelNumber = index + 4;
                                    return (
                                        <TextField
                                            key={labelNumber}
                                            label={`Label for Expense S${labelNumber} (Invoice to Client)`}
                                            fullWidth
                                            variant="outlined"
                                            placeholder={
                                                labelNumber === 4
                                                    ? "Consumables"
                                                    : labelNumber === 5
                                                        ? "Equipment"
                                                        : ""
                                            }
                                            sx={{marginBottom: "2rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name={`LabelExpenseS${labelNumber}`}
                                            value={expenseDescription[`LabelExpenseS${labelNumber}`]}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    );
                                })}
                                <TextField
                                    label="Default Note"
                                    fullWidth
                                    variant="outlined"
                                    sx={{marginBottom: "2rem"}}
                                    InputProps={{
                                        sx: {
                                            height: "120px",
                                            borderRadius: "7px",
                                        },
                                    }}
                                    name="DefaultNote"
                                    value={expenseDescription.DefaultNote}
                                    onChange={handleExpenseDescriptionChange}
                                />

                                {/* Default Unspent Funds Notice Note */}
                                <TextField
                                    label="Default Unspent Funds Notice Note"
                                    fullWidth
                                    variant="outlined"
                                    sx={{marginBottom: "2rem"}}
                                    InputProps={{
                                        sx: {
                                            height: "120px",
                                            borderRadius: "7px",
                                        },
                                    }}
                                    name="DefaultUnspentFundNotice"
                                    value={expenseDescription.DefaultUnspentFundNotice}
                                    onChange={handleExpenseDescriptionChange}
                                />

                                {/* BCC Email */}
                                <TextField
                                    label="BCC Email"
                                    fullWidth
                                    variant="outlined"
                                    sx={{marginBottom: "2rem"}}
                                    InputProps={{
                                        sx: {
                                            height: "43px",
                                            borderRadius: "7px",
                                            textAlign: "center",
                                        },
                                    }}
                                    name="BCCEmail"
                                    value={expenseDescription.BCCEmail}
                                    onChange={handleExpenseDescriptionChange}
                                />

                                <Divider sx={{marginBottom: "1rem"}}/>

                                {/* Export Management Fee Reference */}
                                <TextField
                                    label="Export Management Fee Reference"
                                    fullWidth
                                    variant="outlined"
                                    sx={{marginBottom: "2.5rem"}}
                                    InputProps={{
                                        sx: {
                                            height: "43px",
                                            borderRadius: "7px",
                                            textAlign: "center",
                                        },
                                    }}
                                    name="ExportManagementFeeRef"
                                    value={expenseDescription.ExportManagementFeeRef}
                                    onChange={handleExpenseDescriptionChange}
                                />

                                {/* Package Management Fee Charge Code */}
                                <TextField
                                    label="Package Management Fee Charge Code"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    sx={{marginBottom: "2.5rem"}}
                                    InputProps={{
                                        sx: {
                                            height: "43px",
                                            borderRadius: "7px",
                                        },
                                    }}
                                    name="PackageManagementFeeChargeCode"
                                    value={expenseDescription.PackageManagementFeeChargeCode}
                                    onChange={handleExpenseDescriptionChange}
                                >
                                    <MenuItem value="Code 1">Code 1</MenuItem>
                                    <MenuItem value="Code 2">Code 2</MenuItem>
                                </TextField>

                                {/* Package Management Fee Invoice Description */}
                                <Col md={4}>
                                    <TextField
                                        label="Package Management Fee Invoice Description"
                                        fullWidth
                                        variant="outlined"
                                        sx={{marginBottom: "1.5rem"}}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                                textAlign: "center",
                                            },
                                        }}
                                        name="PackageManagementFeeInvoiceDescription"
                                        value={
                                            expenseDescription.PackageManagementFeeInvoiceDescription
                                        }
                                        onChange={handleExpenseDescriptionChange}
                                    />
                                </Col>

                                {/* Package Management Fee Invoice Reference */}
                                <Col md={4}>
                                    <TextField
                                        label="Package Management Fee Invoice Reference"
                                        fullWidth
                                        variant="outlined"
                                        sx={{marginBottom: "2.5rem"}}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                                textAlign: "center",
                                            },
                                        }}
                                        name="PackageManagementFeeInvoiceReference"
                                        value={
                                            expenseDescription.PackageManagementFeeInvoiceReference
                                        }
                                        onChange={handleExpenseDescriptionChange}
                                    />
                                </Col>

                                {/* Additional Row for Package Management Fee Fields */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Package Management Fee Charge Code"
                                            select
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="PackageManagementFeeChargeCode"
                                            value={expenseDescription.PackageManagementFeeChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Package Management Fee Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "1rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="PackageManagementFeeInvoiceDescription"
                                            value={
                                                expenseDescription.PackageManagementFeeInvoiceDescription
                                            }
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Package Management Fee Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "1rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px",
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="PackageManagementFeeInvoiceReference"
                                            value={
                                                expenseDescription.PackageManagementFeeInvoiceReference
                                            }
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* Care Management Fee Fields */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Care Management Fee Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.CareManagementFeeChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="CareManagementFeeChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Care Management Fee Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "1rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="CareManagementFeeInvoiceDescription"
                                            value={
                                                expenseDescription.CareManagementFeeInvoiceDescription
                                            }
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Care Management Fee Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "1rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="CareManagementFeeInvoiceReference"
                                            value={
                                                expenseDescription.CareManagementFeeInvoiceReference
                                            }
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* Export Invoice to Clients Reference */}
                                <Row sx={{marginBottom: "2.5rem"}}>
                                    <Col>
                                        <TextField
                                            label="Export Invoice to Clients Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExportInvoiceToClientsRef"
                                            value={expenseDescription.ExportInvoiceToClientsRef}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* ITF Invoice Fields */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="ITF Invoice Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.ITFInvoiceChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ITFInvoiceChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="ITF Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ITFInvoiceDescription"
                                            value={expenseDescription.ITFInvoiceDescription}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="ITF Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ITFInvoiceReference"
                                            value={expenseDescription.ITFInvoiceReference}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Top Up Invoice Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.TopUpInvoiceChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="TopUpInvoiceChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Top Up Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="TopUpInvoiceDescription"
                                            value={expenseDescription.TopUpInvoiceDescription}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Top Up Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="TopUpInvoiceReference"
                                            value={expenseDescription.TopUpInvoiceReference}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* Basic Daily Fee Section */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Basic Daily Fee Invoice Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.BasicDailyFeeInvoiceChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="BasicDailyFeeInvoiceChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Basic Daily Fee Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="BasicDailyFeeInvoiceDescription"
                                            value={expenseDescription.BasicDailyFeeInvoiceDescription}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Basic Daily Fee Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="BasicDailyFeeInvoiceReference"
                                            value={expenseDescription.BasicDailyFeeInvoiceReference}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* Expense S4 Section */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S4 Invoice Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.ExpenseS4InvoiceChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS4InvoiceChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S4 Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS4InvoiceDescription"
                                            value={expenseDescription.ExpenseS4InvoiceDescription}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S4 Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS4InvoiceReference"
                                            value={expenseDescription.ExpenseS4InvoiceReference}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>

                                {/* Expense S5 Section */}
                                <Row sx={{marginBottom: "1rem"}}>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S5 Invoice Charge Code"
                                            select
                                            fullWidth
                                            value={expenseDescription.ExpenseS5InvoiceChargeCode}
                                            onChange={handleExpenseDescriptionChange}
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS5InvoiceChargeCode"
                                        >
                                            <MenuItem value="Code 1">Code 1</MenuItem>
                                            <MenuItem value="Code 2">Code 2</MenuItem>
                                        </TextField>
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S5 Invoice Description"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS5InvoiceDescription"
                                            value={expenseDescription.ExpenseS5InvoiceDescription}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <TextField
                                            label="Expense S5 Invoice Reference"
                                            fullWidth
                                            variant="outlined"
                                            sx={{marginBottom: "2.5rem"}}
                                            InputProps={{
                                                sx: {
                                                    height: "43px", // Set a consistent height
                                                    borderRadius: "7px",
                                                },
                                            }}
                                            name="ExpenseS5InvoiceReference"
                                            value={expenseDescription.ExpenseS5InvoiceReference}
                                            onChange={handleExpenseDescriptionChange}
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        {/* <Button variant="contained" onClick={() => handleSubmitAll()}>Save</Button> */}
                    </Row>
                </Col>
            </Row>

            <Box
                sx={{display: "flex", justifyContent: "right", alignItems: "center"}}
            >
                <Button
                    variant="contained"
                    disableRipple
                    sx={{
                        backgroundColor: "blue",
                        ":hover": {
                            backgroundColor: "blue", // Prevent hover effect
                        },
                    }} className={style.maintenanceBtn}
                    onClick={() => handleSubmitAll()}
                >
                    Save
                </Button>

            </Box>
        </div>
    );
};

export default Finance;
