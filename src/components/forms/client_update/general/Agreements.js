import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {CheckCircle, ClipboardList, Edit, FileText, MoreHorizontal, PlusCircle, UploadCloud} from "lucide-react";
import CustomAgGridDataTable from "@/components/widgets/CustomAgGridDataTable";
import {fetchData, fetchUserRoles} from "@/utility/api_utility";

const Agreements = () => {
    // const {colors, loading} = useContext(ColorContext);
    const [agreements, setAgreements] = useState([]);
    const [columns, setColumns] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const router = useRouter();
    const {ClientID} = router.query;

    useEffect(() => {
        const fetchAgreements = async () => {
            try {
                const response = await fetchData(`/api/getClientAgreementDataByID/${ClientID}`);
                console.log("Agreements fetched:", response);

                if (Array.isArray(response) && response.length > 0) {
                    setAgreements(response);

                    // Extract columns dynamically
                    const generatedColumns = Object.keys(response[0]).map((field) => ({
                        headerName: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable text
                        field,
                        headerComponent: (props) => <CustomHeader {...props} field={field}/>,
                        width: 180,
                        Cell: (props) => formatCellValue(field, props.value),
                    }));

                    // Add "Actions" column at the end
                    generatedColumns.push({
                        headerName: "Actions",
                        width: 120,
                        cellRenderer: (params) => (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleRowSelected(params.data)}
                                    className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                                >
                                    <Edit className="h-4 w-4"/>
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </button>
                            </div>
                        ),
                        suppressMenu: true,
                        sortable: false,
                        filter: false,
                        cellStyle: {display: "flex", justifyContent: "center"},
                    });

                    setColumns(generatedColumns);
                } else {
                    setAgreements([]);
                    setColumns([]);
                }
            } catch (error) {
                console.error("Error fetching agreements:", error);
                setAgreements([]);
                setColumns([]);
            }
        };

        fetchAgreements();
        fetchUserRoles("m_cprofile", "Client_Profile_Agreement", setDisableSection);
    }, [ClientID]);

    const handleRowSelected = (data) => {
        router.push(`/agreement/${data.AgreementCode}`);
    };

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CustomAgGridDataTable
                title="Client Agreements"
                subtitle="Manage and view client agreements"
                rows={agreements}
                columns={columns}
                rowSelected={handleRowSelected}
                showActionColumn={true}
                showEditButton={!disableSection}
                primaryButton={{
                    label: "New Agreement",
                    icon: <PlusCircle className="h-4 w-4"/>,
                    onClick: () => window.open(`/agreement/${ClientID}`, "_blank", "noopener,noreferrer"),
                    disabled: disableSection,
                }}

            />
        </div>
    );
};

export default Agreements;

/**
 * Custom Header Component with Icons for Specific Columns
 */
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

/**
 * Formats Cell Values for Specific Fields
 */
const formatCellValue = (field, value) => {
    if (field === "Status") {
        return (
            <div className="flex items-center justify-center">
        <span
            className={`px-3 py-1 rounded-full text-sm ${
                value === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            }`}
        >
          {value}
        </span>
            </div>
        );
    }
    if (field === "Published") {
        return (
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
        );
    }
    return value;
};
