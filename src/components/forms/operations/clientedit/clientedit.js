import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import ColorContext from "@/contexts/ColorContext";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import EditModal from "@/components/widgets/EditModal";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const ClientEdit = () => {
    const router = useRouter();
    const [columns, setColumns] = useState([]);
    const [clientData, setClientData] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState({
        FirstName: "",
        LastName: "",
        AddressLine1: "",
        Suburb: "",
        State: "",
        Postcode: "",
        Phone: "",
        Email: "",
        DOB: "",
        Phone2: "",
        AccountingCode: "",
        CaseManager: "",
        CaseManager2: "",
        Area: "",
        Division: "",
        Age: "",
    });
    const [disableSection, setDisableSection] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // const { colors, loading } = useContext(ColorContext);

    function calculateAge(birthDate) {
        const currentDate = new Date();
        const birthDateParts = birthDate.split("-");

        const birthYear = parseInt(birthDateParts[0]);
        const birthMonth = parseInt(birthDateParts[1]);
        const birthDay = parseInt(birthDateParts[2]);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let age = currentYear - birthYear;

        if (
            currentMonth < birthMonth ||
            (currentMonth === birthMonth && currentDay < birthDay)
        ) {
            age--;
        }

        return age;
    }

    // Fetch all client data in parallel
    const fetchClientData = async () => {
        try {
            // Parallel execution of all GET requests
            const [masterData, generalAddress, profileData, DOBData] = await Promise.all([
                fetchData(`/api/getClientMasterSpecificDataAll`, window.location.href),
                fetchData(`/api/getClientDetailsAddressSpecificDataAll`, window.location.href),
                fetchData(`/api/getClientGeneralProfileSpecificDataAll`, window.location.href),
                fetchData(`/api/getClientDetailsGeneralDetailsSpecificDataAll`, window.location.href),
            ]);

            // Create lookup maps for each data source based on ClientID
            const masterLookup = masterData.data.reduce((acc, item) => {
                acc[item.ClientID] = item;
                return acc;
            }, {});

            const addressLookup = generalAddress.data.reduce((acc, item) => {
                acc[item.ClientID] = item;
                return acc;
            }, {});

            const dobLookup = DOBData.data.reduce((acc, item) => {
                acc[item.ClientID] = item;
                return acc;
            }, {});

            const profileLookup = profileData.data.reduce((acc, item) => {
                acc[item.ClientID] = item;
                return acc;
            }, {});

            // Merge data based on ClientID
            const mergedData = [];
            const allClientIDs = new Set([
                ...Object.keys(masterLookup),
                ...Object.keys(addressLookup),
                ...Object.keys(dobLookup),
                ...Object.keys(profileLookup),
            ]);

            allClientIDs.forEach((ClientID) => {
                const master = masterLookup[ClientID] || {};
                const address = addressLookup[ClientID] || {};
                const dob = dobLookup[ClientID] || {};
                const profile = profileLookup[ClientID] || {};
                mergedData.push({ ...master, ...dob, ...address, ...profile });
            });

            // Set the merged data to state
            console.log("mergedData : ", mergedData);
            setClientData(mergedData);
            const columns = Object.keys(mergedData[0] || {}).map((key) => ({
                field: key,
                headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
            }));
            setColumns(columns);
        } catch (error) {
            console.error("Error fetching client form data:", error);
            setClientData([]);
        }
    };

    useEffect(() => {
        // Fetch initial data and user roles in parallel
        Promise.all([
            fetchClientData(),
            fetchUserRoles('m_bulk_clients', 'Operation_ClientEdit', setDisableSection)
        ]).catch(error => {
            console.error("Error in initial data fetch:", error);
        });
    }, []);

    // Handle row selection with parallel data fetching
    const handleSelectRowClick = async (row) => {
        setShowForm(true);
        clearForm();
        try {
            const [masterData, generalAddress, profileData, DOBData] = await Promise.all([
                fetchData(`/api/getClientMasterData/${row.ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsAddressData/${row.ClientID}`, window.location.href),
                fetchData(`/api/getClientGeneralProfileData/${row.ClientID}`, window.location.href),
                fetchData(`/api/getClientDetailsGeneralDetailsData/${row.ClientID}`, window.location.href),
            ]);

            // Merge the data for the selected client
            const selectedData = {
                ...masterData.data[0],
                ...generalAddress.data[0],
                ...profileData.data[0],
                ...DOBData.data[0],
            };
            console.log(selectedData);
            setSelectedRowData(selectedData);
        } catch (error) {
            console.error("Error fetching selected row data:", error);
        }
    };

    // Handle save (PUT requests remain sequential due to dependency)
    const handleSave = async () => {
        try {
            const data1 = {
                Phone: selectedRowData.Phone,
                Email: selectedRowData.Email,
            };

            const data2 = {
                AddressLine1: selectedRowData.AddressLine1,
                Suburb: selectedRowData.Suburb,
                State: selectedRowData.State,
                Postcode: selectedRowData.Postcode,
            };

            const data3 = {
                Phone2: selectedRowData.Phone2,
                AccountingCode: selectedRowData.AccountingCode,
                CaseManager: selectedRowData.CaseManager,
                CaseManager2: selectedRowData.CaseManager2,
                Area: selectedRowData.Area,
                Division: selectedRowData.Division,
            };

            const data4 = {
                DateOfBirth: selectedRowData.DOB,
                Age: selectedRowData.Age,
            };

            // These could be parallelized if order doesn't matter and endpoints are independent
            await Promise.all([
                putData(
                    `/api/updateClientMasterData/${selectedRowData.ClientID}`,
                    { data: data1 },
                    window.location.href
                ),
                putData(
                    `/api/upsertClientDetailsAddressData/${selectedRowData.ClientID}`,
                    { data: data2 },
                    window.location.href
                ),
                putData(
                    `/api/updateClientGeneralProfileData/${selectedRowData.ClientID}`,
                    { data: data3 },
                    window.location.href
                ),
                putData(
                    `/api/upsertClientDetailsGeneralDetailsData/${selectedRowData.ClientID}`,
                    { data: data4 },
                    window.location.href
                ),
            ]);

            await fetchClientData(); // Refresh data after save
            clearForm();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    // Handle input change
    const handleInputChange = ({ id, value }) => {
        if (id === "DOB") {
            const age = calculateAge(value);
            setSelectedRowData((prevState) => ({
                ...prevState,
                Age: age,
                [id]: value,
            }));
        } else {
            setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
        }
    };

    // Clear form
    const clearForm = () => {
        setSelectedRowData({
            FirstName: "",
            LastName: "",
            AddressLine1: "",
            Suburb: "",
            State: "",
            Postcode: "",
            Phone: "",
            Email: "",
            DOB: "",
            Phone2: "",
            AccountingCode: "",
            CaseManager: "",
            CaseManager2: "",
            Area: "",
            Division: "",
            Age: "",
        });
    };

    // Render loading if data is loading
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const fields = [
        { id: "FirstName", label: "FirstName:", value: selectedRowData.FirstName, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "LastName", label: "LastName:", value: selectedRowData.LastName, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "AddressLine1", label: "AddressLine1:", value: selectedRowData.AddressLine1, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Suburb", label: "Suburb:", value: selectedRowData.Suburb, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "State", label: "State:", value: selectedRowData.State, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Postcode", label: "Postcode:", value: selectedRowData.Postcode, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Phone", label: "Phone:", value: selectedRowData.Phone, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Email", label: "Email:", value: selectedRowData.Email, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "DOB", label: "DOB:", value: selectedRowData.DOB, type: "date", onChange: handleInputChange, disabled: disableSection },
        { id: "Phone2", label: "Phone2:", value: selectedRowData.Phone2, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "AccountingCode", label: "AccountingCode:", value: selectedRowData.AccountingCode, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "CaseManager", label: "CaseManager:", value: selectedRowData.CaseManager, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "CaseManager2", label: "CaseManager2:", value: selectedRowData.CaseManager2, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Area", label: "Area:", value: selectedRowData.Area, type: "text", onChange: handleInputChange, disabled: disableSection },
        { id: "Division", label: "Division:", value: selectedRowData.Division, type: "text", onChange: handleInputChange, disabled: disableSection },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
                  <div className="pl-2 mb-3"><CustomBreadcrumbs /></div>

            <div className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                <CustomAgGridDataTable2
                    title="Bulk Edit Client"
                    rows={clientData}
                    columns={columns}
                    rowSelected={handleSelectRowClick}
                    showActionColumn={true}
                />

                <EditModal
                    show={showForm}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                    modalTitle="Edit Client"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default ClientEdit;