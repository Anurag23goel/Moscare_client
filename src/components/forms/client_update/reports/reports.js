import {useContext, useEffect, useState} from "react";
import ColorContext from "@/contexts/ColorContext";
import {useRouter} from "next/router";
import {fetchData, getColumns} from "@/utility/api_utility";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";

const Reports = () => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const router = useRouter();
    const {ClientID} = router.query;
    console.log("ClientID in Reports", ClientID);

    const [reports, setReports] = useState([]);
    const [totals, setTotals] = useState({});
    const [columns, setColumns] = useState([])
    const handleRowSelected = (row) => {
        console.log("Row Selected", row);
    };

    useEffect(() => {
        const fetchAgreements = async () => {
            try {
                const data = await fetchData(
                    `/api/getClientReportsCombined/${ClientID}`
                );
                setReports(data.data);

                setColumns(getColumns(data))

                // Calculate totals for specified columns
                const columnsToTotal = [
                    "RosteredHours",
                    "RosteredAmount",
                    "Budget",
                    "BudgetHour",
                    "ExtendedHours",
                    "ActualHours",
                    "ActualAmount",
                    "AvailableHours",
                    "AvailableBudget",
                ];

                const totals = columnsToTotal.reduce((acc, column) => {
                    acc[column] = data.data.reduce(
                        (sum, report) => sum + (parseFloat(report[column]) || 0),
                        0
                    );
                    return acc;
                }, {});

                setTotals(totals);
            } catch (error) {
                console.error("Error fetching Reports: ", error);
            }
        };
        fetchAgreements();
    }, [ClientID]);

    // Append a new row with totals
    const reportsWithTotals = [
        ...reports,
        {id: "total", ...totals, isTotalRow: true},
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                {/* <MListingDataTable
          rows={reportsWithTotals}
          rowSelected={(row) => handleRowSelected(row)}
        /> */}
                <CustomAgGridDataTable
                    title="Client Reports"
                    rows={reportsWithTotals}
                    columns={columns}
                    rowSelected={(row) => handleRowSelected(row)}
                    showEditButton={false}
                />
            </div>
        </div>
    );
};

export default Reports;
