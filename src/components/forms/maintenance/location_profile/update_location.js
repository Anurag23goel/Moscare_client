import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import {Col, Row} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import {useRouter} from "next/router";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {PlusCircle} from "lucide-react";


export const fetchLocationData = async () => {
    try {
        const data = await fetchData(
            "/api/getLocationProfileGeneralDataAll",
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching location  data:", error);
    }
};

const UpdateLocation = ({locationData, setLocationData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const router = useRouter();
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([]);
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchAndSetLocationData = async () => {
            const data = await fetchLocationData();
            setLocationData(data);
            setColumns(getColumns(data));
        };
        fetchAndSetLocationData();
        fetchUserRoles(
            "m_location_profile",
            "Maintainence_LocationProfile",
            setDisableSection
        );
    }, [setLocationData]);

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
                `/api/putLocationProfileGeneralData/${selectedRowData.ID}`,
                {generalData: selectedRowData},
                window.location.href
            );
            console.log("Save response:", data);
            setLocationData(await fetchLocationData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving location  data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteLocationProfileGeneralData",
                {ID: selectedRowData.ID},
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            setLocationData(await fetchLocationData());
        } catch (error) {
            console.error("Error deleting location  data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Code: "",
            Description: "",
        });
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const handleRowSelect = async (rowData) => {
        router
            .push(`/maintenance/location/update/${rowData.ID}`)
            .then((r) => console.log("Navigated to updateContactProfile"));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Location
                </h2>
                <Row className="mt-4">
                    <Col md={3}>
                        <InputField
                            label="Code "
                            type="text"
                            id="Code"
                            value={selectedRowData.Code}
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col md={3}>
                        <InputField
                            label="Location Name "
                            type="text"
                            id="Description"
                            value={selectedRowData.Description}
                            onChange={handleInputChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col md={3} className="mt-4">
                        <button
                            onClick={() => handleSave()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <AddIcon/>
                            <span>Update</span>
                        </button>

                        {/* <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled = {disableSection}/> */}
                    </Col>


                </Row>

                {/*<MListingDataTable*/}
                {/*    rows={locationData?.data}*/}
                {/*    rowSelected={handleSelectRowClick}*/}
                {/*    handleRowUnselected={handleRowUnselected}*/}
                {/*    props={{*/}
                {/*        onRowDoubleClick: (params) => {*/}
                {/*            handleRowSelect(params.row).then((r) =>*/}
                {/*                console.log("Row selected:", params.row)*/}
                {/*            );*/}
                {/*        },*/}
                {/*    }}*/}
                {/*/>*/}
                <CustomAgGridDataTable2

                    primaryButton={{
                        label: "Add Location",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setShowForm(true),
                        // disabled: disableSection,
                    }}


                    rows={locationData.data}
                    rowSelected={(params) => {
                        handleRowSelect(params).then((r) =>
                            console.log("Row selected:", params)
                        );
                    }}
                    handhandleRowUnselected={handleRowUnselected}
                    columns={columns.filter((col) => !['Maker User', 'Maker Date'].includes(col.headerName))}

                />
            </div>
        </div>
    );
};

export default UpdateLocation;
