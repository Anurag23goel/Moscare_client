import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, fetchUserRoles, getColumns, postData} from "@/utility/api_utility";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const EmailWorker = () => {
    const [emailWorkerData, setEmailWorkerData] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])

    const fetchEmailWorkerData = async () => {
        try {
            const emailWorkerResponse = await fetchData(
                "/api/getActiveWorkerMasterData",
                window.location.href
            );
            console.log("Fetched emailWorker data:", emailWorkerResponse);
            return emailWorkerResponse;
        } catch (error) {
            console.error("Error fetching emailWorker data:", error);
        }
    };


    useEffect(() => {
        const fetchAndSetEmailWorkerData = async () => {
            const data = await fetchEmailWorkerData();
            setEmailWorkerData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetEmailWorkerData();
        fetchUserRoles('m_email_worker_login', 'Operation_Email_Worker', setDisableSection);
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleSelectRowClick = (row) => {
        if (!selectedEmails.includes(row.Email)) {
            setSelectedEmails((prev) => [...prev, row.Email]);
        }
        console.log("Selected Emails:", selectedEmails);
    };

    const handleSendEmails = async () => {
        try {
            const response = await postData(
                "/api/postEmailWorker",
                {emails: selectedEmails},
                window.location.href
            );
            if (response.ok) {
                console.log("Emails sent successfully");
            } else {
                console.error("Error sending emails");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <CustomBreadcrumbs />
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                <CustomAgGridDataTable2

                    title="Email Worker"
                    subtitle="Manage all Email Worker. Click on Edit to update their Email Worker."
                    primaryButton={{
                        label: "Email Worker",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: handleSendEmails,
                        // disabled: disableSection,
                    }}

                    rows={emailWorkerData.data}
                    columns={columns}
                    rowSelected={handleSelectRowClick}
                    showActionColumn={true}
                />


            </div>
        </div>
    );
};

export default EmailWorker;
