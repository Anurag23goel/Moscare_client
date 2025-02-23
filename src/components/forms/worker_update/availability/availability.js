import React, {useCallback, useEffect, useState} from "react";
// import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, fetchUserRoles, postData} from "@/utility/api_utility";
import UpdateAvailability, {
    fetchWorkerAvailabilityData,
} from "@/components/forms/worker_update/availability/update_availability";
import {Checkbox} from "@mui/material";
import {useRouter} from "next/router";
import {Col, Container, Modal, Row} from 'react-bootstrap';
import MButton from "@/components/widgets/MaterialButton";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";

// Modal.setAppElement("#__next");

const Availability = ({setAvailabilityEdit, setSelectedComponent}) => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        LeaveDate: "",
        LeaveTill: "",
        LeaveFrom: "",
        LeaveTo: "",
        LeaveEntireDay: false,
        LeaveType: "",
        LeaveNote: "",
        LeaveRemark: "",
        LeaveStatus: "",
        range: false,
    });
    const [workerAvailabilityData, setWorkerAvailabilityData] = useState({
        data: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [leaveType, setLeaveType] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerAvailabilityData = useCallback(async () => {
        const data = await fetchWorkerAvailabilityData(WorkerID);
        const leavetype = await fetchData(
            "/api/getLeaveType",
            window.location.href
        );
        setLeaveType(leavetype.data);
        setWorkerAvailabilityData(data);
    }, [WorkerID]);

    const handleSubmitAvailability = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerAvailabilityLeaveData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Availability added successfully");
                clearForm();
                await fetchAndSetWorkerAvailabilityData();
            } else {
                setOutput("Failed to add worker availability");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker availability");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setFormData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };

  const handleRangeChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      range: !prevData.range,
      LeaveTill: !prevData.range ? prevData.LeaveTill : "", // Clear LeaveTill if range is unchecked
    }));
  };

    const clearForm = () => {
        setOutput("");
        setFormData({
            LeaveDate: "",
            LeaveTill: "",
            LeaveFrom: "",
            LeaveTo: "",
            LeaveEntireDay: false,
            LeaveType: "",
            LeaveNote: "",
            LeaveRemark: "",
            LeaveStatus: "",
            range: false,
        });
        setShowForm(false);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    useEffect(() => {
        fetchAndSetWorkerAvailabilityData();
        fetchUserRoles('m_wprofile', 'Worker_Profile_Availability', setDisableSection);
    }, []);

    return (
        <div>
            <UpdateAvailability
                workerAvailabilityData={workerAvailabilityData}
                setWorkerAvailabilityData={setWorkerAvailabilityData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
                setAvailabilityEdit={setAvailabilityEdit}
                setSelectedComponent={setSelectedComponent}
            />
            <Modal
                show={showForm}
                onHide={handleModalCancel}
                centered
                style={{backgroundColor: "rgba(255,255,255,0.75)"}}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Add Worker Availability</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <form
                        style={{transition: "all 0.5s"}}
                        onSubmit={handleSubmitAvailability}>
                        <Container>
                            <Row>
                                <Col md={4}>
                                    <InputField
                                        type="date"
                                        id="LeaveDate"
                                        label="Date:"
                                        value={formData.LeaveDate}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                    />
                                </Col>
                                <Col md={4}>
                                    <InputField
                                        type="select"
                                        id="LeaveType"
                                        label="Leave Type:"
                                        value={formData.LeaveType}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        options={leaveType.map((leavetype) => {
                                            return {
                                                value: leavetype.LeaveType,
                                                label: leavetype.LeaveType,
                                            };
                                        })}
                                    />
                                </Col>
                                <Col md={4}>
                                    <InputField
                                        type="textarea"
                                        id="LeaveRemark"
                                        label="Leave Remark:"
                                        value={formData.LeaveRemark}
                                        disabled={disableSection}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={4}>
                                    <Checkbox
                                        id="range"
                                        checked={formData.range}
                                        disabled={disableSection}
                                        onChange={handleRangeChange}
                                        name="checkbox"
                                    />
                                    Range
                                    {formData.range && (
                                        <InputField
                                            type="date"
                                            id="LeaveTill"
                                            label="To Date:"
                                            value={formData.LeaveTill}
                                            disabled={disableSection}
                                            onChange={handleInputChange}
                                        />
                                    )}
                                </Col>
                                <Col md={4}>
                                    <Checkbox
                                        id="LeaveEntireDay"
                                        checked={formData.LeaveEntireDay}
                                        onChange={handleInputChange}
                                        disabled={disableSection}
                                        name="checkbox"
                                    />
                                    Entire Day:
                                </Col>
                            </Row>


                            <InfoOutput output={output}/>
                        </Container>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Row className="mt-3 mb-3">
                        {/* <Col className="d-flex justify-content-between">
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
                          </Col> */}
                    </Row>

                    <MButton
                        style={{
                            backgroundColor: "yellow",
                            padding: "5px 12px",
                            marginRight: "1rem",
                        }}
                        label="Cancel"
                        variant="contained"
                        color="primary"
                        startIcon={<CancelIcon/>}
                        onClick={clearForm}
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
                        onClick={handleSubmitAvailability}
                        size="small"
                        // Add fallback for errMsgs
                    />

                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Availability;