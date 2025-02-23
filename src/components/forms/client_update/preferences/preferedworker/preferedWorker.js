import React, {useCallback, useContext, useEffect, useRef, useState,} from "react";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdatePrefered, {
    fetchWorkerPreferedData,
} from "@/components/forms/client_update/preferences/preferedworker/update_preferedWorker";
import {useRouter} from "next/router";
import {Col, Row} from 'react-bootstrap';

Modal.setAppElement("#__next");

const PreferedWorker = () => {
    const router = useRouter();
    const {ClientID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        worker: [],
    });
    const [workerPreferedData, setWorkerPreferedData] = useState({
        data: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workerMaster, setWorkerMaster] = useState([]);
    const selectedWorkersRef = useRef([]);
    const workerDataArrayRef = useRef([]);

    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerPreferedData = useCallback(async () => {
        const data = await fetchWorkerPreferedData(ClientID);
        setWorkerPreferedData(data);
        const workerMasterdata = await fetchData(
            "/api/getActiveWorkerMasterData",
            window.location.href
        );
        setWorkerMaster(workerMasterdata.data);
    }, [ClientID]);


    useEffect(() => {
        fetchAndSetWorkerPreferedData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Worker', setDisableSection);
    }, [fetchAndSetWorkerPreferedData]);

    const handleSubmitPrefered = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            // Constructing an array with required worker data including Area and Current
            for (const worker of selectedWorkersRef.current) {
                try {
                    const newWorkerData = {
                        WorkerID: worker.WorkerID,
                        FirstName: worker.FirstName,
                        LastName: worker.LastName,
                        Notes: "",
                        Area: worker.Area,
                        Division: worker.Division,
                        CarerID: worker.CarerID,
                        Current: worker.Current === 0 ? "No" : "Yes",
                    };
                    workerDataArrayRef.current = [
                        ...workerDataArrayRef.current,
                        newWorkerData,
                    ];
                    console.log("test", workerDataArrayRef.current);
                } catch (error) {
                    console.error("Error fetching worker data:", error);
                }
            }

            const response = await postData(
                `/api/insertClientWorkerPreferedData/${ClientID}`,
                {
                    workers: workerDataArrayRef.current, // Sending the array of worker data
                },
                window.location.href
            );

            if (response.success) {
                setOutput("Worker Prefered added successfully");
                clearForm();
                workerDataArrayRef.current = [];
                fetchAndSetWorkerPreferedData();
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
            const selectedWorker = workerMaster.find((w) => w.FirstName == value);
            if (selectedWorker) {
                // Fetch additional data
                const fetchedWorkerData = await fetchData(
                    `/api/getWorkerGeneralProfileData/${selectedWorker.WorkerID}`,
                    window.location.href
                );
                selectedWorkersRef.current = [
                    ...selectedWorkersRef.current,
                    {
                        WorkerID: selectedWorker.WorkerID,
                        FirstName: selectedWorker.FirstName,
                        LastName: selectedWorker.LastName,
                        Division: fetchedWorkerData.data[0]?.Division,
                        Area: fetchedWorkerData.data[0]?.Area,
                        Current: fetchedWorkerData.data[0]?.Current,
                        CarerID: fetchedWorkerData.data[0]?.CarerCode,
                    },
                ];
                console.log(selectedWorkersRef.current);
            }
        } else {
            selectedWorkersRef.current = selectedWorkersRef.current.filter(
                (worker) => worker.FirstName !== value
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
            <UpdatePrefered
                workerPreferedData={workerPreferedData}
                setWorkerPreferedData={setWorkerPreferedData}
                setShowForm={setShowForm}
                ClientID={ClientID}
            />
            <Modal
                isOpen={showForm}
                contentLabel="Add Worker Prefered"
                style={{
                    content: {
                        maxWidth: "600px",
                        margin: "0 auto",
                        maxHeight: "600px",
                        marginTop: '12vh',
                        borderRadius: '15px',
                        overflowY: "auto"
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
            >
                <ModalHeader
                    title="Add Worker Prefered"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <form onSubmit={handleSubmitPrefered}>
                    {workerMaster.map((worker) => (
                        <div key={worker.WorkerID}>
                            <input
                                type="checkbox"
                                value={worker.FirstName}
                                disabled={disableSection}
                                style={{transform: "scale(1.5)", marginRight: "8px"}}
                                checked={selectedWorkersRef.current.find(
                                    (w) => w.FirstName === worker.FirstName
                                )}
                                onChange={handleWorkerSelection}
                            />
                            <label>&nbsp;{worker.FirstName}</label>
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

export default PreferedWorker;
