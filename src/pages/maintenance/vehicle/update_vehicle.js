import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";
import {useRouter} from "next/router";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";

export const fetchVehicleData = async () => {
    try {
        const data = await fetchData("/api/getVehicle", window.location.href);
        console.log("Fetched vehicle data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
    }
};

const UpdateVehicle = ({vehicleData, setVehicleData, setShowForm}) => {
    console.log("vehicleData : ", vehicleData)
    const router = useRouter();
    const [selectedRowData, setSelectedRowData] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchAndSetVehicleData = async () => {
            const data = await fetchVehicleData();
            setVehicleData(data);
        };
        fetchAndSetVehicleData();
        fetchUserRoles('m_vehicles', "Maintainence_Vehicle", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
            ...row,
            IsActive: row.IsActive,
            Delete: row.Delete,
        })
        router.push({
            pathname: `/maintenance/vehicle/${row.ID}`,
            query: {data: JSON.stringify(row)}, // Pass additional row data in query string
        });
    };


    const handleClearForm = () => {
        setSelectedRowData({
            Make: "",
            Model: "",
            Year: "",
            Capacity: "",
            Registration: "",
            IsActive: "",
            Delete: "",
        });
    };

    const initialColumns = [
        {headerName: "Make", field: "Make"},
        {headerName: "Model", field: "Model"},
        {headerName: "Year", field: "Year"},
        {headerName: "Capacity", field: "Capacity"},
        {headerName: "Registration", field: "Registration"},
        {headerName: "Type", field: "type"},  // Ensure field name matches "Type" in the data
        {headerName: "Insurance Type", field: "insurance_type"}, // Ensure field name matches "Insurance_Type"
        {headerName: "Insurance Policy", field: "insurance_policy"}, // Ensure field name matches "Insurance_Policy"
        {headerName: "Licence Type", field: "licence_type"},  // Ensure field name matches "Licence_Type"
        {headerName: "Color", field: "color"},
        {headerName: "Number of Doors", field: "no_of_doors"}, // Ensure field name matches "Number_of_Doors"
        {headerName: "Transmission", field: "transmission"},
        {headerName: "Kilometers", field: "kilometers"},
        {headerName: "KM Last Sighted", field: "km_last_sighted"}, // Ensure field name matches "KM_Last_Sighted"
        {headerName: "Vehicle Type", field: "vehicle_type"}, // Ensure field name matches "Vehicle_Type"
        {headerName: "IsActive", field: "IsActive"}, // Ensure field name matches "IsActive"
        {headerName: "DeleteStatus", field: "DeleteStatus"}, // Ensure field name matches "DeleteStatus"
    ];


    const handleRowUnselected = () => {
        handleClearForm();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">

            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                <CustomAgGridDataTable2

                    title="Vehicle"
                    primaryButton={{
                        label: "Add Vehicle",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={vehicleData?.data}
                    columns={initialColumns}
                    rowSelected={handleSelectRowClick}
                    handhandleRowUnselected={handleRowUnselected}
                />
            </div>
        </div>
    );
};

export default UpdateVehicle;
