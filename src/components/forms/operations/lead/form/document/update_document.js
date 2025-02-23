import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import SaveDelete from "@/components/widgets/SnD";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {deleteData, fetchData, fetchUserRoles, putData,} from "@/utility/api_utility";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import {Checkbox} from "@mui/material";
import {Col, Container, Row} from "react-bootstrap";

export const fetchWorkerDocumentData = async (WorkerID) => {
    try {
        const data = await fetchData(
            `/api/getWorkerDocumentData/${WorkerID}`,
            window.location.href
        );
        console.log("Fetched data:", data);

        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Visibility: item.Visibility ? true : false,
                Lock: item.Lock ? true : false,
            })),
        };

        return transformedData;
    } catch (error) {
        console.error("Error fetching worker document data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateDocument = ({
                            setWorkerDocumentData,
                            workerDocumentData,
                            setShowForm,
                            WorkerID,
                        }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        WorkerID: WorkerID,
        Url: "",
        DocName: "",
        Category: "",
        Note: "",
        WrittenDate: "",
        Visibility: false,
        Lock: false,
    });
    const [documentOptions, setDocumentOptions] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    const fetchAndSetWorkerDocumentData = async () => {
        const data = await fetchWorkerDocumentData(WorkerID);
        const documentOptions = await fetchData(
            "/api/getDocumentCategories",
            window.location.href
        );
        setDocumentOptions(documentOptions.data);
        setWorkerDocumentData(data);
    };

    useEffect(() => {
        fetchAndSetWorkerDocumentData();
        fetchUserRoles("m_crm", "Operations_Lead_Document", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateWorkerDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            setWorkerDocumentData(await fetchWorkerDocumentData(WorkerID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteWorkerDocumentData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setWorkerDocumentData(await fetchWorkerDocumentData(WorkerID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            WorkerID: WorkerID,
            Url: "",
            DocName: "",
            Category: "",
            Note: "",
            WrittenDate: "",
            Visibility: false,
            Lock: false,
        });
    };

    const handleInputChange = (event) => {
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setSelectedRowData((prevData) => ({
            ...prevData,
            [event.target.id]: value,
        }));
    };

    return (
        <Container>
            <SaveDelete
                saveOnClick={handleSave}
                display={selectedRowData.Lock === true ? "none" : ""}
                deleteOnClick={handleDelete}
                disabled={disableSection}
            />
            <Row className="mt-2">
                <Col>
                    <InputField
                        id="Url"
                        label="URL:"
                        value={selectedRowData.Url}
                        type="text"
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col>
                    <InputField
                        id="DocName"
                        label="Document Name:"
                        value={selectedRowData.DocName}
                        type="text"
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
                <Col>
                    <InputField
                        id="Category"
                        label="Category:"
                        value={selectedRowData.Category}
                        type="select"
                        onChange={handleInputChange}
                        disabled={disableSection}
                        options={documentOptions.map((form) => ({
                            value: form.Description,
                            label: form.Description,
                        }))}
                    />
                </Col>
                <Col>
                    <InputField
                        id="WrittenDate"
                        label="Written Date:"
                        value={selectedRowData.WrittenDate}
                        type="date"
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <InputField
                        id="Note"
                        label="Note:"
                        value={selectedRowData.Note}
                        type="textarea"
                        onChange={handleInputChange}
                        disabled={disableSection}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Checkbox
                        id="Visibility"
                        checked={selectedRowData.Visibility}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Visibility to Worker
                </Col>
            </Row>
            <Row>
                <Col>
                    <Checkbox
                        id="Lock"
                        checked={selectedRowData.Lock}
                        onChange={handleInputChange}
                        disabled={disableSection}
                        name="checkbox"
                    />
                    Lock
                </Col>
            </Row>
            {/* <Grid>
        <InputField
          id="Url"
          label="URL:"
          value={selectedRowData.Url}
          type="text"
          onChange={handleInputChange}
        />
        <InputField
          id="DocName"
          label="Document Name:"
          value={selectedRowData.DocName}
          type="text"
          onChange={handleInputChange}
        />
        <InputField
          id="Category"
          label="Category:"
          value={selectedRowData.Category}
          type="select"
          onChange={handleInputChange}
          options={documentOptions.map((form) => ({
            value: form.Description,
            label: form.Description,
          }))}
        />
        <InputField
          id="Note"
          label="Note:"
          value={selectedRowData.Note}
          type="textarea"
          onChange={handleInputChange}
        />
        <InputField
          id="WrittenDate"
          label="Written Date:"
          value={selectedRowData.WrittenDate}
          type="date"
          onChange={handleInputChange}
        />
        <div>
          <Checkbox
            id="Visibility"
            checked={selectedRowData.Visibility}
            onChange={handleInputChange}
            name="checkbox"
          />
          Visibility to Worker
        </div>
        <div>
          <Checkbox
            id="Lock"
            checked={selectedRowData.Lock}
            onChange={handleInputChange}
            name="checkbox"
          />
          Lock
        </div>
        <br />
      </Grid> */}
            <MButton
                style={{margin: "20px 15px 30px 15px"}}
                label="Add Worker Document"
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={() => setShowForm(true)}
                disabled={disableSection}
                size="small"
            />
            <MListingDataTable
                rows={workerDocumentData.data}
                rowSelected={handleSelectRowClick}
            />
        </Container>
    );
};

export default UpdateDocument;
