import React, {useCallback, useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import { v4 as uuidv4 } from 'uuid';
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";

export const fetchClientAddressData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientAddressData/${ClientID}`,
            window.location.href
        );
        return data;
    } catch (error) {
        console.error("Error fetching client form data:", error);
        return {data: []}; // Return an empty array in case of an  error
    }
};

const UpdateAddress = ({
                           setClientAddressData,
                           clientAddressData,
                           setShowForm,
                           ClientID,
                           states,
                           allSuburbs,
                           filteredStates,
                           setFilteredStates,
                           filteredSuburbs,
                           setFilteredSuburbs
                       }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
        ClientID: "",
        UnitNo: "",
        StreetNo: "",
        AddressLine1: "",
        AddressLine2: "",
        Suburb: "",
        State: "",
        Postcode: "",
        GeneralNotes: "",
        IdentifiedRisks: "",
    });
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const [validationMessages, setValidationMessages] = useState([]);
    const [errMsgs, setErrMsgs] = useState({});

    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);


  const fetchAndSetClientAddressData = async () => {
    const data = await fetchClientAddressData(ClientID);
    setClientAddressData(data);
  
    if (!data?.data || data.data.length === 0) {
      console.error("No data available to generate columns");
      return;
    }
  
    const generatedColumns = Object.keys(data.data[0]).map((field) => ({
      headerName: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable text
      field,
      headerComponent: (props) => <CustomHeader {...props} field={field} />,
      width: 180,
      Cell: (props) => formatCellValue(field, props.value),
    }));
  
    // generatedColumns.push({
    //   headerName: "Actions",
    //   width: 120,
    //   cellRenderer: (params) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         onClick={() => handleRowSelected(params.data)}
    //         className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
    //       >
    //         <Edit className="h-4 w-4" />
    //       </button>
    //       <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
    //         <MoreHorizontal className="h-4 w-4" />
    //       </button>
    //     </div>
    //   ),
    //   suppressMenu: true,
    //   sortable: false,
    //   filter: false,
    //   cellStyle: { display: "flex", justifyContent: "center" },
    // });
  
    setColumns(generatedColumns);
  };
  

    useEffect(() => {
        fetchAndSetClientAddressData();
        fetchUserRoles('m_cprofile', 'Client_Profile_Address', setDisableSection);
    }, []);

    const handleSelectRowClick = async (row) => {
        console.log(row.ID);
        const data = await fetchData(
            `/api/getClientAddressDataAll/${row.ID}`,
            window.location.href
        );
        setSelectedRowData(data.data[0]);
        setShowModal(true)
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientAddressData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            addValidationMessage("Client Contact updated successfully.", "success");
            setClientAddressData(await fetchClientAddressData(ClientID));
        } catch (error) {
            console.error("Error saving data:", error);
            addValidationMessage(`Error updating client contact: ${error.message}`, "error");
        }
        setShowModal(false)
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientAddressData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientAddressData(await fetchClientAddressData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            UnitNo: "",
            StreetNo: "",
            AddressLine1: "",
            AddressLine2: "",
            Suburb: "",
            State: "",
            Postcode: "",
            GeneralNotes: "",
            IdentifiedRisks: "",
        });
    };

    const handleInputChange = ({id, value}) => {
        const validators = {
            Postcode: /^\d{4}$/, // AU (4 digits) and NZ postcodes (4 digits)
        };
        setErrMsgs((prevMsgs) => {
            const newErrMsgs = {...prevMsgs};

            // Check if the field is empty
            if (value === "") {
                // Remove error message if the field is empty
                delete newErrMsgs[id];
            } else if (validators[id] && !validators[id].test(value)) {
                // Add error message for invalid input
                newErrMsgs[id] = `Invalid ${id}. Please enter a valid value.`;
            } else {
                // Remove error message if validation passes
                delete newErrMsgs[id];
            }

            return newErrMsgs;
        });
        if (id === "State") {
            const searchTerm = value.toLowerCase().trim(); // User's input
            console.log("search term: " + searchTerm)
            if (searchTerm === "") {
                // If no input, clear filtered states
                setFilteredStates([]);
            } else {
                // Filter states based on search term
                const filteredStates = states.filter((state) =>
                    state.toLowerCase().includes(searchTerm) // Case-insensitive search
                );
                setFilteredStates(filteredStates); // Update filtered states list
            }

            setSelectedRowData((prevState) => ({
                ...prevState,
                State: value, // Ensure the value from the input is updated in the state
            }));
        }

        if (id === "Suburb") {
            const searchTerm = value.toLowerCase().trim(); // User's input
            console.log("search term: " + searchTerm);

            if (searchTerm === "") {
                // If no input, clear filtered suburbs
                setFilteredSuburbs([]);
            } else {
                // Filter merged suburbs based on search term
                const filteredSuburbsList = allSuburbs.filter((suburb) =>
                    suburb.toLowerCase().includes(searchTerm) // Case-insensitive search
                );
                setFilteredSuburbs(filteredSuburbsList); // Update filtered suburbs list
            }

            setSelectedRowData((prevState) => ({
                ...prevState,
                Suburb: value, // Ensure the value from the input is updated in the form state
            }));
        }
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };

    // Fields for EditModal
    const fields = [
        {id: "UnitNo", label: "UnitNo:", type: "number"},
        {id: "StreetNo", label: "StreetNo:", type: "number"},
        {id: "AddressLine1", label: "AddressLine1:", type: "text"},
        {id: "AddressLine2", label: "AddressLine2:", type: "text"},
        {id: "Suburb", label: "Suburb:", type: "text"},
        {id: "State", label: "State:", type: "text"},
        {id: "Postcode", label: "Postcode:", type: "number"},
        {id: "GeneralNotes", label: "GeneralNotes:", type: "textarea"},
        {id: "IdentifiedRisks", label: "IdentifiedRisks:", type: "textarea"},
    ];

    return (

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                <ValidationBar
                    messages={validationMessages}
                    onClose={handleCloseMessage}
                />


        <CustomAgGridDataTable2 
        title="Client Addresses"
        primaryButton={{
          label: "Add Client Address",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          disabled: disableSection,
        }}
        rows={clientAddressData.data}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        columns={columns} />
        <EditModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          modalTitle="Edit Client Address"
          fields={fields}
          data={selectedRowData}
          onChange={handleInputChange}
          filteredStates = {filteredStates || []}
          setFilteredStates = {setFilteredStates || []}
          filteredSuburbs = {filteredSuburbs || []}
          setFilteredSuburbs = {setFilteredSuburbs || []}
          errMsgs = {errMsgs}
        />


            </div>
        </div>

    );
};

export default UpdateAddress;


const CustomHeader = ({displayName, field}) => {
    const columnIcons = {
        AgreementID: ClipboardList,
        AgreementCode: FileText,
        Status: CheckCircle,
        Published: UploadCloud,
    };

    const Icon = columnIcons[field] || null;

    return (
        <div className="flex items-center justify-center gap-2 px-2">
            {Icon && <Icon className="h-4 w-4 text-purple-500"/>}
            <span className="font-medium">{displayName}</span>
        </div>
    );
};
