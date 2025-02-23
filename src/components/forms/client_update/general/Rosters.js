import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CustomAgGridDataTable2 from "../../../widgets/CustomAgGridDataTable2"; // Assuming AgGridDataTable is in the same folder
import { fetchData, fetchUserRoles } from "../../../../utility/api_utility"; // Import your fetchData utility function
import styles from "../../../../styles/style.module.css";
import { FileText, Calendar, ListChecks, CheckCircle, UploadCloud
       ,  ClipboardList, PlusCircle, Edit, MoreHorizontal
       } from "lucide-react";

const RosterPage = () => {
    const [rosters, setRosters] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const router = useRouter();
    const [processing, setProcessing] = useState(true);
    const {ClientID} = router.query;

    useEffect(() => {
        const fetchRosterData = async () => {
            console.log("Client ID:", ClientID);
            try {
                const response = await fetchData(
                    `/api/getRosterMasterData/${ClientID}`
                );
                console.log("response", response);
                const formattedData = Array.isArray(response.data)
                    ? response.data.map((item) => ({
                        MasterID: item.MasterID,
                        ClientID: item.ClientID,
                        RosterID: item.RosterID,
                        Completed: item.Completed,
                        Publish: item.Publish,
                    }))
                    : [];

                console.log("Formatted Data", formattedData);
                setRosters(formattedData); // Set the formatted data to the state
            } catch (error) {
                console.error("Error fetching roster data: ", error);
                setRosters([]); // Default to an empty array in case of error
            }
        };

        fetchRosterData();
        fetchUserRoles("m_cprofile", "Client_Profile_Roster", setDisableSection);
    }, [ClientID]);

    const handleEditClick = (data) => {
        const {ClientID, RosterID} = data;
        console.log("data", data);
        console.log("Cliet ID:", ClientID);

        router.push({
            pathname: "/RosterManagement/ClientCalendar",
            query: {clientId: ClientID, rosterId: RosterID}, // Query parameters
        });
    };

    const columns = [
        {
            headerName: "Master ID",
            field: "MasterID",
            headerComponent: CustomHeader,
            width: 150,
            Cell: ({value}) => (
                <div className="flex items-center justify-center">{value}</div>
            ),
        },
        {
            headerName: "Roster ID",
            field: "RosterID",
            headerComponent: CustomHeader,
            width: 150,
            Cell: ({value}) => (
                <div className="flex items-center justify-center">{value}</div>
            ),
        },
        {
            headerName: "Completed",
            field: "Completed",
            headerComponent: CustomHeader,
            width: 150,
            Cell: ({value}) => (
                <div className="flex items-center justify-center">
          <span
              className={`px-3 py-1 rounded-full text-sm ${
                  value
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              }`}
          >
            {value ? "Yes" : "No"}
          </span>
                </div>
            ),
        },
        {
            headerName: "Published",
            field: "Publish",
            headerComponent: CustomHeader,
            width: 150,
            Cell: ({value}) => (
                <div className="flex items-center justify-center">
          <span
              className={`px-3 py-1 rounded-full text-sm ${
                  value
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
              }`}
          >
            {value ? "Published" : "Draft"}
          </span>
        </div>
      ),
    }
  ];

  return (
    <div className="">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CustomAgGridDataTable2
          title="Client Rosters"
          subtitle="Manage and view client roster assignments"
          
          rows={rosters}
          columns={columns}
          rowSelected={handleEditClick}
          showActionColumn={true}
          showEditButton={!disableSection}
        />
      </div>
    </div>
  );
};

export default RosterPage;

const CustomHeader = (props) => {
    console.log("Props", props);
    const icon = {
        MasterID: Calendar,       // Represents a calendar/schedule
        RosterID: ListChecks,     // Represents a list or roster
        Completed: CheckCircle,   // Represents completion with a check mark
        Publish: UploadCloud,   // Represents publishing/uploading
    }[props.column.colId];

    const Icon = icon || Calendar;

    return (
        <div className="flex items-center justify-center gap-2 px-2">
            <Icon className="h-4 w-4 text-purple-500"/>
            <span className="font-medium">{props.displayName}</span>
        </div>
    );
};
