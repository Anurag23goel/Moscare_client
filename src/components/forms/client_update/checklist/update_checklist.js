import React, {useContext, useEffect, useState} from "react";
import Grid from "@/components/widgets/utils/Grid";
import InputField from "@/components/widgets/InputField";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {Button, Modal} from "react-bootstrap";
import {Box} from "@mui/material";
import ColorContext from "@/contexts/ColorContext";

import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";
 
export const fetchClientChecklistData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientChecklistData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching client form data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateChecklist = ({
                             setClientChecklistData,
                             clientChecklistData,
                             setShowForm,
                             ClientID,
                         }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ChecklistName: "",
        ItemName: [],
    });
    const [itemNameArray, setItemNameArray] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);

    // Function to parse ItemName into a comma-separated string
    const parseItemName = (itemName) => {
        if (typeof itemName === "string") {
            // Remove leading and trailing whitespace
            itemName = itemName.trim();

            // Try to parse as JSON
            try {
                const parsed = JSON.parse(itemName);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                // Not JSON, proceed
            }

            // Check if itemName starts with '[' and ends with ']'
            if (itemName.startsWith('[') && itemName.endsWith(']')) {
                itemName = itemName.slice(1, -1);
            }

            const items = itemName.split(",").map((item) => {
                return item.trim().replace(/^"|"$/g, "").replace(/^\"|\"$/g, "");
            });

            return items;
        } else if (Array.isArray(itemName)) {
            return itemName;
        } else {
            return [String(itemName)];
        }
    };
    const handleModalCancel = () => {
        setShowModal(false);
    };
    useEffect(() => {
        const fetchDataAndRoles = async () => {
            const data = await fetchClientChecklistData(ClientID);
            // Parse ItemName into an array and set selectedRowData accordingly
            const parsedData = data.data.map((item) => {
                const itemNameArray = parseItemName(item.ItemName);
                return {
                    ...item,
                    ItemName: itemNameArray,
                    ItemNameDisplay: itemNameArray.join(", "),
                };
            });
            setClientChecklistData({...data, data: parsedData});
            console.log("Parsed client checklist data:", parsedData);
        };
        fetchDataAndRoles();
        fetchUserRoles("m_cprofile", "Client_Profile_Checklist", setDisableSection);
    }, [ClientID]);

    const handleSelectRowClick = (row) => {
        setShowModal(true)
        setSelectedRowData(row);
        const itemNameArray = row.ItemName ? parseItemName(row.ItemName) : [];
        setItemNameArray(itemNameArray);
    };

    const handleSave = async () => {
        try {
            const updatedData = {...selectedRowData, ItemName: itemNameArray};
            const data = await putData(
                "/api/updateClientChecklistData",
                updatedData,
                window.location.href
            );
            console.log("Save clicked:", data);
            const refreshedData = await fetchClientChecklistData(ClientID);
            setClientChecklistData(refreshedData);
        } catch (error) {
            console.error("Error saving data:", error);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientChecklistData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            setSelectedRowData({ChecklistName: "", ItemName: []});
            setItemNameArray([]);
            const refreshedData = await fetchClientChecklistData(ClientID);
            setClientChecklistData(refreshedData);
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;

        setSelectedRowData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleInputChangeTwo = (event, index) => {
        const {value} = event.target;
        const newArray = [...itemNameArray];
        newArray[index] = value;
        setItemNameArray(newArray);
        setSelectedRowData((prevData) => ({
            ...prevData,
            ItemName: newArray,
        }));
    };

  const columns = [
    { field: "ID", headerName: "ID" },
    { field: "ClientID", headerName: "Client ID" },
    { field: "ChecklistName", headerName: "Checklist Name" },
    { field: "ItemNameDisplay", headerName: "Item Names" }, // Ensure this matches ItemNameDisplay
  ];

    console.log("Rows passed to AgGrid:", clientChecklistData?.data || []);
    console.log("Columns passed to AgGrid:", columns);

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                <Modal
                    show={showModal} onHide={handleModalCancel}
                    centered
                    style={{backgroundColor: "rgba(255,255,255,0.75)"}}
                >

                    <Modal.Header closeButton>
                        <Modal.Title>Edit Client CheckList</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form
                            // style={{
                            //   display: "flex",
                            //   flexDirection: "column",
                            //   gap: "1rem",
                            //   padding: "0.5rem",
                            //   margin: "1rem",
                            //   maxWidth: "80vw",
                            // }}
                        >
                            <Grid>
                                <InputField
                                    id="ChecklistName"
                                    label="Checklist Name:"
                                    value={selectedRowData.ChecklistName}
                                    type="text"
                                    onChange={handleInputChange}
                                    disabled={disableSection}
                                />

                                {itemNameArray.map((itemName, index) => (
                                    <InputField
                                        key={index}
                                        label={`Item ${index + 1}:`}
                                        value={itemName}
                                        disabled={disableSection}
                                        type="text"
                                        onChange={(e) => handleInputChangeTwo(e, index)}
                                    />
                                ))}
                                <br/>
                            </Grid>
                        </form>

                        <Box className="mt-4" sx={{display: "flex", justifyContent: "end", gap: "15px"}}>
                            <Button
                                type="button"
                                label="Cancel"
                                style={{
                                    backgroundColor: "darkgray",
                                    border: "none",
                                    borderRadius: "25px",
                                    padding: "8px 16px",
                                    fontSize: "12px",
                                    width: "115px"
                                }}
                                onClick={handleModalCancel}
                                disabled={disableSection}
                            >Cancel</Button>
                            <Button
                                type="submit"
                                label="Create"
                                style={{
                                    backgroundColor: "blue",
                                    border: "none",
                                    borderRadius: "25px",
                                    padding: "8px 16px",
                                    fontSize: "12px",
                                    width: "115px"
                                }}
                                disabled={disableSection}
                                onClick={() => handleSave()}
                            >Save Changes</Button>


          </Box>
        </Modal.Body>
        </Modal>
     
     
      {/* <div style={{ width: "55vw", marginInline: "auto" }}> */}
      <CustomAgGridDataTable2 
        title="Client Checklist"
        primaryButton={{
          label: "Add Client Checklist",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          // disabled: disableSection,
        }}
        
        rows={clientChecklistData?.data || []}
        columns={columns}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        />
        
      {/* </div> */}
    </div>
    </div>
  );
};

export default UpdateChecklist;