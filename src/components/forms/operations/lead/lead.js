import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import UpdateLead, {fetchLeadData,} from "@/components/forms/operations/lead/update_lead";
import EditModal from "@/components/widgets/EditModal";

Modal.setAppElement("#__next");

const Lead = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        FirstName: "",
        LastName: "",
        Type: "",
    });

    const [leadData, setLeadData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAndSetLeadData = async () => {
            const data = await fetchLeadData();
            setLeadData(data);
        };
        fetchAndSetLeadData();
        return () => {
            mounted = false;
        };
    }, []);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData(
                "/api/postCrmLeadGeneralData",
                form,
                window.location.href
            );
            console.log("lead : ", response)
            if (response.success) {
                setOutput("Lead  added successfully");
                clearForm();
                setShowForm(false);
                fetchLeadData().then((data) => setLeadData(data));
            } else {
                setOutput("Failed to add lead");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            FirstName: "",
            LastName: "",
            Type: "",
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    const fields = [
        {
            id: "FirstName",
            label: "First Name",
            type: "text",
            value: form.FirstName,
            onChange: handleChange,
        },
        {
            id: "LastName",
            label: "Last Name",
            type: "text",
            value: form.LastName,
            onChange: handleChange,
        },
        {
            id: "Type",
            label: "Type",
            type: "text",
            value: form.Type,
            onChange: handleChange,
        },
    ];


    return (
        <div>
            <UpdateLead
                leadData={leadData}
                setLeadData={setLeadData}
                setShowForm={setShowForm}
            />
            <div style={{padding: "1rem", zIndex: "5"}}>
                {/* <hr />

        <Modal
          style={{
            content: {
              maxWidth: "600px",
              margin: "0 auto",
              maxHeight: "80vh",
              overflow: "auto",
            },
            overlay: {
              zIndex: "10",
            },
          }}
          isOpen={showForm}
          contentLabel="Add Lead "
        >
          <ModalHeader
            title={"Add new lead"}
            onCloseButtonClick={handleModalCancel}
          />
          <form
            style={{ padding: "1rem", transition: "all 0.5s" }}
            onSubmit={handleSubmit}
          >
            <Container>
              <Row>
                <Col md={6}>
                  <InputField
                    label="First Name "
                    type="text"
                    id="FirstName"
                    value={form.FirstName}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <InputField
                    label="Last Name "
                    type="text"
                    id="LastName"
                    value={form.LastName}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <InputField
                    label="Type "
                    type="text"
                    id="Type"
                    value={form.Type}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Button
                    type="submit"
                    label="Create"
                    variant="contained"
                    disabled={isSubmitting}
                  />
                </Col>
              </Row>
              <InfoOutput output={output} />
            </Container>
          </form>
        </Modal> */}
            </div>
            <EditModal
                show={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSubmit}
                modalTitle="Add new lead"
                fields={fields}
                data={form}
                onChange={handleChange}
            />
        </div>
    );
};

export default Lead;