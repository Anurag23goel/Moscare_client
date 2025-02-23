import React, {useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Container} from 'react-bootstrap';
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import StatusBar from "@/components/widgets/StatusBar";
import EditModal from "@/components/widgets/EditModal";


export const fetchWorkerPreferedData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientWorkerPreferedData/${ClientID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker preference data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdatePrefered = ({
                            setWorkerPreferedData,
                            workerPreferedData,
                            setShowForm,
                            ClientID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        FirstName: "",
        LastName: "",
        Notes: "",
        Area: "",
        Current: "",
        Division: "",
    });
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const [alert, setAlert] = useState(false)
    const [status, setStatus] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const fetchAndSetWorkerPreferedData = async () => {
        const data = await fetchWorkerPreferedData(ClientID);
        setWorkerPreferedData(data);
        setColumns(getColumns(data))
    };

    useEffect(() => {
        fetchAndSetWorkerPreferedData();
        fetchUserRoles('m_cprofile', 'Client_Profile_WorkerPrefered', setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
        setShowModal(true)
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientWorkerPreferedData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setAlert(true)
            setStatus(data.success)
            setWorkerPreferedData(await fetchWorkerPreferedData(ClientID));
            handleClearForm();
        } catch (error) {

            setStatus(false)
            console.error("Error saving data:", error);
        }
        setShowModal(false)
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientWorkerPreferedData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerPreferedData(await fetchWorkerPreferedData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            FirstName: "",
            LastName: "",
            Notes: "",
            Area: "",
            Current: "",
            Division: "",
        });
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setSelectedRowData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };


    const fields = [
        {
            id: "Area",
            label: "Area:",
            type: "text",
        },
        {
            id: "Division",
            label: "Division:",
            type: "text",
        },
        {
            id: "Current",
            label: "Current:",
            type: "select",
            options: [
                {value: "", label: "NONE"},
                {value: "Yes", label: "Yes"},
                {value: "No", label: "No"},
            ],
        },
        {
            id: "Notes",
            label: "Notes:",
            type: "textarea",
        },
    ];


    return (
        <div>
            {/* <hr></hr> */}
            <p style={{
                fontSize: "1rem", marginTop: "1rem", fontWeight: '800', borderBottom: "2px solid black",
                paddingBottom: "4px"
            }}>Preferred Workers</p>
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    // padding: "0.5rem",
                    // margin: "1rem",
                    maxWidth: "90vw",
                    backgroundColor: "#fff",
                    marginTop: "1rem",
                    borderRadius: "15px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    padding: "1rem 2rem",
                    alignItems: "flex-start",
                }}
            >
                <Container>
                    {
                        alert
                        &&
                        <StatusBar status={status} setAlert={setAlert} msg="Data updated successfully"/>
                    }

                    <MButton
                        style={{margin: "20px 15px 30px 15px"}}
                        label="Add Any Worker"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />

                    <MButton
                        style={{margin: "20px 15px 30px 15px"}}
                        label="Add Prefered Worker"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowForm(true)}
                        size="small"
                    />

                    <AgGridDataTable
                        rows={workerPreferedData.data}
                        rowSelected={handleSelectRowClick}
                        columns={columns}
                    />

                    {/* <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled={disableSection} /> */}

                    {/* <Row className="mt-4">
            <Col md={4}>
              <InputField
                id="Area"
                label="Area:"
                value={selectedRowData.Area}
                type="text"
                onChange={handleInputChange}
                disabled={disableSection}
              />
            </Col>
            <Col md={4}>
              <InputField
                id="Division"
                label="Division:"
                value={selectedRowData.Division}
                type="text"
                onChange={handleInputChange}
                disabled={disableSection}
              />
            </Col>
            <Col md={4}>
              <InputField
                id="Current"
                label="Current:"
                value={selectedRowData.Current == "No" ? "No" : "Yes"}
                type="select"
                onChange={handleInputChange}
                disabled={disableSection}
                options={[
                  { value: "", label: "NONE" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />
            </Col>
          </Row>
          <Row className="mt-4 mb-4">
            <Col md={6}>
              <InputField
                id="Notes"
                label="Notes:"
                value={selectedRowData.Notes}
                type="textarea"
                onChange={handleInputChange}
                disabled={disableSection}
              />
            </Col>
          </Row> */}

                    <EditModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleSave} // Function to handle save action
                        modalTitle="Edit Area Details" // Modal title
                        fields={fields} // Pass the defined fields
                        data={selectedRowData || {}} // Pass current selected row's data
                        onChange={handleInputChange}
                    />


                </Container>
            </form>
            <br/>


        </div>
    );
};

export default UpdatePrefered;
