import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import AddIcon from "@mui/icons-material/Add";
import {useRouter} from "next/router";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import ColorContext from "@/contexts/ColorContext";


export const fetchQuoteData = async () => {
    try {
        const data = await fetchData("/api/getAllQuotes", window.location.href);
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching quote data:", error);
    }
};

const UpdateQuotes = () => {
    const [quoteData, setQuoteData] = useState([]);
    const [selectedRowData, setSelectedRowData] = useState({});
    const router = useRouter();
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchAndSetQuoteData = async () => {
            const data = await fetchQuoteData();
            setQuoteData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetQuoteData();
        fetchUserRoles('m_quotes', "Operations_Quote", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                `/api/putQuoteData/${selectedRowData.ID}`,
                {...selectedRowData},
                window.location.href
            );
            console.log("Save response:", data);
            setQuoteData(await fetchQuoteData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving quote data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteQuoteData",
                {ID: selectedRowData.ID},
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            setQuoteData(await fetchQuoteData());
        } catch (error) {
            console.error("Error deleting quote data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            ClientLead: "",
            DateOfQuote: "",
            ClientFirstName: "",
            ClientLastName: "",
            DateOfBirth: "",
            Phone1: "",
            Email: "",
            QuoteStatus: "",
            FollowUpDate: "",
            ClientAddressLine1: "",
            ClientAddressLine2: "",
            Suburb: "",
            PostCode: "",
            State: "",
            MyAgedCareNumber: "",
            StartDate: "",
            EndDate: "",
            Payer: "",
            Loaction: "",
            Area: "",
            NdisNumber: "",
            FundingType: "",
            QuoteName: "",
            KM: "",
            MakerUser: "",
            MakerDate: "",
            UpdateUser: "",
            UpdateDate: "",
        });
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const handleRowSelect = async (rowData) => {
        router
            .push(`/operations/quotes/update/${rowData.ID}`)
            .then((r) => console.log("Navigated to updateQuote"));
    };

    const handleClickNew = () => {
        router.push(`/operations/quote`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Quotes
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400">Manage all Quotes. Click on Edit to update their
                            Quotes.</p>

                    </div>

                    {/* <Button
            style={{ margin: "20px 15px 30px 15px" }}
            label="Add New Quote"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickNew}
            size={"small"}
            disabled = {disableSection}
         /> */}

                    <button
                        onClick={handleClickNew}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <AddIcon/>
                        <span>Add New Quote</span>
                    </button>

                </div>


                {/* <MListingDataTable
            rows={quoteData?.data}
            rowSelected={handleSelectRowClick}
            handleRowUnselected={handleRowUnselected}
            props={{
               onRowDoubleClick: (params) => {
                  handleRowSelect(params.row).then((r) =>
                     console.log("Row selected:", params.row)
                  );
               },
            }}
         /> */}
                <AgGridDataTable
                    rows={quoteData?.data}
                    columns={columns}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                    props={{
                        onRowDoubleClick: (params) => {
                            handleRowSelect(params.row).then((r) =>
                                console.log("Row selected:", params.row)
                            );
                        },
                    }}
                />

                {selectedRowData.ID && (
                    <form onSubmit={handleSave}>
                        <InputField
                            id="ClientLead"
                            label="Client Lead"
                            value={selectedRowData.ClientLead}
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                        {/* Add more InputFields for other fields as needed */}
                        <SaveDelete
                            handleSave={handleSave}
                            handleDelete={handleDelete}
                            handleClear={handleClearForm}
                            disabled={disableSection}
                        />
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdateQuotes;
