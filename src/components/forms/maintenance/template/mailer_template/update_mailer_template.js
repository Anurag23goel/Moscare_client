import React, {useContext, useEffect, useState} from "react";
import {fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import Modal from "react-modal";
import EditModal from "@/components/widgets/EditModal";
import ColorContext from "@/contexts/ColorContext";
import Cookies from 'js-cookie';
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";


Modal.setAppElement("#__next");

export const fetchMailerData = async () => {
    try {
        const data = await fetchData("/api/getMailerTemplateDataAll", window.location.href);
        // const transformedData = {
        //   ...data,
        //   data: data.data.map((item) => ({
        //     ...item,
        //     Lock: item.Lock ? true : false,
        //     VisibleCarer: item.VisibleCarer ? true : false,
        //     VisibleClient: item.VisibleClient ? true : false,
        //   })),
        // };
        return data;
    } catch (error) {
        console.error("Error fetching document data:", error);
    }
};

const UpdateMailerTemplate = ({mailerData, setMailerData, setShowForm}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        Name: "",
        Subject: "",
        Body: "",
        UserId: "",
    IsActive: "", // "Y" means active
    Delete: "",   // "N" means not deleted
  });
  console.log("Selected Row Data:", selectedRowData);
    const [disableSection, setDisableSection] = useState(false);
    const [output, setOutput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [columns, setColumns] = useState([])
    const [showModal, setShowModal] = useState(false);
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchAndsetMailerData = async () => {
            const data = await fetchMailerData();
            setMailerData(data);
            setColumns(getColumns(data))
        };
        fetchAndsetMailerData();
        fetchUserRoles("m_maint_documents", "Maintainence_Documents", setDisableSection);
    }, [setMailerData]);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
      IsActive: row.IsActive === "N" ? "N" : "Y",
      Delete: row.Delete === "N" ? "N" : "Y",
    });
        setShowModal(true);
    };


    const handleCloseModal = () => setShowModal(false);

    const handleRowUnselected = () => {
        handleClearForm();
    };

    useEffect(() => {
        setSelectedRowData((prevState) => ({
            ...prevState,
            UserId: Cookies.get('User_ID') || ''
        }))
    }, [])

    const handleSave = async () => {

        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive === "N" ? "N" : "Y",
        Delete: selectedRowData.Delete === "N" ? "N" : "Y",
      };
      const updatedRowData = {
          ...selectedRowData,
          UserId: Cookies.get('User_ID') || ''
      };
            const data = await putData("/api/putMailerTemplateData", updatedRowData, window.location.href);
            console.log(data)
            setMailerData(await fetchMailerData());
            handleClearForm();

        } catch (error) {
            console.error("Error saving document data:", error);
        }
        setShowModal(false);
    };


    const handleClearForm = () => {
        setSelectedRowData({
            Name: "",
            Subject: "",
            Body: "",
            IsActive: "",
            Delete: "",
        });
    };

    const handleInputChange = ({id, value, type}) => {
        if ((id === "IsActive" || id === "Delete") && type === "checkbox") {
      const intendedValue = value ? "Y" : "N"; // Convert boolean to "Y"/"N"
            let message = "";
      if (id === "IsActive") {
        message =
          intendedValue === "Y"
            ? "Are you sure you want to activate this address?"
            : "Are you sure you want to deactivate this address?";
      } else if (id === "Delete") {
        message =
          intendedValue === "Y"
            ? "Are you sure you want to mark this address as deleted?"
            : "Are you sure you want to restore this address?";
      }

      setConfirmDialog({ open: true, field: id, message, newValue: intendedValue });
    } else {
            setSelectedRowData((prevState) => ({...prevState, [id]: value}));
        }
    };

    const fields = [
        {
            id: "Name",
            label: "Name",
            type: "text",
            value: selectedRowData.URL,
        },
        {
            id: "Subject",
            label: "Subject",
            type: "text",
            value: selectedRowData.DocName,
        },
        {
            id: "Body",
            label: "Body",
            type: "text",
            value: selectedRowData.Note,
        },
        {
            id: "IsActive",
      label: "Active",
      type: "checkbox",
      // Convert string value to boolean for display
      value: selectedRowData.IsActive === "N" ? 'N' : 'Y',
    },
    {
      id: "Delete",
      label: "Mark as Deleted",
      type: "checkbox",
      value: selectedRowData.Delete === "N" ? 'N' : 'Y',
    },];

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
            <div className="pl-1 mb-4"><CustomBreadcrumbs /></div>
            <div
                className="mt-8 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

                {/* <SaveDelete saveOnClick={handleSave} display={selectedRowData.Lock ? "none" : ""} deleteOnClick={handleDelete}
                    disabled={disableSection} /> */}

                {/*<Button*/}
                {/*sx={{*/}
                {/*  backgroundColor: "blue",*/}
                {/*  marginRight:"1rem",*/}
                {/*  "&:hover": {*/}
                {/*    backgroundColor: "blue", // Replace this with your desired hover color*/}
                {/*  },*/}
                {/*}}*/}
                {/*label="Add Template"*/}
                {/*    variant="contained"*/}
                {/*    color="primary"*/}
                {/*    startIcon={<AddIcon />}*/}
                {/*    onClick={() => setShowForm(true)}*/}
                {/*    disabled={disableSection}*/}
                {/*    size={"small"}*/}
                {/*/>*/}


                <CustomAgGridDataTable2

                    title="Email Template"


                    rows={mailerData?.data}
                    columns={columns.filter((col) => !['Maker User', 'Maker Date', 'Update User', 'Update Time', 'ID'].includes(col.headerName))}
                    rowSelected={handleSelectRowClick}
                    handleRowUnselected={handleRowUnselected}
                />

                <EditModal
                    show={showModal}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    modalTitle="Edit Template"
                    fields={fields}
                    data={selectedRowData}
                    extraTemplateData={["$NAME", "$EMAIL", "$PHONE"]}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default UpdateMailerTemplate;