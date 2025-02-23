import React, {useCallback, useContext, useEffect, useRef, useState,} from "react";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchUserRoles, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateCompliance, {
    fetchWorkerComplianceData,
} from "@/components/forms/client_update/preferences/workercompliance/update_workerCompliance";
import {useRouter} from "next/router";
import {Col, Row} from 'react-bootstrap';

Modal.setAppElement("#__next");

const WorkerCompliance = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        worker: [],
    });
    const [workerComplianceData, setWorkerComplianceData] = useState({
        data: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workerCompliance, setWorkerCompliance] = useState([]);
    const selectedWorkersRef = useRef([]);
    const workerDataArrayRef = useRef([]);

    const [disableSection, setDisableSection] = useState(false);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userId = getCookieValue('User_ID');
    /*  console.log("User_ID", userId); */

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerComplianceData = useCallback(async () => {
        const data = await fetchWorkerComplianceData(ClientID);
        setWorkerComplianceData(data);
        //   const workerCompliancedata = await fetchData("/api/getTrainingItems");
        //   setWorkerCompliance(workerCompliancedata.data);
    }, [ClientID]);

    useEffect(() => {
        fetchAndSetWorkerComplianceData();
        fetchUserRoles('m_cprofile', 'Client_Profile_WorkerCompliance', setDisableSection);
    }, [fetchAndSetWorkerComplianceData]);

    const handleSubmitCompliance = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            // Constructing an array with required worker data including Area and Current
            for (const worker of selectedWorkersRef.current) {
                try {
                    const newWorkerData = {
                        Description: worker.Description,
                    };
                    workerDataArrayRef.current = [
                        ...workerDataArrayRef.current,
                        newWorkerData,
                    ];
                    console.log("selecteds", worker);
                } catch (error) {
                    console.error("Error fetching worker data:", error);
                }
            }

            const response = await postData(
                `/api/insertClientWorkerComplianceData/${ClientID}`,
                {
                    workers: workerDataArrayRef.current, // Sending the array of worker data
                },
                window.location.href
            );

            if (response.success) {
                setOutput("Worker Compliance added successfully");
                clearForm();
                workerDataArrayRef.current = [];
                fetchAndSetWorkerComplianceData();
            } else {
                setOutput("Failed to add worker preferences");
            }
        } catch (error) {
            console.error("Error handling preferences submission:", error);
            setOutput("An error occurred while adding worker preferences");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWorkerSelection = async (event) => {
        const {checked, value} = event.target;

        if (checked) {
            const selectedWorker = workerCompliance.find(
                (w) => w.Description == value
            );
            if (selectedWorker) {
                selectedWorkersRef.current = [
                    ...selectedWorkersRef.current,
                    {
                        Description: selectedWorker.Description,
                    },
                ];
            }
        } else {
            selectedWorkersRef.current = selectedWorkersRef.current.filter(
                (worker) => worker.Description !== value
            );
        }
    };

    const clearForm = () => {
        setOutput("");
        setFormData({
            worker: [],
        });
        selectedWorkersRef.current = [];
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div style={{padding: "1rem", width: "90%", marginInline: "auto"}}>
            <UpdateCompliance
                workerComplianceData={workerComplianceData}
                setWorkerComplianceData={setWorkerComplianceData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Compliance"
                style={{
                    content: {
                        maxWidth: "600px",
                        margin: "0 auto",
                        maxHeight: "fit-content",
                        marginTop: '5vh',
                        borderRadius: '15px'
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Worker Compliance"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmitCompliance}>
                    <p style={{color: "red"}}>
                        this is comment it should be fetched when compliance maintance done
                    </p>
                    {workerCompliance.map((worker) => (
                        <div key={worker.WorkerID}>
                            <input
                                type="checkbox"
                                value={worker.Description}
                                disabled={disableSection}
                                checked={selectedWorkersRef.current.find(
                                    (w) => w.Description === worker.Description
                                )}
                                onChange={handleWorkerSelection}
                            />
                            <label>{worker.Description}</label>
                        </div>
                    ))}
                    <br/>
                    <Row className="mt-3">
                        <Col className="d-flex justify-content-between">
                            <Button
                                type="submit"
                                label="Create"
                                backgroundColor={"blue"}
                                disabled={isSubmitting || disableSection}
                            />
                            <Button
                                type="button"
                                label="Clear All"
                                backgroundColor={"yellow"}
                                onClick={clearForm}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <InfoOutput output={output}/>
                </form>
            </Modal>
        </div>
    );
};

export default WorkerCompliance;
