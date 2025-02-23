import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


<div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
    <div
        className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


        <CustomAgGridDataTable2

            title="Location"
            primaryButton={{
                label: "Add Interests",
                icon: <PlusCircle className="h-4 w-4"/>,
                onClick: () => setShowForm(true),
                // disabled: disableSection,
            }}
            secondaryButton={{
                label: "Add Compliance by Funding Type",
                icon: <MonetizationOnOutlinedIcon/>,
                onClick: handleAddComplianceByFundingType
                // disabled: disableSection,
            }}

            rows={documentData?.data}
            columns={columns.filter((col) => !['maker User', 'maker Date', 'Created By', 'Visibility', 'update User', 'update Time'].includes(col.headerName))}
            rowSelected={handleSelectRowClick}
            handleRowUnselected={handleRowUnselected}
        />
