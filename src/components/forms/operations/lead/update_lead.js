import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import {Container} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import {useRouter} from "next/router";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import Header from "@/components/widgets/Header";
import styles from "@/styles/style.module.css";
import ColorContext from "@/contexts/ColorContext";

export const fetchLeadData = async () => {
    try {
        const data = await fetchData(
            "/api/getCrmLeadGeneralDataAll",
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching lead  data:", error);
    }
};

const UpdateLead = ({leadData, setLeadData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({});
    const [disableSection, setDisableSection] = useState(false);
    const [columns, setColumns] = useState([])
    const router = useRouter();
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchAndSetLeadData = async () => {
            const data = await fetchLeadData();
            console.log("Data : ", data)
            setLeadData(data);

            const columns = Object.keys(data.data[0] || {}).map((key) => ({
                field: key,
                headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
            }));
            console.log("Columns : ", columns)
            setColumns(columns)


        };
        fetchAndSetLeadData();
        fetchUserRoles('m_crm', 'Operations_Lead', setDisableSection);
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

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    };

    const handleRowSelect = async (rowData) => {
        router
            .push(`/operations/crm/lead/update/${rowData.ID}`)
            .then((r) => console.log("Navigated to updateContactProfile"));
    };

    return (
        <Container>
            {/* <SaveDelete saveOnClick={handleSave} deleteOnClick={handleDelete} disabled = {disableSection} /> */}
            {/* <Row>
        <Col md={6}>
          <InputField
            label="First Name "
            type="text"
            id="FirstName"
            value={selectedRowData.FirstName}
            onChange={handleInputChange}
            disabled = {disableSection}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <InputField
            label="Last Name "
            type="text"
            id="LastName"
            value={selectedRowData.LastName}
            onChange={handleInputChange}
            disabled = {disableSection}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <InputField
            label="Type "
            type="text"
            id="Type"
            value={selectedRowData.Type}
            onChange={handleInputChange}
            disabled = {disableSection}
          />
        </Col>
      </Row> */}
            <div className={styles.spaceBetween} style={{paddingBottom: "1rem"}}>
                <Header title={"Lead"}/>

                <MButton
                    style={{
                        backgroundColor: "blue",
                        padding: "5px 10px",
                    }}
                    label="Add Lead"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowForm(true)} size="small"
                />
            </div>

            <AgGridDataTable
                rows={leadData?.data}
                columns={columns}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateLead;
