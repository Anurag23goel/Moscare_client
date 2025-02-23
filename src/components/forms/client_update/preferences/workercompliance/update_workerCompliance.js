import React, {useEffect, useState} from "react";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, getColumns} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Box} from "@mui/material";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";

export const fetchWorkerComplianceData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientWorkerComplianceData/${ClientID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching worker preference data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateCompliance = ({
                              setWorkerComplianceData,
                              workerComplianceData,
                              setShowForm,
                              ClientID,
                          }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Description: "",
    });
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const fetchAndSetWorkerComplianceData = async () => {
        const data = await fetchWorkerComplianceData(ClientID);
        setWorkerComplianceData(data);
        setColumns(getColumns(data))
    };

    useEffect(() => {
        fetchAndSetWorkerComplianceData();
        fetchUserRoles("m_cprofile", "Client_Profile_WorkerCompliance", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientWorkerComplianceData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            fetchAndSetWorkerComplianceData();
            setWorkerComplianceData(await fetchWorkerComplianceData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    return (
        <div>
            {/* <hr></hr> */}
            <p style={{
                fontSize: "1rem", marginTop: "1rem", fontWeight: '800', borderBottom: "2px solid black",
                paddingBottom: "4px"
            }}>
                Required Worker Compliances
            </p>


            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <SaveDelete display2={"none"} deleteOnClick={handleDelete} disabled={disableSection}/>
                <MButton
                    style={{margin: "0px 15px 30px 15px"}}
                    label="Add Compliance"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowForm(true)}
                    size="small"
                />
            </Box>
            {/* <MListingDataTable
        rows={workerComplianceData.data}
        rowSelected={handleSelectRowClick}
      /> */}

            <AgGridDataTable
                rows={workerComplianceData.data}
                rowSelected={handleSelectRowClick}
                columns={columns}
            />
        </div>
    );
};

export default UpdateCompliance;
