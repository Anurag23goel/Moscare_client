import React, {useEffect, useState} from "react";
import {deleteData, fetchData, putData} from "@/utility/api_utility";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {Col, Container, Row} from "react-bootstrap";
import {useRouter} from "next/router";
/* import GoogleMapComponent from "./googlemap"; */


export const fetchLeadData = async () => {
    try {
        const data = await fetchData(
            "/api/getCrmLeadDataAll",
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching lead  data:", error);
    }
};

const ClientWorkerMap = ({leadData, setLeadData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchAndSetLeadData = async () => {
            const data = await fetchLeadData();
            // setLeadData(data);
        };
        fetchAndSetLeadData();
    }, [setLeadData]);

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
                "/api/putCrmLeadData",
                selectedRowData,
                window.location.href
            );
            console.log("Save response:", data);
            setLeadData(await fetchLeadData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving lead  data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteCrmLeadData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            setLeadData(await fetchLeadData());
        } catch (error) {
            console.error("Error deleting lead  data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            FirstName: "",
            LastName: "",
            Type: "",
        });
    };


    return (
        <Container>
            <Row>

                <Col md={4}>
                    <MListingDataTable
                        rows={leadData?.data}
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
                </Col>

                <Col md={8}>
                    {/*  <GoogleMapComponent/> */}
                </Col>

            </Row>

        </Container>
    );
};

export default ClientWorkerMap;
