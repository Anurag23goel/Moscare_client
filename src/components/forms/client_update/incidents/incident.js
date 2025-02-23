import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


const Incident = () => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const router = useRouter();
    const {ClientID} = router.query;

    const [incidents, setIncidents] = useState([]);
    const [columns, setColumns] = useState([])
    const [disableSection, setDisableSection] = useState(false);

    const handleNewAgreementClick = () => {
        router.push({
            pathname: `/client/incident/NewIncident`,
            query: {ClientID: ClientID},
        });
        console.log("New Incident Clicked");
    };

    const handleRowSelected = (row) => {
        router.push(`/client/incident/${row.IncidentID}`);
    };

    useEffect(() => {
        const fetchAgreements = async () => {
            try {
                const data = await fetchData(
                    `/api/getClientIncidentsDataById/${ClientID}`,
                    window.location.href
                );
                console.log("Incident Data", data);

                setIncidents(data.data);
                const columns = Object.keys(data.data[0] || {}).map((key) => ({
                    field: key,
                    headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"), // Capitalize the first letter for the header
                }));

                console.log("Extracted columns:", columns);
                setColumns(columns)
                // return { ...transformedData, columns };
            } catch (error) {
                console.error("Error fetching agreements: ", error);
            }
        };
        fetchAgreements();
        fetchUserRoles("m_cprofile", "Client_Profile_Incident", setDisableSection);
    }, []);

    useEffect(() => {
        console.log("columns", columns)
    }, [columns])

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                {/* <MListingDataTable
          rows={incidents}
          rowSelected={(row) => handleRowSelected(row)}
        /> */}
        <CustomAgGridDataTable2
        title="Incidents"
          rows={incidents}
          rowSelected={(row) => handleRowSelected(row)}
          showActionColumn={true}
          primaryButton={{
            label: "Add New Incident",
            icon: <PlusCircle className="h-4 w-4" />,
            onClick: handleNewAgreementClick,
            // disabled: disableSection,
          }}
          columns={columns.filter(
          (col) =>
            ![
              'Bucket',
              'File',
              'Folder',
              'CreationDate',
              'Visibility',
              'CreatedBy',
              'Template',
              "CreatedOn",
              "CreatedBy"
            ].includes(col.headerName)
        )}
        />
    </div>
    </div>
  );
};

export default Incident;
