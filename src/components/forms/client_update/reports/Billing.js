import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {CheckCircle, ClipboardList, DollarSign, UploadCloud} from "lucide-react";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {fetchData, getColumns} from "@/utility/api_utility";

const Billing = () => {
    // const {colors, loading} = useContext(ColorContext);
    const [billingData, setBillingData] = useState([]);
    const [columns, setColumns] = useState([]);
    const router = useRouter();
    const {ClientID} = router.query;

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                const response = await fetchData(`/api/getBillingServiceDetails/${ClientID}`);
                console.log("Billing data fetched:", response);

                if (response?.data?.length > 0) {
                    setBillingData(response.data);

                    // Extract and map columns dynamically
                    const generatedColumns = getColumns(response).map((column) => ({
                        ...column,
                        headerComponent: (props) => <CustomHeader {...props} field={column.field}/>,
                        width: 180,
                        Cell: (props) => formatCellValue(column.field, props.value),
                    }));

                    setColumns(generatedColumns);
                } else {
                    setBillingData([]);
                    setColumns([]);
                }
            } catch (error) {
                console.error("Error fetching Billing Data:", error);
                setBillingData([]);
                setColumns([]);
            }
        };

        fetchBillingData();
    }, [ClientID]);

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CustomAgGridDataTable
                title="Client Billing"
                subtitle="View and manage client billing details"
                rows={billingData}
                columns={columns}
                showEditButton={false}
            />
        </div>
    );
};

export default Billing;

/**
 * Custom Header Component with Icons for Specific Columns
 */
const CustomHeader = ({displayName, field}) => {
    const columnIcons = {
        InvoiceID: ClipboardList,
        Amount: DollarSign,
        Status: CheckCircle,
        Paid: UploadCloud,
    };

    const Icon = columnIcons[field] || null;

    return (
        <div className="flex items-center justify-center gap-2 px-2">
            {Icon && <Icon className="h-4 w-4 text-purple-500"/>}
            <span className="font-medium">{displayName}</span>
        </div>
    );
};

/**
 * Formats Cell Values for Specific Fields
 */
const formatCellValue = (field, value) => {
    if (field === "Status") {
        return (
            <div className="flex items-center justify-center">
        <span
            className={`px-3 py-1 rounded-full text-sm ${
                value === "Paid"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
        >
          {value}
        </span>
            </div>
        );
    }
    if (field === "Paid") {
        return (
            <div className="flex items-center justify-center">
        <span
            className={`px-3 py-1 rounded-full text-sm ${
                value
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
            }`}
        >
          {value ? "Yes" : "No"}
        </span>
            </div>
        );
    }
    return value;
};
