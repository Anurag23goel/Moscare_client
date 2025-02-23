import React, {useCallback, useEffect, useState} from "react";
import Modal from "react-modal";
import {fetchData, postData} from "@/utility/api_utility";
import UpdateEngagementAward, {
    fetchWorkerEngagementAwardData,
} from "@/components/forms/worker_update/engagement/engagementaward/update_engagementaward";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";


Modal.setAppElement("#__next");

const EngagementAward = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [formData, setFormData] = useState({
        Service: "",
        AwardCode: "",
        AwardSector: "",
    });

    const [workerEngagementAwardData, setWorkerEngagementAwardData] = useState({
        data: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [service, setService] = useState(null);

    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerEngagementAwardData = useCallback(async () => {
        const data = await fetchWorkerEngagementAwardData(WorkerID);
        setWorkerEngagementAwardData(data);
        const serviceData = await fetchData(
            "/api/getServicesData",
            window.location.href
        );
        setService(serviceData);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerEngagementAwardData();
    }, []);

    const handleSubmitEngagementAward = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                `/api/insertWorkerEngagementAwardData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker EngagementAward added successfully");
                clearForm();
                fetchAndSetWorkerEngagementAwardData();
            } else {
                setOutput("Failed to add worker engagementAward");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker engagementAward");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = ({id, value}) => {
        setFormData((prevState) => ({...prevState, [id]: value}));
    };
    const clearForm = () => {
        setOutput("");
        setFormData({
            Service: "",
            AwardCode: "",
            AwardSector: "",
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

    const fields = [
        {
            id: "Service",
            label: "Service:",
            value: formData.Service,
            type: "select",
            options: service?.data.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
            onChange: handleInputChange,
        },
        {
            id: "AwardCode",
            label: "Award Code:",
            value: formData.AwardCode,
            type: "select",
            onChange: handleInputChange,
        },
        {
            id: "AwardSector",
            label: "Award Sector:",
            value: formData.AwardSector,
            type: "select",
            onChange: handleInputChange,
        },
    ];

    return (
        <div style={{paddingTop: "1rem", width: "90%"}}>
            <UpdateEngagementAward
                workerEngagementAwardData={workerEngagementAwardData}
                setWorkerEngagementAwardData={setWorkerEngagementAwardData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
            />
            {/* <Modal
        isOpen={showForm}
        contentLabel="Add Worker EngagementAward"
        style={{
          content: {
            maxWidth: "500px", // Set the maximum width of the modal
            margin: "0 auto", // Center the modal horizontally
            maxHeight: "fit-content", // Set the maximum height of the modal
            marginTop: '10vh',
            borderRadius: '15px'
          },
          overlay: {
            zIndex: 10,
          },
        }}
      >
        <ModalHeader
          title="Add Worker Engagement Award"
          onCloseButtonClick={handleModalCancel}
        />
        <br />
        <form
          style={{ padding: "1rem", transition: "all 0.5s" }}
          onSubmit={handleSubmitEngagementAward}>
          <Container>
            <Row>
              <Col md={12} className="mb-3">
                <InputField
                  id="Service"
                  label="Service:"
                  value={formData.Service}
                  type="select"
                  onChange={handleInputChange}
                  options={service?.data.map((form) => ({
                    value: form.Description,
                    label: form.Description,
                  }))}
                />
              </Col>
              <Col md={12} className="mb-3">
                <InputField
                  id="AwardCode"
                  label="Award Code:"
                  value={formData.AwardCode}
                  type="select"
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={12} >
                <InputField
                  id="AwardSector"
                  label="Award Sector:"
                  value={formData.AwardSector}
                  type="select"
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
            <Row className="mt-3 mb-3">
              <Col className="d-flex justify-content-between">
                <Button
                  type="submit"
                  label="Create"
                  backgroundColor={"blue"}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  label="Clear All"
                  backgroundColor={"yellow"}
                  onClick={clearForm}
                />
              </Col>
            </Row>
            <InfoOutput output={output} />
          </Container>
        </form>
      </Modal> */}

            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={(e) => handleSubmitEngagementAward(e)}
                modalTitle="Add Engagement Award"
                fields={fields}
                data={formData || {}} // Pass selectedRowData with fallback to an empty object
                onChange={handleInputChange}
            />
        </div>
    );
};

export default EngagementAward;
