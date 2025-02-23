import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Col, Container, Row} from "react-bootstrap";

export const fetchLocProfClientData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getLocProfClientDataById/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching worker skill data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateLocProfClients = ({
                                  setWorkerSkillData,
                                  workerSkillData,
                                  setShowForm,
                                  setShowForm2,
                                  WorkerID,
                              }) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const [disableSection, setDisableSection] = useState(false);

    const fetchAndSetWorkerSkillData = async () => {
        const data = await fetchLocProfClientData(WorkerID);
        setWorkerSkillData(data);
    };


    useEffect(() => {
        fetchAndSetWorkerSkillData();
        fetchUserRoles('m_wprofile', "Maintainence_LocationProfile_Clients", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/putLocProfClientData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerSkillData(await fetchLocProfClientData(WorkerID));
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocProfClientDataById",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerSkillData(await fetchLocProfClientData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };
    // Function to clear the form
    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            FirstName: "",
            LastName: "",
        });
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    return (
        <Container>
            <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled={disableSection}/>
            <Row>
                <Col md={4}>
                    <InputField
                        type="text"
                        id="FirstName"
                        label="First Name:"
                        value={selectedRowData.FirstName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col md={4}>
                    <InputField
                        type="text"
                        id="LastName"
                        label="Last Name:"
                        value={selectedRowData.LastName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <MButton
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Clients"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            <MButton
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Multiple Clients"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm2(true)}
                disabled={disableSection}
                size="small"
            />
            <MListingDataTable
                rows={workerSkillData.data}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateLocProfClients;
