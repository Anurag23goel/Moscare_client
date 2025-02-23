import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles} from "../../../../utility/api_utility";
import {useRouter} from "next/router";
import ColorContext from "@/contexts/ColorContext";

import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";

// Data fetching function for client incidents
const fetchClientIncidentsData = async () => {
    try {
        const response = await fetchData(
            "/api/getClientIncidentsDataAll",
            window.location.href
        );
        return response.success && Array.isArray(response.data)
            ? response.data
            : [];
    } catch (error) {
        console.error("Error fetching client incidents data:", error);
        return [];
    }
};

// Function to handle parsing of array and JSON string fields
const parseDataField = (field) => {
    if (typeof field === "string") {
        try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) {
                return parsed.join(", ");
            } else if (typeof parsed === "object" && parsed !== null) {
                return JSON.stringify(parsed); // Convert objects to a string for display
            }
        } catch {
            // If it can't be parsed as JSON, return the field as-is
            return field;
        }
    } else if (Array.isArray(field)) {
        return field.join(", ");
    } else if (typeof field === "object" && field !== null) {
        return JSON.stringify(field);
    }
    return field;
};

function WorkerIncidents() {
    const [incidentsData, setIncidentsData] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    // const {colors} = useContext(ColorContext);

    const router = useRouter();

    useEffect(() => {
        const fetchIncidentsData = async () => {
            const data = await fetchClientIncidentsData();
            if (data.length > 0) {
                // Map data and parse any array/JSON fields for readable display
                const transformedData = data.map((item) => {
                    const transformedItem = {};
                    Object.keys(item).forEach((key) => {
                        transformedItem[key] = parseDataField(item[key]);
                    });
                    return transformedItem;
                });
                setIncidentsData(transformedData);

            } else {
                console.warn("No data found");
            }
        };
        fetchIncidentsData();
        fetchUserRoles("m_wprofile", "Worker_Profile_Incident", setDisableSection);
    }, []);

    // Define columns
    const columns =
        incidentsData.length > 0
            ? Object.keys(incidentsData[0]).map((key) => ({
                accessor: key,
                Header: key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase()),
            }))
            : [
                {accessor: "ID", Header: "ID"},
                {accessor: "ClientID", Header: "Client ID"},
            ];

    const handleNewAgreementClick = () => {
        router.push({
            pathname: `/worker/incident/NewIncident`
        });
        console.log("New Incident Clicked");
    };

    return (
        <div className="mt-4">

            {incidentsData.length > 0 ? (
                <CustomAgGridDataTable

                    title="Incidents"

                    rows={incidentsData}
                    columns={columns.filter((col) => !['Bucket', 'Folder', 'File'].includes(col.accessor))}
                    showActionColumn={false}
                    showActionColumn={true}
                />
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
}

export default WorkerIncidents;
