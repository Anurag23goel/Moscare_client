import React, {useCallback, useContext, useEffect, useState} from "react";
import {Col, Container, Modal, Row} from "react-bootstrap";
// import ModalHeader from "@/components/widgets/ModalHeader";
// import Button from "@/components/widgets/Button";
import InfoOutput from "@/components/widgets/InfoOutput";
import {fetchData, postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateSkill, {fetchWorkerSkillData,} from "@/components/forms/worker_update/skills/update_skill";
import {useRouter} from "next/router";
import {Checkbox} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import MButton from "@/components/widgets/MaterialButton";
// Modal.setAppElement("#__next");

const Skill = () => {
    const router = useRouter();
    const {WorkerID} = router.query;
    const [showForm, setShowForm] = useState(false);
    const [showForm2, setShowForm2] = useState(false);
    const [output, setOutput] = useState("");
    const [skill, setSkill] = useState("");
    const [note, setNote] = useState("");
    const [workerSkillData, setWorkerSkillData] = useState({data: []});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skillData, setSkillData] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [formData, setFormData] = useState([]);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetWorkerSkillData = useCallback(async () => {
        const data = await fetchWorkerSkillData(WorkerID);
        const skilldata = await fetchData("/api/getSkills", window.location.href);
        setSkillData(skilldata.data);
        setWorkerSkillData(data);
    }, [WorkerID]);

    useEffect(() => {
        fetchAndSetWorkerSkillData();
    }, []);

    const handleSubmitSingleSkill = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {skill, note};
        try {
            const response = await postData(
                `/api/insertWorkerSkillData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Skill added successfully");
                clearForm();
                fetchAndSetWorkerSkillData();
            } else {
                setOutput("Failed to add worker skill");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker skill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitMultipleSkills = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {skill: selectedSkills, note};
        console.log("formdata : ", formData);

        try {
            const response = await postData(
                `/api/insertWorkerSkillData/${WorkerID}`,
                formData,
                window.location.href
            );
            if (response.success) {
                setOutput("Worker Skills added successfully");
                clearForm();
                fetchAndSetWorkerSkillData();
            } else {
                setOutput("Failed to add worker skills");
            }
        } catch (error) {
            console.error(error);
            setOutput("An error occurred while adding worker skills");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setOutput("");
        setSkill("");
        setNote("");
        setShowForm2(false);
        setShowForm(false);
        setSelectedSkills([]);
    };

    const handleModalCancel = () => {
        clearForm();
        setShowForm(false);
        setShowForm2(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleInputChange = ({id, value, checked, type}) => {
        setFormData((prevState) => {
            if (type === "checkbox") {
                const updatedSkills = checked
                    ? {...prevState, [id]: value} // Add the value if checked
                    : Object.fromEntries(
                        Object.entries(prevState).filter(([key]) => key !== id) // Remove if unchecked
                    );
                return updatedSkills;
            }

            // Handle other input types (e.g., text)
            return {...prevState, [id]: value};
        });
    };

    // Generate Fields Array
    const fields = skillData.map((skill) => ({
        id: skill.ID,
        label: skill.Description,
        type: "checkbox",
        checked: selectedSkills.includes(skill.Description),
        onChange: (event) => {
            const {checked} = event.target;
            setSelectedSkills((prevSelectedSkills) => {
                if (checked) {
                    return [...prevSelectedSkills, skill.Description];
                } else {
                    return prevSelectedSkills.filter(
                        (item) => item !== skill.Description
                    );
                }
            });
        },
    }));

    useEffect(() => {
        console.log("skillData : ", skillData);
    }, [skillData]);

    return (
        <div
            style={{

                // marginLeft: "2rem",
                // marginTop: "2rem",
                width: "100%",
            }}
        >
            <UpdateSkill
                workerSkillData={workerSkillData}
                setWorkerSkillData={setWorkerSkillData}
                setShowForm={setShowForm}
                WorkerID={WorkerID}
                setShowForm2={setShowForm2}
            />

            <Modal
                show={showForm2}
                onHide={handleModalCancel}
                centered
                style={{backgroundColor: "rgba(255,255,255,0.75)"}}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Multiple Skills</Modal.Title>
                </Modal.Header>
                {/* <ModalHeader
          title="Add Multiple Skills"
          onCloseButtonClick={handleModalCancel}
        /> */}
                <Modal.Body>
                    <form
                        style={{transition: "all 0.5s"}}
                        onSubmit={handleSubmitMultipleSkills}
                    >
                        <Container>
                            <Row>
                                {skillData.map((skill, i) => (
                                    <div key={i}>
                                        <Col>
                                            <Checkbox
                                                id="Skill Description"
                                                label="Skill Description:"
                                                value={skill.Description}
                                                checked={selectedSkills.includes(skill.Description)}
                                                onChange={(event) => {
                                                    const {value} = event.target;
                                                    setSelectedSkills((prevSelectedSkills) => {
                                                        if (prevSelectedSkills.includes(value)) {
                                                            return prevSelectedSkills.filter(
                                                                (selectedSkill) => selectedSkill !== value
                                                            );
                                                        } else {
                                                            return [...prevSelectedSkills, value];
                                                        }
                                                    });
                                                }}
                                                name="checkbox"
                                            />
                                            <label>{skill.Description}</label>
                                        </Col>
                                    </div>
                                ))}
                            </Row>
                        </Container>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Row className="mt-0 mb-0">
                        <Col className="d-flex justify-content-end gap-3">


                            {/* <Button
                    onClick={handleModalCancel}
                    style={{
                      backgroundColor: "darkgray",
                      border: "none",
                      borderRadius: "25px",
                      width: "250px",
                      padding: "8px 4px",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitMultipleSkills}
                    style={{
                      backgroundColor: "blue",
                      border: "none",
                      borderRadius: "25px",
                      width: "250px",
                      padding: "8px 4px",
                    }}
                  >
                    Create
                  </Button> */}

                            <MButton
                                style={{
                                    backgroundColor: "yellow",
                                    padding: "5px 12px",

                                }}
                                label="Cancel"
                                variant="contained"
                                color="primary"
                                startIcon={<CancelIcon/>}
                                onClick={handleModalCancel}
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
                                onClick={handleSubmitMultipleSkills}
                                size="small"
                            />
                        </Col>
                    </Row>
                </Modal.Footer>
                <InfoOutput output={output}/>


            </Modal>

            {/* <EditModal
  show={showForm2}
  onClose={() => setShowForm2(false)}
  onSave={(e) => handleSubmitMultipleSkills(e)}
  modalTitle="Add Multiple Skills"
  fields={fields}
  data={formData || {}} 
  onChange={handleInputChange }
/> */}
        </div>
    );
};

export default Skill;
