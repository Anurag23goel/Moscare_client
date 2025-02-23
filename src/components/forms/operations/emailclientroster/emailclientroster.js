import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, getColumns, postData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";


Modal.setAppElement("#__next");

const EmailClientRoster = () => {
    const [emailClientRosterData, setEmailClientRosterData] = useState([]);
    const [selectedRosters, setSelectedRosters] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [form, setForm] = useState({});
    const [shiftStartDate, setShiftStartDate] = useState(new Date().toISOString().split(" ")[0]);
    const [noOfWeeks, setNoOfWeeks] = useState(1);
    const [exportServices, setExportServices] = useState(true);
    const [exportWorkerFirstName, setExportWorkerFirstName] = useState(true);
    const [exportWorkerLastName, setExportWorkerLastName] = useState(true);
    const [exportWorkerPreferredName, setExportWorkerPreferredName] = useState(false);
    const [excludeShiftsOnLeave, setExcludeShiftsOnLeave] = useState(false);
    const [emailBcc, setEmailBcc] = useState("sample@gmail.com");
    const [emailBody, setEmailBody] = useState("Please find your roster attached\nThanks");
    const [fileType, setFileType] = useState("pdf");
    const [columns, setColumns] = useState([])
    const fetchEmailClientRosterData = async () => {
        try {
            const emailClientRosterResponse = await fetchData(
                "/api/getClientRosterMasterDataAll",
                window.location.href
            );
            console.log("Fetched emailClientRoster data:", emailClientRosterResponse);
            return emailClientRosterResponse;
        } catch (error) {
            console.error("Error fetching emailClientRoster data:", error);
        }
    };

    useEffect(() => {
        const fetchAndSetEmailClientRosterData = async () => {
            const data = await fetchEmailClientRosterData();
            setEmailClientRosterData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetEmailClientRosterData();
        fetchUserRoles(
            "m_email_client_roster",
            "Operations_EmailClientRoster",
            setDisableSection
        );
    }, []);

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };


    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleRowSelectionModelChange = (selectedRowIndices) => {
        console.log(selectedRowIndices);
        const selectedData = selectedRowIndices.reduce((acc, rowIndex) => {
            const row = emailClientRosterData.data[rowIndex];
            if (row && row.RosterID) {
                acc[row.RosterID] = row.Email;
            }
            return acc;
        }, {});
        console.log("selectedData : ", selectedData)
        setSelectedRosters(selectedData);
        console.log("Selected rosters:", selectedData);
    };

    const handleSendEmailButton = () => {
        setShowEmailModal(true);
    };

    const handleSendEmails = async () => {
        let res;
        const formData = {
            selectedRosters: form.selectedRosters,
            shiftStartDate: form.shiftStartDate,
            noOfWeeks: form.noOfWeeks,
            exportServices: form.exportServices,
            exportWorkerFirstName: form.exportWorkerFirstName,
            exportWorkerLastName: form.exportWorkerLastName,
            exportWorkerPreferredName: form.exportWorkerPreferredName,
            excludeShiftsOnLeave: form.excludeShiftsOnLeave,
            emailBcc: form.emailBcc,
            emailBody: form.emailBody,
        }
        try {
            res = await postData(
                "/api/getRosterDataForClientEmail",
                {
                    formData
                },
                window.location.href
            );
        } catch (error) {
            console.error("Error getting roster data:", error);
            return;
        }

        if (!res || !res.data) {
            console.error("No data received for roster");
            return;
        }

        try {
            if (fileType === "pdf") {
                console.log("Roster data:", res);
                const response = await postData('/api/generateClientRosterPdf', {
                    data: res.data,
                    emailBcc: emailBcc,
                    emailBody: emailBody,
                }, window.location.href);

                if (response && response.data) {
                    console.log("PDF generated successfully:", response);
                }
            }
        } catch (error) {
            console.error(error);
        }
        setShowEmailModal(false);
    };

    const fields = [
        {
            id: "ShiftStart",
            label: "Shift Start Date",
            type: "date",
            value: shiftStartDate,
            onChange: (e) => setShiftStartDate(e.target.value),
        },
        {
            id: "NoOfWeeks",
            label: "Weeks",
            type: "number",
            value: noOfWeeks,
            onChange: (e) => setNoOfWeeks(e.target.value),
        },
        {
            id: "emailBcc",
            label: "bcc",
            type: "text",
            value: emailBcc,
            onChange: (e) => setEmailBcc(e.target.value),
        },
        {
            id: "emailBody",
            label: "Email Body",
            type: "text",
            value: emailBody,
            onChange: (e) => setEmailBody(e.target.value),
        },
        {
            id: "fileType",
            label: "File Type",
            type: "select",
            options: [
                {value: "csv", label: "CSV"},
                {value: "pdf", label: "PDF"},
            ],
            value: fileType,
            onChange: (e) => setFileType(e.target.value),
        },
        {
            id: "ExportServices",
            label: "Export Services",
            type: "checkbox",
            checked: exportServices,
            onChange: (e) => setExportServices(e.target.checked),
        },
        {
            id: "ExportWorkerFirstName",
            label: "Export Worker First Name",
            type: "checkbox",
            checked: exportWorkerFirstName,
            onChange: (e) => setExportWorkerFirstName(e.target.checked),
        },
        {
            id: "ExportWorkerLastName",
            label: "Export Worker Last Name",
            type: "checkbox",
            checked: exportWorkerLastName,
            onChange: (e) => setExportWorkerLastName(e.target.checked),
        },
        {
            id: "ExportWorkerPreferredName",
            label: "Export Worker Preferred ",
            type: "checkbox",
            checked: exportWorkerPreferredName,
            onChange: (e) => setExportWorkerPreferredName(e.target.checked),
        },
        {
            id: "ExcludeShiftsOnLeave",
            label: "Exclude shifts on leave",
            type: "checkbox",
            checked: excludeShiftsOnLeave,
            onChange: (e) => setExcludeShiftsOnLeave(e.target.checked),
        },

    ];


    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <CustomBreadcrumbs />
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <Modal
                    isOpen={showEmailModal}
                    onRequestClose={() => setShowEmailModal(false)}
                    contentLabel="Email Client Roster"
                    style={{
                        overlay: {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                        },
                        content: {
                            top: "50%",
                            left: "50%",
                            right: "auto",
                            bottom: "auto",
                            marginRight: "-50%",
                            transform: "translate(-50%, -50%)",
                            width: "fit-content",
                        },
                    }}
                >
                    <ModalHeader
                        title="Email Client Roster"
                        handleClose={() => setShowEmailModal(false)}
                    />
                    <div style={{padding: "1rem"}}>
                        <div style={{display: "flex"}}>
                            <Row>
                                <InputField
                                    label="Shift Start Date"
                                    type="date"
                                    id="ShiftStart"
                                    value={shiftStartDate}
                                    onChange={(e) => setShiftStartDate(e.target.value)}
                                />
                                <InputField
                                    label="Weeks"
                                    type="number"
                                    id="NoOfWeeks"
                                    value={noOfWeeks}
                                    onChange={(e) => setNoOfWeeks(e.target.value)}
                                />
                            </Row>
                        </div>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div>
                                <Checkbox
                                    checked={exportServices}
                                    onChange={(e) => setExportServices(e.target.checked)}
                                /> Export Services
                            </div>
                            <div>
                                <Checkbox
                                    checked={exportWorkerFirstName}
                                    onChange={(e) => setExportWorkerFirstName(e.target.checked)}
                                /> Export Worker First Name
                            </div>
                            <div>
                                <Checkbox
                                    checked={exportWorkerLastName}
                                    onChange={(e) => setExportWorkerLastName(e.target.checked)}
                                /> Export Worker Last Name
                            </div>
                            <div>
                                <Checkbox
                                    checked={exportWorkerPreferredName}
                                    onChange={(e) => setExportWorkerPreferredName(e.target.checked)}
                                /> Export Worker Preferred Name
                            </div>
                            <div>
                                <Checkbox
                                    checked={excludeShiftsOnLeave}
                                    onChange={(e) => setExcludeShiftsOnLeave(e.target.checked)}
                                /> Exclude shifts on leave
                            </div>
                        </div>
                        <hr/>
                        <div style={{display: "flex", flexDirection: "column", width: "50%", gap: "20px"}}>
                            <InputField
                                label="bcc"
                                type="text"
                                id="emailBcc"
                                value={emailBcc}
                                onChange={(e) => setEmailBcc(e.target.value)}
                            />
                            <InputField
                                label="Email Body"
                                type="text"
                                id="emailBody"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </div>
                        <hr/>
                        <div style={{display: "flex", flexDirection: "column", width: "50%"}}>
                            <InputField
                                label="File Type"
                                type="select"
                                id="fileType"
                                options={[
                                    {value: "csv", label: "CSV"},
                                    {value: "pdf", label: "PDF"},
                                ]}
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                            />
                        </div>
                        <br/>
                        <Button
                            label="Send Email"
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={handleSendEmails}
                        />
                    </div>
                </Modal> */}
                <EditModal
                    show={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    onSave={handleSendEmails}
                    modalTitle="Email Client Roster"
                    fields={fields}
                    data={form}
                    onChange={handleChange}
                />


                <CustomAgGridDataTable2

                    title="Email Client Roster"
                    subtitle="Manage all Email Client Roster. Click on Edit to update their Email Client Roster."
                    primaryButton={{
                        label: "Email Client Roster",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: handleSendEmailButton,
                        // disabled: disableSection,
                    }}

                    rows={emailClientRosterData.data || []}
                    columns={columns}
                    rowSelected={() => {
                    }}
                    handleRowSelectionModelChange={handleRowSelectionModelChange}
                    showActionColumn={true}
                />


            </div>
        </div>
    );
};

export default EmailClientRoster;