import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import MButton from "@/components/widgets/MaterialButton";
import ModalHeader from "@/components/widgets/ModalHeader";
import InfoOutput from "@/components/widgets/InfoOutput";
import { postData } from "@/utility/api_utility";
import { fetchLeadData } from "@/components/forms/operations/lead/update_lead";
import { Col, Container, Row } from "react-bootstrap";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const Importcsv = () => {
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

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await postData(
        "/api/postCrmLeadData",
        form,
        window.location.href
      );
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

  return (
    <div>
      <div style={{ padding: "1rem", zIndex: "5" }}>
        <div>
          <div className="pl-2 mb-3"><CustomBreadcrumbs /></div>
        </div>
        <Container>
          <Row className="mt-5">
            <Col>
              <InputField
                label="Type"
                type="select"
                id="Type"
                value={form.Type}
                onChange={handleChange}
                options={[
                  { value: "Clients", label: "Clients" },
                  { value: "Workers", label: "Workers" },
                  { value: "Expenses", label: "Expenses" },
                ]}
              />
            </Col>
            <Col>
              <InputField
                label="Date Format"
                type="select"
                id="DateFormat"
                value={form.DateFormat}
                onChange={handleChange}
                options={[]}
              />
            </Col>
            <Col>
              <InputField
                label="UploadFile"
                type="file"
                id="FileUpload"
                value={form.FileUpload}
                onChange={handleChange} // Handle file changes
              />
            </Col>
          </Row>
        </Container>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "3rem",
          }}
        >
          <MButton
            type="submit"
            label="Create"
            variant="contained"
            disabled={isSubmitting}
          />
        </div>
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
        </Modal>
      </div>
    </div>
  );
};

export default Importcsv;
