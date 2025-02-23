import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import Button from "@/components/widgets/MaterialButton";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {Col, Container, Row} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import {useRouter} from "next/router";

export const fetchContactData = async () => {
    try {
        const data = await fetchData(
            "/api/getContactGeneralDataAll",
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching contact  data:", error);
    }
};

const UpdateContact = ({contactData, setContactData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const router = useRouter();
    const [disableSection, setDisableSection] = useState(false);

    useEffect(() => {
        const fetchAndSetContactData = async () => {
            const data = await fetchContactData();
            setContactData(data);
        };
        fetchAndSetContactData();
        fetchUserRoles("m_crm", "Operations_Contact", setDisableSection);
    }, [setContactData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        const dataToSend = {generalData: selectedRowData};
        try {
            const data = await putData(
                "/api/putContactGeneralData",
                dataToSend,
                window.location.href
            );
            console.log("Save response:", data);
            setContactData(await fetchContactData());
            handleClearForm();
        } catch (error) {
            console.error("Error saving contact  data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteContactGeneralData",
                selectedRowData,
                window.location.href
            );
            await deleteData(
                "/api/deleteContactHaccData",
                selectedRowData,
                window.location.href
            );
            await deleteData(
                "/api/deleteContactAboutMeData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete response:", data);
            handleClearForm();
            setContactData(await fetchContactData());
        } catch (error) {
            console.error("Error deleting contact  data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            FirstName: "",
            LastName: "",
            Organisation: "",
        });
    };

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const handleRowSelect = async (rowData) => {
        router
            .push(`/maintenance/contact/update/${rowData.ID}`)
            .then((r) => console.log("Navigated to updateContactProfile"));
    };

    return (
        <Container>
            <SaveDelete
                saveOnClick={handleSave}
                deleteOnClick={handleDelete}
                disabled={disableSection}
            />
            <Row>
                <Col md={3}>
                    <InputField
                        label="First Name "
                        type="text"
                        id="FirstName"
                        value={selectedRowData.FirstName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                        label="Last Name "
                        type="text"
                        id="LastName"
                        value={selectedRowData.LastName}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                        label="Organisation "
                        type="text"
                        id="Organisation"
                        value={selectedRowData.Organisation}
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            {/* <Row>
        <Col md={6}>
          <InputField
            label="Last Name "
            type="text"
            id="LastName"
            value={selectedRowData.LastName}
            onChange={handleInputChange}
          />
        </Col>
      </Row> */}
            {/* <Row>
        <Col md={6}>
          <InputField
            label="Organisation "
            type="text"
            id="Organisation"
            value={selectedRowData.Organisation}
            onChange={handleInputChange}
          />
        </Col>
      </Row> */}
            <Button
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Contact "
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size={"small"}
            />
            <MListingDataTable
                rows={contactData?.data}
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
        </Container>
    );
};

export default UpdateContact;
