import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import Modal from "react-modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {fetchData, postData} from "@/utility/api_utility";
import {Container} from "react-bootstrap";

function ClientRosters() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchDataAsync = async () => {
            const data = await fetchData(
                "/api/getActiveClientMasterData",
                window.location.href
            );
            console.log("Fetched data:", data);
            setData(data.data);
        };
        fetchDataAsync();
    }, []);

    const handleModalCancel = () => {
        setShowForm(false);
    };

    const handleRowSelect = async (rowData) => {
        const response = await postData(
            `/api/createNewEntryIfNotExist/${rowData.ClientID}`
        );
        console.log("Response:", response);

        router.push(`/client/roster/update/${rowData.ClientID}`).then(() => {
            console.log("Navigated to updateClientRoster");
        });
    };

    const handleRowDoubleClick = (params) => {
        router.push(`/client/roster/update/${params.row.RosterID}`).then(() => {
            console.log("Navigated to updateClientRoster");
        });
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                }}
            >
                <MButton
                    label={"Create New Roster"}
                    color={"success"}
                    variant={"contained"}
                    size={"small"}
                    onClick={() => setShowForm(true)}
                />
                <MButton
                    label={"Email Roster to Clients"}
                    variant={"contained"}
                    startIcon={<AddIcon/>}
                    size={"small"}
                />
            </div>

            <Modal
                style={{
                    content: {
                        maxWidth: "850px",
                        margin: "0 auto",
                        maxHeight: "fit-content",
                    },
                    overlay: {
                        zIndex: 10,
                    },
                }}
                isOpen={showForm}
            >
                <ModalHeader
                    title="Select a Client"
                    onCloseButtonClick={handleModalCancel}
                />
                <br/>
                <MListingDataTable
                    rows={data}
                    rowSelected={() => {
                    }}
                    props={{
                        onRowDoubleClick: (params) => {
                            handleRowSelect(params.row).then(() => {
                                console.log("Row selected:", params.row);
                            });
                        },
                    }}
                />
            </Modal>

            <Container>
                <MListingDataTable
                    rows={data.map(client => ({
                        RosterID: client.ClientID,
                        firstName: client.FirstName,
                        lastName: client.LastName,
                        publish: client.publish ? "On" : "Off",
                        complete: client.completed ? "Yes" : "No",
                    }))}
                    columns={[
                        {field: "RosterID", headerName: "Roster ID"},
                        {field: "firstName", headerName: "First Name"},
                        {field: "lastName", headerName: "Last Name"},
                        {field: "publish", headerName: "Publish"},
                        {field: "complete", headerName: "Complete"},
                    ]}
                    onRowDoubleClick={handleRowDoubleClick}
                />
            </Container>
        </>
    );
}

export default ClientRosters;
