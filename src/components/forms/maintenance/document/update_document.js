import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, postData, putData} from "@/utility/api_utility";
import Modal from "react-modal";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import {ValidationContext} from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {Link, PlusCircle} from "lucide-react";

Modal.setAppElement("#__next");

export const fetchDocumentData = async () => {
    try {
        const data = await fetchData("/api/getDocumentDataAll", window.location.href);
        const transformedData = {
            ...data,
            data: data.data.map((item) => ({
                ...item,
                Lock: item.Lock ? true : false,
                VisibleCarer: item.VisibleCarer ? true : false,
                VisibleClient: item.VisibleClient ? true : false,
            })),
        };
        return transformedData;
    } catch (error) {
        console.error("Error fetching document data:", error);
    }
};

const UpdateDocument = ({documentData, setDocumentData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
        DocumentCode: "",
        DocName: "",
        URL: "",
        Note: "",
        Category: "",
        Lock: false,
        VisibleCarer: false,
        VisibleClient: false,
        file: null,
    IsActive: "", // "Y" means active
    Delete: "",   // "N" means not deleted
  });
  console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [docCategories, setDocCategories] = useState([]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [urlDialog, setUrlDialog] = useState(false);
    const [file, setFile] = useState(null);
    const [output, setOutput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);
    const {addValidationMessage, validationMessages, handleCloseMessage} = useContext(ValidationContext);


    useEffect(() => {
        const fetchAndSetDocumentData = async () => {
            const data = await fetchDocumentData();
            setDocumentData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetDocumentData();
        fetchUserRoles("m_maint_documents", "Maintainence_Documents", setDisableSection);
    }, [setDocumentData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
      IsActive: row.IsActive,
      Delete: row.Delete,
    });
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleRowUnselected = () => {
        handleClearForm();
    };

    const handleSave = async () => {
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };

      await putData("/api/putDocumentData", payload, window.location.href);

            addValidationMessage("Document Updated successfully", "success")
            setDocumentData(await fetchDocumentData());
        } catch (error) {
            console.error("Error saving document data:", error);
            addValidationMessage("Failed to update Document data ", "error");

        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            // delete from s3 as well
            handleS3Delete().then(() => {
                const data = deleteData("/api/deleteDocumentData", selectedRowData, window.location.href);
                handleClearForm();
                setDocumentData(fetchDocumentData());
            });
        } catch (error) {
            console.error("Error deleting document data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            DocumentCode: "",
            DocName: "",
            URL: "",
            Note: "",
            Category: "",
            Lock: false,
            VisibleCarer: false,
            VisibleClient: false,
            IsActive: "",
            Delete: "",
        });
    };

    const handleInputChange = ({id, value, type}) => {
        if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
            // value is a boolean
      const intendedValue = value ? "Y" : "N"; // Convert boolean to "Y"/"N"
            let message = "";
            if (id === "IsActive") {
        message = value
          ? "Are you sure you want to activate this address?"
          : "Are you sure you want to deactivate this address?";
      } else if (id === "Delete") {
        message = value
          ? "Are you sure you want to mark this address as deleted?"
          : "Are you sure you want to restore this address?";
      }

      setConfirmDialog({ open: true, field: id, message, newValue: intendedValue });
    } else {
      setSelectedRowData((prevState) => ({ ...prevState, [id]: value }));
        }
    };

    useEffect(() => {
        const updateVisibility = () => {
            let visibility = "";
            if (selectedRowData.VisibleClient && selectedRowData.VisibleCarer) {
                visibility = "Client & Worker";
            } else if (selectedRowData.VisibleCarer) {
                visibility = "Worker";
            } else if (selectedRowData.VisibleClient) {
                visibility = "Client";
            }
            if (visibility !== selectedRowData.Visibility) {
                setSelectedRowData((prev) => ({...prev, Visibility: visibility}));
            }
        };
        updateVisibility();
    }, [selectedRowData.VisibleCarer, selectedRowData.VisibleClient]);

    const fetchDocumentCategories = async () => {
        const response = await fetchData("/api/getDocumentCategories");
        const categories = response.data;
        return categories;
    };

    useEffect(() => {
        fetchDocumentCategories().then((data) => setDocCategories([{value: "", label: "NONE"}, ...data]));
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const generateFolderPath = (company, docCategory, docName, filename) => {
        return `${company}/maintenance/documents/${docCategory}_${docName}/${filename}`;
    };

    const handleS3Delete = async () => {
        console.log("Deleting file...", selectedRowData);
        if (!selectedRowData.URL) return;

        try {
            const response = await deleteData(`/api/deleteS3Data/${encodeURIComponent(selectedRowData.URL)}`, window.location.href);
            if (response.success) {
                console.log("File deleted successfully!");
                setOutput("File deleted successfully!");

                const data = {
                    ...selectedRowData,
                    URL: "",
                };

                const insertResponse = await putData("/api/putDocumentData", data, window.location.href);

                if (insertResponse.success) {
                    setOutput("Client Document updated successfully");
                    handleClearForm();
                    setUploadDialog(false);
                    setDocumentData(await fetchDocumentData());
                } else {
                    setOutput("Failed to update client document");
                }
            } else {
                setOutput("File deletion failed.");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            setOutput("An error occurred while deleting the file");
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        console.log("Uploading file...", file)
        if (!file) return;
        console.log("Selected Row Data:", selectedRowData)
        try {
            const company = process.env.NEXT_PUBLIC_COMPANY;
            const fileName = encodeURIComponent(file.name);
            const FolderPath = generateFolderPath(company, selectedRowData.Category, selectedRowData.DocName, fileName);
            console.log("Folder Path:", FolderPath)

            const response = await postData("/api/postS3Data", {FolderPath});
            const {uploadURL} = response;
            console.log("Upload URL:", uploadURL)
            if (!uploadURL) {
                setOutput("Failed to get pre-signed URL.");
                return;
            }

            console.log("Uploading file to S3...", file)

            const uploadRes = await fetch(uploadURL, {
                method: "PUT",
                headers: {"Content-Type": file.type},
                body: file,
            });

            console.log("Upload Response:", uploadRes)

            if (uploadRes.ok) {
                console.log("File uploaded successfully!")
                setOutput("File uploaded successfully!");
                const combinedData = {
                    ...selectedRowData,
                    URL: FolderPath,
                };

                const insertResponse = await postData(`/api/postDocumentData`, combinedData, window.location.href);

                if (insertResponse.success) {
                    setOutput("Client Document added successfully");
                    handleClearForm();
                    setUploadDialog(false);
                    setDocumentData(await fetchDocumentData());
                    addValidationMessage("Client Document added successfully", "success")

                } else {
                    setOutput("Failed to add client document");
                }
            } else {
                setOutput("File upload failed.");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Client Document", "error")

            setOutput("An error occurred while adding client document");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitUrl = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await postData("/api/postDocumentData", selectedRowData, window.location.href);
            if (response.success) {
                setOutput("Document added successfully");
                handleClearForm();
                setUrlDialog(false);
                setUploadDialog(false)
                addValidationMessage("Document added successfully", "success")
                setDocumentData(await fetchDocumentData());

            } else {
                setOutput("Failed to add document");
            }
        } catch (error) {
            console.error(error);
            addValidationMessage("Failed To add Document data", "error")

        } finally {
            setIsSubmitting(false);
        }
    };

    const fields = [
        {
            id: "URL",
            label: "URL",
            type: "text",
            value: selectedRowData.URL,
        },
        {
            id: "DocName",
            label: "Document Name",
            type: "text",
            value: selectedRowData.DocName,
        },
        {
            id: "Note",
            label: "Note",
            type: "text",
            value: selectedRowData.Note,
        },
        {
            id: "Category",
            label: "Category",
            type: "select",
            value: selectedRowData.Category,
            options: docCategories.map((category) => ({
                value: category.ID,
                label: category.Description,
            })),
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
            value: selectedRowData.Lock,
        },
        {
            id: "VisibleCarer",
            label: "Visible to Carer",
            type: "checkbox",
            value: selectedRowData.VisibleCarer,
        },
        {
            id: "VisibleClient",
            label: "Visible to Client",
            type: "checkbox",
            value: selectedRowData.VisibleClient,
        },
    {
      id: "IsActive",
      label: "Active",
      type: "checkbox",
      value: selectedRowData.IsActive, // now a boolean
    },
    {
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete, // now a boolean
    },
  ];


    const addUrlfields = [
        {
            id: "DocName",
            label: "Document Name",
            type: "text",
            value: selectedRowData.DocName || "",
        },
        {
            id: "URL",
            label: "URL",
            type: "text",
            value: selectedRowData.URL || "",
        },
        {
            id: "Note",
            label: "Note",
            type: "text",
            value: selectedRowData.Note || "",
        },
        {
            id: "Category",
            label: "Category",
            type: "select",
            value: selectedRowData.Category || "",
            options: docCategories.map((category) => ({
                value: category.ID,
                label: category.Description,
            })),
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
            checked: selectedRowData.Lock || false,
        },
        {
            id: "VisibleCarer",
            label: "Visible to Worker",
            type: "checkbox",
            checked: selectedRowData.VisibleCarer || false,
        },
        {
            id: "VisibleClient",
            label: "Visible to Client",
            type: "checkbox",
            checked: selectedRowData.VisibleClient || false,
        },
    ];


    const uploadDocFields = [
        {
            id: "DocName",
            label: "Document Name",
            type: "text",
            value: selectedRowData.DocName || "",
        },
        {
            id: "Category",
            label: "Category",
            type: "select",
            value: selectedRowData.Category || "",
            options: docCategories.map((category) => ({
                value: category.ID,
                label: category.Description,
            })),
        },
        {
            id: "Note",
            label: "Note",
            type: "text",
            value: selectedRowData.Note || "",
        },
        {
            id: "file",
            label: "Upload File",
            type: "file",
            onChange: handleFileChange, // Special handler for file input
        },
        {
            id: "Lock",
            label: "Lock",
            type: "checkbox",
            checked: selectedRowData.Lock || false,
        },
        {
            id: "VisibleCarer",
            label: "Visible to Worker",
            type: "checkbox",
            checked: selectedRowData.VisibleCarer || false,
        },
        {
            id: "VisibleClient",
            label: "Visible to Client",
            type: "checkbox",
            checked: selectedRowData.VisibleClient || false,
        },
    ];

    useEffect(() => {
        console.log("file : ", selectedRowData.file)
        setFile(selectedRowData.file)
    }, [selectedRowData.file])


    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                <ValidationBar messages={validationMessages} onClose={handleCloseMessage}/>

                {/* <SaveDelete saveOnClick={handleSave} display={selectedRowData.Lock ? "none" : ""} deleteOnClick={handleDelete}
                    disabled={disableSection} /> */}
                <CustomAgGridDataTable2

                    title="Documents"
                    primaryButton={{
                        label: "Upload Document",
                        icon: <PlusCircle className="h-4 w-4"/>,
                        onClick: () => setUploadDialog(true)
                        // disabled: disableSection,
                    }}
                    secondaryButton={{
                        label: "Add URL",
                        icon: <Link/>,
                        onClick: () => setUrlDialog(true)
                        // disabled: disableSection,
                    }}

                    rows={documentData?.data}
                    columns={columns.filter((col) => !['maker User', 'maker Date', 'Created By', 'Visibility', 'update User', 'update Time'].includes(col.headerName))}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                />

                <EditModal
                    show={uploadDialog}
                    onClose={() => {
                        setUploadDialog(false) , handleClearForm()
                    }}
                    onSave={handleSubmitUrl}
                    modalTitle="Add Document Details"
                    fields={uploadDocFields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />

                {/* <Modal
            isOpen={uploadDialog}
            onRequestClose={() => setUploadDialog(false)}
            style={{
              content: {
                maxWidth: "600px",
                margin: "0 auto",
                maxHeight: "80vh",
                overflow: "auto",
                marginTop: "10vh",
                borderRadius: "15px",
              },
              overlay: {
                zIndex: "10",
              },
            }}
            contentLabel="Upload Document"
        >
          <ModalHeader title={"Upload Document"} onCloseButtonClick={() => setUploadDialog(false)} />
          <form style={{padding: "1rem", transition: "all 0.5s"}} onSubmit={handleUpload}>
            <Container>
              <Row>
                <Col md={6} className="mt-3">
                  <InputField label="Document Name" type="text" id="DocName" value={selectedRowData.DocName}
                              onChange={handleInputChange} />
                </Col>
                <Col md={6} className="mt-3">
                  <InputField label="Category" type="select" id="Category" value={selectedRowData.Category}
                              onChange={handleInputChange} options={docCategories.map((category) => ({
                    value: category.ID,
                    label: category.Description
                  }))} />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mt-3">
                  <InputField label="Note" type="text" id="Note" value={selectedRowData.Note}
                              onChange={handleInputChange} />
                </Col>
                <Col md={6} className="mt-3">
                  <input type="file" onChange={handleFileChange} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <Checkbox id="Lock" checked={selectedRowData.Lock} onChange={handleInputChange} name="checkbox" />
                  Lock
                </Col>
              </Row>
              <Row>
                <Col>
                  <Checkbox id="VisibleCarer" checked={selectedRowData.VisibleCarer} onChange={handleInputChange}
                            name="checkbox" />
                  Visible to Worker
                </Col>
              </Row>
              <Row>
                <Col>
                  <Checkbox id="VisibleClient" checked={selectedRowData.VisibleClient} onChange={handleInputChange}
                            name="checkbox" />
                  Visible to Client
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mt-3">
                  <Button type="submit" label="Upload" variant="contained" disabled={isSubmitting} />
                </Col>
              </Row>
              <InfoOutput output={output} />
            </Container>
          </form>
        </Modal> */}


                {/* Add Url Modal */}
                <EditModal
                    show={urlDialog}
                    onClose={() => setUrlDialog(false)}
                    onSave={handleSubmitUrl}
                    modalTitle="Add Url Details"
                    fields={addUrlfields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />

                {/* Edit Modal */}
                <EditModal
                    show={showModal}
                    onClose={(handleCloseModal)}
                    onSave={handleSave}
                    modalTitle="Edit Document Details"
                    fields={fields}
                    data={selectedRowData}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateDocument;