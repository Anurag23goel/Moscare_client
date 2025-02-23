import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData,} from "@/utility/api_utility";
import StatusBar from "@/components/widgets/StatusBar";
import ColorContext from "@/contexts/ColorContext";
import EditModal from "@/components/widgets/EditModal";
import styles from "@/styles/style.module.css";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import { FileText, PlusCircle, ClipboardList, CheckCircle, UploadCloud, Edit, MoreHorizontal } from "lucide-react";


export const fetchClientGoalData = async (ClientID) => {
    try {
        const data = await fetchData(
            `/api/getClientGoalData/${ClientID}`,
            window.location.href
        );
        console.log("Fetched data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching client goal data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateGoal = ({
                        setClientGoalData,
                        clientGoalData,
                        setShowForm,
                        ClientID,
                    }) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ClientID: ClientID,
        Goal: "",
        Service: "",
        Outcome: "",
        StartDate: "",
        EndDate: "",
        GoalAchieved: "0",
        Budget: "",
    });
    const [service, setService] = useState([]);
    const [disableSection, setDisableSection] = useState(false);
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(null); // storing the api status
    const [columns, setColumns] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const {colors, loading} = useContext(ColorContext);

    const fetchAndSetClientGoalData = async () => {
        const data = await fetchClientGoalData(ClientID);
        setClientGoalData(data);
        setColumns(getColumns(data));
        const servicedata = await fetchData(
            "/api/getServiceCategory",
            window.location.href
        );
        setService(servicedata.data);
    };

    useEffect(() => {
        fetchAndSetClientGoalData();
        fetchUserRoles("m_cprofile", "Client_Profile_Goal", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData(row);
        setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleSave = async () => {
        try {
            const data = await putData(
                "/api/updateClientGoalData",
                selectedRowData,
                window.location.href
            );
            console.log("Save clicked:", data);
            if (data.success) {
                setAlert(true);
                setStatus(true);
            } else setStatus(false);
            setClientGoalData(await fetchClientGoalData(ClientID));
            handleClearForm();
        } catch (error) {
            console.error("Error saving data:", error);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        try {
            const data = await deleteData(
                "/api/deleteClientGoalData",
                selectedRowData,
                window.location.href
            );
            console.log("Delete clicked:", data);
            handleClearForm();
            setClientGoalData(await fetchClientGoalData(ClientID));
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            Goal: "",
            Service: "",
            Outcome: "",
            StartDate: "",
            EndDate: "",
            GoalAchieved: "0",
            Budget: "",
        });
    };

    const handleInputChange = ({id, value}) => {
        setSelectedRowData((prev) => ({...prev, [id]: value}));
    };

    const fields = [
        {
            id: "Goal",
            label: "Goal:",
            value: selectedRowData.Goal,
            type: "text",
        },
        {
            id: "Service",
            label: "Service:",
            value: selectedRowData.Service,
            type: "select",
            options: service.map((form) => ({
                value: form.Description,
                label: form.Description,
            })),
        },
        {
            id: "Outcome",
            label: "Outcome:",
            value: selectedRowData.Outcome,
            type: "text",
        },
        {
            id: "StartDate",
            label: "Start Date:",
            value: selectedRowData.StartDate,
            type: "date",
        },
        {
            id: "EndDate",
            label: "End Date:",
            value: selectedRowData.EndDate,
            type: "date",
        },
        {
            id: "GoalAchieved",
            label: `Goal Achieved: ${selectedRowData.GoalAchieved}%`,
            value: selectedRowData.GoalAchieved,
            type: "range",
            min: 0,
            max: 100,
        },
        {
            id: "Budget",
            label: "Budget $:",
            value: selectedRowData.Budget,
            type: "number",
        },
    ];

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">


                {
                    alert && <StatusBar status={status} setAlert={setAlert}
                                        msg={!status ? "Something went wrong" : "Profile Updated Successfully"}/>
                }
                {/* <div className={styles.spaceBetween}> */}

                <div>
                    {alert && (
                        <StatusBar
                            status={status}
                            setAlert={setAlert}
                            msg={
                                !status ? "Something went wrong" : "Profile Updated Successfully"
                            }
                        />
                    )}


        <CustomAgGridDataTable2 
        title="Goals"
        primaryButton={{
          label: "Add Client Goal",
          icon: <PlusCircle className="h-4 w-4" />,
          onClick: () => setShowForm(true),
          // disabled: disableSection,
        }}
        
        rows={clientGoalData.data}
        columns={columns}
        rowSelected={handleSelectRowClick}
        showActionColumn={true}
        />
        
        {/* <SaveDelete
        saveOnClick={handleSave}
        display={selectedRowData.Lock === true ? "none" : ""}
        deleteOnClick={handleDelete}
        disabled={disableSection}
      /> */}
                    {/* <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "0.5rem",
          margin: "1rem",
          maxWidth: "80vw",
        }}
      >
        <Grid>
          <InputField
            id="Goal"
            label="Goal:"
            value={selectedRowData.Goal}
            type="text"
            onChange={handleInputChange}
            disabled={disableSection}
          />
          <InputField
            id="Service"
            label="Service:"
            value={selectedRowData.Service}
            type="select"
            onChange={handleInputChange}
            disabled={disableSection}
            options={service.map((form) => ({
              value: form.Description,
              label: form.Description,
            }))}
          />
          <InputField
            id="Outcome"
            label="Outcome:"
            value={selectedRowData.Outcome}
            type="text"
            onChange={handleInputChange}
            disabled={disableSection}
          />
          <InputField
            id="StartDate"
            label="Start Date:"
            value={selectedRowData.StartDate}
            type="date"
            onChange={handleInputChange}
            disabled={disableSection}
          />
          <InputField
            id="EndDate"
            label="End Date:"
            value={selectedRowData.EndDate}
            type="date"
            onChange={handleInputChange}
            disabled={disableSection}
          />
          <InputField
            id="GoalAchieved"
            label={`Goal Achieved: ${selectedRowData.GoalAchieved}%`}
            value={selectedRowData.GoalAchieved}
            type="range"
            onChange={handleInputChange}
            disabled={disableSection}
            min="0"
            max="100"
          />
          <InputField
            id="Budget"
            label="Budget $:"
            value={selectedRowData.Budget}
            type="number"
            onChange={handleInputChange}
            disabled={disableSection}
          />
          <br />
        </Grid>
      </form> */}

                    <EditModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleSave}
                        modalTitle="Edit Goal Information"
                        fields={fields}
                        data={selectedRowData}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default UpdateGoal;
