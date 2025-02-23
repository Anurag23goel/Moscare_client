import React, {useEffect, useState} from "react";
import {Checkbox} from "@mui/material";
import MAccordian from "@/components/widgets/MAccordian";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/worker/financeSlice";
import {useRouter} from "next/router";
import StatusBar from "@/components/widgets/StatusBar";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/styles/style.module.css'

function Finance({
                     setFinanceEdit,
                     setSelectedComponent,
                     onTabChange,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked
                 }) {
    const router = useRouter();
    const {WorkerID} = router.query;
    const dispatch = useDispatch();
    const defaultFinanceForm = useSelector(
        (state) => state.workerfinance.financeForm
    );
    // const {colors, loading} = useContext(ColorContext);
    const [prompt, setPrompt] = useState(false);
    const [financeForm, setFinanceForm] = useState(defaultFinanceForm);
    const [disableSection, setDisableSection] = useState(false);
    const [workerType, setWorkerType] = useState([]);
    const [hecsFsDebt, setHecsFsDebt] = useState([]);
    const [payRollCodes, setPayRollCodes] = useState([]);
    const [alert, setAlert] = useState(false)
    const [status, setStatus] = useState(null)

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // Merge default data with fetched data
    const mergeFinanceData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        try {
            // Execute all fetch requests in parallel
            const [
                bankDetails,
                partTimeReq,
                financeDetails,
                otherdetails,
                workerTypeData,
                hecsFsDebtData,
                schadsLevelsData
            ] = await Promise.all([
                fetchData(`/api/getWorkerBankDetailsData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerPartTimeReqData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerFinanceDetailsData/${WorkerID}`, window.location.href),
                fetchData(`/api/getWorkerOtherDetailsData/${WorkerID}`, window.location.href),
                fetchData('/api/getWorkerType', window.location.href),
                fetchData('/api/getHecsFsDebt', window.location.href),
                fetchData('/api/getPayRateSCHADSLevels', window.location.href)
            ]);

            const fetchedFinanceForm = {
                // Bank details
                accountName: bankDetails.data[0]?.AccountName || "",
                bank: bankDetails.data[0]?.Bank || "",
                bsb: bankDetails.data[0]?.Bsb || "",
                account: bankDetails.data[0]?.Account || "",
                percentage: bankDetails.data[0]?.Percentage || "",
                accountName2: bankDetails.data[0]?.AccountName2 || "",
                bank2: bankDetails.data[0]?.Bank2 || "",
                bsb2: bankDetails.data[0]?.Bsb2 || "",
                account2: bankDetails.data[0]?.Account2 || "",
                percentage2: bankDetails.data[0]?.Percentage2 || "",
                accountName3: bankDetails.data[0]?.AccountName3 || "",
                bank3: bankDetails.data[0]?.Bank3 || "",
                bsb3: bankDetails.data[0]?.Bsb3 || "",
                account3: bankDetails.data[0]?.Account3 || "",
                percentage3: bankDetails.data[0]?.Percentage3 || "",

                // Part-time requirements
                mo: partTimeReq.data[0]?.Mo || "",
                tu: partTimeReq.data[0]?.Tu || "",
                we: partTimeReq.data[0]?.We || "",
                th: partTimeReq.data[0]?.Th || "",
                fr: partTimeReq.data[0]?.Fr || "",
                sa: partTimeReq.data[0]?.Sa || "",
                su: partTimeReq.data[0]?.Su || "",
                moTime: partTimeReq.data[0]?.MoTime || "",
                tuTime: partTimeReq.data[0]?.TuTime || "",
                weTime: partTimeReq.data[0]?.WeTime || "",
                thTime: partTimeReq.data[0]?.ThTime || "",
                frTime: partTimeReq.data[0]?.FrTime || "",
                saTime: partTimeReq.data[0]?.SaTime || "",
                suTime: partTimeReq.data[0]?.SuTime || "",

                // Finance details
                budgetHourDay: financeDetails.data[0]?.BudgetHourDay || "",
                payRateLevel: financeDetails.data[0]?.PayRateLevel || "",
                overnightRate: financeDetails.data[0]?.OvernightRate || "",
                firstAidAllowance: financeDetails.data[0]?.FirstAidAllowance || "",
                payNotes: financeDetails.data[0]?.PayNotes || "",
                workerType: financeDetails.data[0]?.WorkerType || "",
                employmentType: financeDetails.data[0]?.EmploymentType || "",
                tfn: financeDetails.data[0]?.Tfn || "",
                abn: financeDetails.data[0]?.Abn || "",
                residency: financeDetails.data[0]?.Residency || "",
                hecsFsDebt: financeDetails.data[0]?.HecsFsDebt || "",
                taxFree: financeDetails.data[0]?.TaxFree || false,
                registeredGst: financeDetails.data[0]?.RegisteredGst || false,
                superFundName: financeDetails.data[0]?.SuperFundName || "",
                policyNumber: financeDetails.data[0]?.PolicyNumber || "",
                memberNumber: financeDetails.data[0]?.MemberNumber || "",
                usiSpin: financeDetails.data[0]?.UsiSpin || "",
                accountingCode: financeDetails.data[0]?.AccountingCode || "",
                councilReference: financeDetails.data[0]?.CouncilReference || "",
                hcp: financeDetails.data[0]?.Hcp || false,
                chsp: financeDetails.data[0]?.Chsp || false,
                insurance: financeDetails.data[0]?.Insurance || false,
                insurer: financeDetails.data[0]?.Insurer || "",
                insurancePolicyNo: financeDetails.data[0]?.InsurancePolicyNo || "",

                // Other details
                externalId1: otherdetails.data[0]?.ExternalId1 || "",
                externalId2: otherdetails.data[0]?.ExternalId2 || "",
            };

            const mergeFinanceForm = mergeFinanceData(
                defaultFinanceForm,
                fetchedFinanceForm
            );

            setWorkerType(workerTypeData.data);
            setHecsFsDebt(hecsFsDebtData.data);

            // Extract SCHADS levels
            const schadsLevelsArray = schadsLevelsData.data.map(item => ({
                label: item.SCHADS_Level,
                value: item.SCHADS_Level,
            }));

            setPayRollCodes(schadsLevelsArray);
            setFinanceForm(mergeFinanceForm); // Stores merged value
        } catch (error) {
            console.error("Error fetching data:", error);
            // Add appropriate error handling here
        }
    };

    const handleSaveButton = () => {
        console.log("Details form:", financeForm);

        // Bank details data
        const data1 = {
            AccountName: financeForm.accountName,
            Bank: financeForm.bank,
            Bsb: financeForm.bsb,
            Account: financeForm.account,
            Percentage: financeForm.percentage,
            AccountName2: financeForm.accountName2,
            Bank2: financeForm.bank2,
            Bsb2: financeForm.bsb2,
            Account2: financeForm.account2,
            Percentage2: financeForm.percentage2,
            AccountName3: financeForm.accountName3,
            Bank3: financeForm.bank3,
            Bsb3: financeForm.bsb3,
            Account3: financeForm.account3,
            Percentage3: financeForm.percentage3,
        };

        // Part-time requirement data
        const data2 = {
            Mo: financeForm.mo,
            Tu: financeForm.tu,
            We: financeForm.we,
            Th: financeForm.th,
            Fr: financeForm.fr,
            Sa: financeForm.sa,
            Su: financeForm.su,
            MoTime: financeForm.moTime,
            TuTime: financeForm.tuTime,
            WeTime: financeForm.weTime,
            ThTime: financeForm.thTime,
            FrTime: financeForm.frTime,
            SaTime: financeForm.saTime,
            SuTime: financeForm.suTime,
        };

        // Finance details data
        const data3 = {
            BudgetHourDay: financeForm.budgetHourDay,
            PayRateLevel: financeForm.payRateLevel,
            OvernightRate: financeForm.overnightRate,
            FirstAidAllowance: financeForm.firstAidAllowance,
            PayNotes: financeForm.payNotes,
            WorkerType: financeForm.workerType,
            EmploymentType: financeForm.employmentType,
            Tfn: financeForm.tfn,
            Abn: financeForm.abn,
            Residency: financeForm.residency,
            HecsFsDebt: financeForm.hecsFsDebt,
            TaxFree: financeForm.taxFree,
            RegisteredGst: financeForm.registeredGst,
            SuperFundName: financeForm.superFundName,
            PolicyNumber: financeForm.policyNumber,
            MemberNumber: financeForm.memberNumber,
            UsiSpin: financeForm.usiSpin,
            AccountingCode: financeForm.accountingCode,
            CouncilReference: financeForm.councilReference,
            Hcp: financeForm.hcp,
            Chsp: financeForm.chsp,
            Insurance: financeForm.insurance,
            Insurer: financeForm.insurer,
            InsurancePolicyNo: financeForm.insurancePolicyNo,
        };

        // Other details data
        const data4 = {
            ExternalId1: financeForm.externalId1,
            ExternalId2: financeForm.externalId2,
        };

        // Update bank details
        putData(
            `/api/updateWorkerBankDetailsData/${WorkerID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true)
            setStatus(response.success)
        });

        // Update part-time requirements
        putData(
            `/api/updateWorkerPartTimeReqData/${WorkerID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true)
            setStatus(response.success)
        });

        // Update finance details
        putData(
            `/api/updateWorkerFinanceDetailsData/${WorkerID}`,
            {
                data: data3,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
            setAlert(true)
            setStatus(response.success)
        });

        // Update other details
        putData(`/api/updateWorkerOtherDetailsData/${WorkerID}`, {
            data: data4,
        }).then((response) => {
            console.log("Response:", response);
            setAlert(true)
            setStatus(response.success)
        });

        dispatch(deleteData());
        fetchDataAsync();
        setFinanceEdit(false);
        // Keep one blank space after "Finance"
        setSelectedComponent("Finance ");
    };

    const handleTimeChange = (newTime, id) => {
        setFinanceEdit(true);
        // setSelectedComponent("Finance *");
        setFinanceForm((prevForm) => {
            const updatedState = {...prevForm, [id]: newTime};
            dispatch(upsertData(updatedState));
            return updatedState;
        });

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleChange = (event) => {
        setFinanceEdit(true);
        setSelectedComponent("Finance *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setFinanceForm((prevState) => {
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
        fetchUserRoles("m_wprofile", "Worker_Profile_Finance", setDisableSection);
    }, [WorkerID]);


    const handleTabChange = (tab) => {
        setSelectedTabGen(tab)
        onTabChange(tab); // Notify parent of active tab
    };

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for finance...");
            onSaveReady("finance", handleSaveButton());

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);


    return (
        <div
            className="glass  dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

            <div

            >
                <div>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Finance Details
                    </h1>
                    {/* <h4 style={{fontWeight:"600",marginBottom:"1rem"}}>Finance Details</h4> */}
                </div>
                {
                    alert
                    &&
                    <StatusBar status={status} setAlert={setAlert} msg="Data updated successfully"/>
                }
                <Row
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: "0",
                        gap: "1rem"
                    }}
                >
                    <Col
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            width: "0"
                        }}
                    >
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Bank Details"}
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
                                        type={"text"}
                                        label={"Account Name"}
                                        id={"accountName"}
                                        value={financeForm.accountName}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Bank"}
                                        id={"bank"}
                                        value={financeForm.bank}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"BSB"}
                                        id={"bsb"}
                                        value={financeForm.bsb}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Account"}
                                        id={"account"}
                                        value={financeForm.account}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Percentage"}
                                        id={"percentage"}
                                        value={financeForm.percentage}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Account Name2"}
                                        id={"accountName2"}
                                        value={financeForm.accountName2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Bank2"}
                                        id={"bank2"}
                                        value={financeForm.bank2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"BSB2"}
                                        id={"bsb2"}
                                        value={financeForm.bsb2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Account2"}
                                        id={"account2"}
                                        value={financeForm.account2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label="number"
                                        id={"percentage2"}
                                        value={financeForm.percentage2}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Account Name3"}
                                        id={"accountName3"}
                                        value={financeForm.accountName3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Bank3"}
                                        id={"bank3"}
                                        value={financeForm.bank3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"BSB3"}
                                        id={"bsb3"}
                                        value={financeForm.bsb3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Account3"}
                                        id={"account3"}
                                        value={financeForm.account3}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Percentage3"}
                                        id={"percentage3"}
                                        value={financeForm.percentage3}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                        <MAccordian
                            summaryBgColor={"blue"}
                            disabled={disableSection}
                            summary={"Part Time Daily Hour Requirement"}
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
                                    <Row>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"MO"}
                                                id={"mo"}
                                                value={financeForm.mo}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"TU"}
                                                id={"tu"}
                                                value={financeForm.tu}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"WE"}
                                                id={"we"}
                                                value={financeForm.we}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"TH"}
                                                id={"th"}
                                                value={financeForm.th}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>

                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"FR"}
                                                id={"fr"}
                                                value={financeForm.fr}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"SA"}
                                                id={"sa"}
                                                value={financeForm.sa}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                        <Col>
                                            <InputField
                                                type={"text"}
                                                label={"SU"}
                                                id={"su"}
                                                value={financeForm.su}
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    </Row>

                                    {/* Replace TimePicker components with react-datepicker */}
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "1rem",
                                        }}
                                    >
                                        <Row>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.moTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'moTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    className="form-control"
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="MO Time"
                                                />
                                            </Col>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.tuTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'tuTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    className="form-control"
                                                    placeholderText="TU Time"
                                                />
                                            </Col>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.weTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'weTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="WE Time"
                                                    className="form-control"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.thTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'thTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    className="form-control"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="TH Time"
                                                />
                                            </Col>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.frTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'frTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    className="form-control"
                                                    placeholderText="FR Time"
                                                /></Col>
                                            <Col>
                                                <DatePicker
                                                    selected={financeForm.saTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'saTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="SA Time"
                                                    className="form-control"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={4}>
                                                <DatePicker
                                                    selected={financeForm.suTime}
                                                    onChange={(newTime) => handleTimeChange(newTime, 'suTime')}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={15}
                                                    timeCaption="Time"
                                                    dateFormat="h:mm aa"
                                                    placeholderText="SU Time"
                                                    className="form-control"
                                                />
                                            </Col>
                                        </Row>
                                    </div>
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
                        {/* Worker Details Accordion */}
                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Worker Details"}
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
                                    {/*<InputField*/}
                                    {/*  type={"number"}*/}
                                    {/*  label={"Budget Hours per Day"}*/}
                                    {/*  id={"budgetHourDay"}*/}
                                    {/*  value={financeForm.budgetHourDay}*/}
                                    {/*  onChange={handleChange}*/}
                                    {/*/>*/}
                                    <InputField
                                        type={"select"}
                                        label={"Payrate Level"}
                                        id={"payRateLevel"}
                                        value={financeForm.payRateLevel}
                                        sx={{textAlign: "center",}}
                                        onChange={handleChange}
                                        options={payRollCodes}
                                        className={styles.marBt5}
                                    />
                                    {/*<InputField*/}
                                    {/*  type="number"*/}
                                    {/*  label={"Overnight Rate"}*/}
                                    {/*  id={"overnightRate"}*/}
                                    {/*  value={financeForm.overnightRate}*/}
                                    {/*  onChange={handleChange}*/}
                                    {/*/>*/}
                                    {/*<InputField*/}
                                    {/*  type="number"*/}
                                    {/*  label={"First Aid Allowance Rate"}*/}
                                    {/*  id={"firstAidAllowance"}*/}
                                    {/*  value={financeForm.firstAidAllowance}*/}
                                    {/*  onChange={handleChange}*/}
                                    {/*/>*/}
                                    {/*<InputField*/}
                                    {/*  className={styles.marBt5}*/}
                                    {/*  type={"textarea"}*/}
                                    {/*  label={"Pay Notes"}*/}
                                    {/*  id={"payNotes"}*/}
                                    {/*  value={financeForm.payNotes}*/}
                                    {/*  onChange={handleChange}*/}
                                    {/*/>*/}
                                    <InputField
                                        type={"select"}
                                        label={"Worker Type"}
                                        id={"workerType"}
                                        className={styles.marBt5}
                                        value={financeForm.workerType}
                                        onChange={handleChange}
                                        options={workerType.map((option) => ({
                                            label: option.ParamDesc,
                                            value: option.ParamValue,
                                        }))}
                                    />
                                    {/*<InputField*/}
                                    {/*  type={"text"}*/}
                                    {/*  label={"Employment Type"}*/}
                                    {/*  id={"employmentType"}*/}
                                    {/*  value={financeForm.employmentType}*/}
                                    {/*  onChange={handleChange}*/}
                                    {/*/>*/}
                                    <InputField
                                        type="number"
                                        label={"TFN"}
                                        id={"tfn"}
                                        value={financeForm.tfn}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"ABN"}
                                        id={"abn"}
                                        value={financeForm.abn}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Residency"}
                                        id={"residency"}
                                        value={financeForm.residency}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"HECS/FS Debt"}
                                        id={"HecsFs"}
                                        value={financeForm.HecsFsDebt}
                                        options={hecsFsDebt.map((option) => ({
                                            label: option.ParamDesc,
                                            value: option.ParamValue,
                                        }))}
                                        onChange={handleChange}
                                    />
                                    {/*<div className={styles.fontSize12}>*/}
                                    {/*  <Checkbox*/}
                                    {/*    name="checkbox"*/}
                                    {/*    id={"taxFree"}*/}
                                    {/*    checked={financeForm.taxFree}*/}
                                    {/*    onChange={handleChange}*/}
                                    {/*  />*/}
                                    {/*  Tax free threshold*/}
                                    {/*</div>*/}
                                    {/*<div className={styles.fontSize12}>*/}
                                    {/*  <Checkbox*/}
                                    {/*    name="checkbox"*/}
                                    {/*    id={"registeredGst"}*/}
                                    {/*    checked={financeForm.registeredGst}*/}
                                    {/*    onChange={handleChange}*/}
                                    {/*  />*/}
                                    {/*  Registered GST*/}
                                    {/*</div>*/}
                                    <InputField
                                        type={"text"}
                                        label={"Super Fund Name"}
                                        id={"superFundName"}
                                        value={financeForm.superFundName}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Policy Number"}
                                        id={"policyNumber"}
                                        value={financeForm.policyNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Member Number"}
                                        id={"memberNumber"}
                                        value={financeForm.memberNumber}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"USI / SPIN"}
                                        id={"usiSpin"}
                                        value={financeForm.usiSpin}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"text"}
                                        label={"Council Reference"}
                                        id={"councilReference"}
                                        value={financeForm.councilReference}
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
                        {/*<MAccordian*/}
                        {/*  summaryBgColor={"blue"}*/}
                        {/*  summary={"HCP / CHSP"}*/}
                        {/*  disabled={disableSection}*/}
                        {/*  details={*/}
                        {/*    <Col*/}
                        {/*      style={{*/}
                        {/*        display: "flex",*/}
                        {/*        flexDirection: "column",*/}
                        {/*        justifyContent: "space-between",*/}
                        {/*        gap: "1rem",*/}
                        {/*        marginTop: "1rem",*/}
                        {/*      }}*/}
                        {/*    >*/}
                        {/*      <div className={styles.fontSize12}>*/}
                        {/*        <Checkbox*/}
                        {/*          name="checkbox"*/}
                        {/*          id={"hcp"}*/}
                        {/*          checked={financeForm.hcp}*/}
                        {/*          onChange={handleChange}*/}
                        {/*        />*/}
                        {/*        Is HCP Worker*/}
                        {/*      </div>*/}
                        {/*      <div className={styles.fontSize12}>*/}
                        {/*        <Checkbox*/}
                        {/*          name="checkbox"*/}
                        {/*          id={"chsp"}*/}
                        {/*          checked={financeForm.chsp}*/}
                        {/*          onChange={handleChange}*/}
                        {/*        />*/}
                        {/*        Is CHSP Worker*/}
                        {/*      </div>*/}
                        {/*    </Col>*/}
                        {/*  }*/}
                        {/*/>*/}

                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"Insurance"}
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
                                    <div className={styles.fontSize12}>
                                        <Checkbox
                                            name="checkbox"
                                            id={"insurance"}
                                            checked={financeForm.insurance}
                                            onChange={handleChange}
                                        />
                                        Insurance
                                    </div>
                                    <InputField
                                        type={"text"}
                                        label={"Insurance"}
                                        id={"insurer"}
                                        value={financeForm.insurer}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type="number"
                                        label={"Insurance Policy No"}
                                        id={"insurancePolicyNo"}
                                        value={financeForm.insurancePolicyNo}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />

                        <MAccordian
                            summaryBgColor={"blue"}
                            summary={"External References"}
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
                                        type={"textarea"}
                                        label={"External Id 1"}
                                        id={"externalId1"}
                                        value={financeForm.externalId1}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        type={"textarea"}
                                        label={"External Id 2"}
                                        id={"externalId2"}
                                        value={financeForm.externalId2}
                                        onChange={handleChange}
                                    />
                                </Col>
                            }
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Finance;
