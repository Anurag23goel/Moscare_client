import React, {useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Container} from "react-bootstrap";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import StatusBar from "@/components/widgets/StatusBar";
import EditModal from "@/components/widgets/EditModal";

export const fetchWorkerNonPreferedData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientWorkerNonPreferedData/${ClientID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker preference data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateNonPrefered = ({
                               setWorkerNonPreferedData,
                               workerNonPreferedData,
                               setShowForm,
                               ClientID,
                           }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Notes: "",
        Current: "",
    });

    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([]);
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchAndSetWorkerNonPreferedData = async () => {
        const data = await fetchWorkerNonPreferedData(ClientID);
        setWorkerNonPreferedData(data);
        setColumns(getColumns(data));
    };

    useEffect(() => {
        fetchAndSetWorkerNonPreferedData();
        fetchUserRoles(
            "m_cprofile",
            "Client_Profile_NonPreferedWorker",
            setDisableSection
        );
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientWorkerNonPreferedData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setAlert(true);
            setStatus(data.success);
            setWorkerNonPreferedData(await fetchWorkerNonPreferedData(ClientID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
            setStatus(data.success);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientWorkerNonPreferedData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerNonPreferedData(await fetchWorkerNonPreferedData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Notes: "",
            Current: "",
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
            <p
                style={{
                    fontSize: "1rem",
                    marginTop: "1rem",
                    fontWeight: "800",
                    borderBottom: "2px solid black",
                    paddingBottom: "4px",
                }}
            >
                Non Preferred Workers
            </p>
            <Container>
                {alert && (
                    <StatusBar
                        status={status}
                        setAlert={setAlert}
                        msg="Data updated successfully"
                    />
                )}
                {/* <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled={disableSection} /> */}
                {/* <Row className="mt-4 mb-4">
            <Col>
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
            <Col>
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

                <MButton
                    style={{margin: "20px 15px 30px 15px"}}
                    label="Add Any Worker"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowForm(true)}
                    size="small"
                />
            </Container>

            <AgGridDataTable
                rows={workerNonPreferedData.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
            />

            <EditModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave} // Function to handle save action
                modalTitle="Edit Area Details" // Modal title
                fields={fields} // Pass the defined fields
                data={selectedRowData || {}} // Pass current selected row's data
                onChange={handleInputChange}
            />
        </div>
    );
};

export default UpdateNonPrefered;
