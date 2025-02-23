import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {fetchData, postData} from '@/utility/api_utility';
import CreateFormModal from './CreateFormModal';
import styles from "@/styles/style.module.css";
import EditModal from '@/components/widgets/EditModal';

import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";
import { CustomBreadcrumbs } from '@/components/breadcrumbs/Breadcrumbs';


const Forms = () => {
    const [forms, setForms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const [columns, setColumns] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState("");
    // const {colors} = useContext(ColorContext);

    // State for Assign Data
    const [assignData, setAssignData] = useState([]);
    const [isAssignDataLoading, setIsAssignDataLoading] = useState(true);
    const [assignDataError, setAssignDataError] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await fetchData('/api/getForms');
                setForms(response.data || []);
                console.log("Fetched Form data:", response);
                const columns = Object.keys(response.data[0] || {}).map((key) => ({
                    field: key,
                    headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
                }));
                setColumns(columns);
            } catch (error) {
                console.error('Error fetching forms:', error);
            }
        };

        const fetchWorkers = async () => {
            try {
                const workerData = await fetchData("/api/getWorkerMasterSpecificDataAll");
                if (workerData && workerData.data) {
                    setAssignData(workerData.data);
                } else {
                    console.error("Unexpected data format:", workerData);
                    setAssignDataError("Failed to fetch worker data.");
                }
            } catch (error) {
                console.error("Error fetching worker data:", error);
                setAssignDataError("An error occurred while fetching worker data.");
            } finally {
                setIsAssignDataLoading(false);
            }
        };

        fetchForms();
        fetchWorkers();
    }, []);

    const handleFillForm = (formInstanceId) => {
        if (!formInstanceId) {
            console.error('FormInstanceId is missing.');
            return;
        }
        router.push({
            pathname: '/maintenance/FormFill',
            query: {formInstanceId},
        });
    };

    const handleModalToggle = () => {
        setShowModal(!showModal);
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const fields = [
        {
            id: "FormName",
            label: "Form Name",
            type: "text",
        },
        {
            id: "AssignedTo",
            label: "Assign To",
            type: "select",
            options: assignData.map((assign) => ({
                value: assign.FirstName, // Adjust based on your data structure
                label: assign.FirstName, // Adjust based on your data structure
            })),
        },
        {
            id: "ReviewDate",
            label: "Review Date",
            type: "date",
        },
        {
            id: "FormDate",
            label: "Form Date",
            type: "date",
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        console.log("Form Submitted:", selectedRowData);

        // Prepare data for submission
        const responses = Object.keys(selectedRowData).map((fieldName) => ({
            FieldName: fieldName,
            Response: selectedRowData[fieldName],
        }));

        // Post the form responses
        try {
            const response = await postData('/api/submitFormResponse', {
                selectedRowData,
                responses,
            });

            if (response.success) {
                setSubmissionStatus("Form submitted successfully!");
                setSelectedRowData({});
            } else {
                setSubmissionStatus("Failed to submit form.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmissionStatus("Error submitting form.");
        }
    };

    // Conditional Rendering Based on Assign Data Loading State
    if (isAssignDataLoading) {
        return <p>Loading assignment data...</p>;
    }

    if (assignDataError) {
        return <p>{assignDataError}</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div className="pl-1 mb-4"><CustomBreadcrumbs /></div>
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                <CustomAgGridDataTable2

                    title="Forms"
                    primaryButton={{
                        label: "Create Form",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: handleModalToggle,
                        // disabled: disableSection,
                    }}

                    rows={forms}
                    columns={columns.filter(
                        (col) =>
                            ![
                                'maker User',
                                'maker Date',
                                'Created By',
                                'Visibility',
                                'update User',
                                'update Time',
                            ].includes(col.headerName)
                    )}
                    rowSelected={(row) => handleFillForm(row.FormInstanceId)} // Pass formInstanceId to handleFillForm
                    getRowClassName={(params) =>
                        params.row.Status === 'Completed' ? 'completed-row' : ''
                    }
                />


                <EditModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSubmit}
                    modalTitle="Edit Form"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />

                {showModal && (
                    <CreateFormModal
                        onClose={handleModalToggle}
                        showModal={showModal}
                    />
                )}

                {/* Submission Status Message */}
                {submissionStatus && (
                    <p className={styles.submissionStatus}>{submissionStatus}</p>
                )}
            </div>
        </div>
    );
};

export default Forms;
