import React, {useEffect, useState} from "react";
import {fetchData, postData} from "@/utility/api_utility";
import EditModal from "@/components/widgets/EditModal";

const CreateFormModal = ({onClose, setShowModal, showModal}) => {
    // Lookup data
    const [templates, setTemplates] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);

    // Form state with additional "formType" field.
    const [formDetails, setFormDetails] = useState({
        formType: "regular", // Options: "regular", "shift_start", "shift_end"
        templateId: "",
        name: "",
        formDate: "",
        reviewDate: "",
        // Assignment toggles stored as "Y" or "N"
        assignToWorker: "N",
        assignToClient: "N",
        assignToUser: "N",
        // Multi‑select arrays for assignments
        workerIds: [],
        clientIds: [],
        userIds: [],
    });

    useEffect(() => {
        const fetchDataAsync = async () => {
            const templatesResponse = await fetchData("/api/getTemplateData");
            const workersResponse = await fetchData("/api/getActiveWorkerMasterData");
            const clientsResponse = await fetchData("/api/getActiveClientMasterData");
            const usersResponse = await fetchData("/api/getUserData");
            setTemplates(templatesResponse.data || []);
            setWorkers(workersResponse.data || []);
            setClients(clientsResponse.data || []);
            setUsers(usersResponse || []);
        };
        fetchDataAsync();
    }, []);

    // Generic change handler
    const handleChange = ({id, value}) => {
        if (["workerIds", "clientIds", "userIds"].includes(id)) {
            const newValue = Array.isArray(value) ? value : value ? [value] : [];
            setFormDetails((prevState) => ({...prevState, [id]: newValue}));
        } else {
            setFormDetails((prevState) => ({...prevState, [id]: value}));
        }
    };

    // Checkbox toggle handler (using "Y" and "N")
    const handleCheckboxChange = (id) => {
        setFormDetails((prevState) => {
            const newValue = prevState[id] === "Y" ? "N" : "Y";
            const updatedState = {...prevState, [id]: newValue};
            if (newValue === "N") {
                if (id === "assignToWorker") updatedState.workerIds = [];
                if (id === "assignToClient") updatedState.clientIds = [];
                if (id === "assignToUser") updatedState.userIds = [];
            }
            return updatedState;
        });
    };

    // Submit handler: call different endpoints based on form type.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formDetails.formType === "regular") {
            // Build assignments for regular form
            const assignments = [];
            if (formDetails.assignToWorker === "Y" && formDetails.workerIds.length > 0) {
                assignments.push(
                    ...formDetails.workerIds.map((workerId) => ({
                        type: "worker",
                        id: workerId,
                    }))
                );
            }
            if (formDetails.assignToClient === "Y" && formDetails.clientIds.length > 0) {
                assignments.push(
                    ...formDetails.clientIds.map((clientId) => ({
                        type: "client",
                        id: clientId,
                    }))
                );
            }
            if (formDetails.assignToUser === "Y" && formDetails.userIds.length > 0) {
                assignments.push(
                    ...formDetails.userIds.map((userId) => ({
                        type: "user",
                        id: userId,
                    }))
                );
            }
            const payload = {
                templateId: formDetails.templateId,
                name: formDetails.name,
                formDate: formDetails.formDate,
                reviewDate: formDetails.reviewDate,
                assignments,
            };
            const response = await postData("/api/createFormWithAssignments", payload);
            if (response.success) {
                onClose();
            } else {
                alert("Failed to create form");
            }
        } else if (
            formDetails.formType === "shift_start" ||
            formDetails.formType === "shift_end"
        ) {
            if (formDetails.workerIds.length === 0) {
                alert("Please select at least one worker for shift form assignment.");
                return;
            }

            //  Extract only WorkerId values
            const workerIdsArray = formDetails.workerIds.map(worker => worker.value);

            const payload = {
                TemplateID: formDetails.templateId,
                TriggerType: formDetails.formType, // "shift_start" or "shift_end"
                FormName: formDetails.name,
                WorkerIds: workerIdsArray, //  Send all selected worker IDs as an array
            };

            const response = await postData("/api/createAutoAssignTemplate", payload);

            if (response.success) {
                onClose();
            } else {
                alert("Failed to create shift form.");
            }
        }
    };

    // Define fields for the EditModal.
    // Note: The "Form Type" selection controls which assignment options appear.
    const fields = [
        {
            label: "Form Type",
            id: "formType",
            type: "select",
            value: formDetails.formType,
            onChange: handleChange,
            options: [
                {value: "regular", label: "Regular Form"},
                {value: "shift_start", label: "Shift Start Form"},
                {value: "shift_end", label: "Shift End Form"},
            ],
            required: true,
        },
        {
            label: "Template",
            id: "templateId",
            type: "select",
            value: formDetails.templateId,
            onChange: handleChange,
            options: [
                {value: "", label: "Select Template"},
                ...templates.map((template) => ({
                    value: template.ID,
                    label: template.Name,
                })),
            ],
            required: true,
        },
        {
            label: "Form Name",
            id: "name",
            type: "text",
            value: formDetails.name,
            onChange: handleChange,
            required: true,
        },
        {
            label: "Form Date",
            id: "formDate",
            type: "date",
            value: formDetails.formDate,
            onChange: handleChange,
            required: true,
            InputLabelProps: {shrink: true},
        },
        {
            label: "Review Date",
            id: "reviewDate",
            type: "date",
            value: formDetails.reviewDate,
            onChange: handleChange,
            required: true,
            InputLabelProps: {shrink: true},
        },
        // Assignment options for workers are always allowed.
        {
            label: "Assign to Worker",
            id: "assignToWorker",
            type: "checkbox",
            checked: formDetails.assignToWorker === "Y",
            onChange: () => handleCheckboxChange("assignToWorker"),
        },
        formDetails.assignToWorker === "Y"
            ? {
                label: "Select Worker(s)",
                id: "workerIds",
                type: "multiselect",
                value: formDetails.workerIds,
                onChange: handleChange,
                options: workers.map((worker) => ({
                    value: worker.WorkerID,
                    label: `${worker.FirstName} ${worker.LastName}`,
                })),
                required: true,
            }
            : null,
        // Only for regular forms, show client and user assignment options.
        formDetails.formType === "regular"
            ? {
                label: "Assign to Client",
                id: "assignToClient",
                type: "checkbox",
                checked: formDetails.assignToClient === "Y",
                onChange: () => handleCheckboxChange("assignToClient"),
            }
            : null,
        formDetails.formType === "regular" && formDetails.assignToClient === "Y"
            ? {
                label: "Select Client(s)",
                id: "clientIds",
                type: "multiselect",
                value: formDetails.clientIds,
                onChange: handleChange,
                options: clients.map((client) => ({
                    value: client.ClientID,
                    label: `${client.FirstName} ${client.LastName}`,
                })),
                required: true,
            }
            : null,
        formDetails.formType === "regular"
            ? {
                label: "Assign to User",
                id: "assignToUser",
                type: "checkbox",
                checked: formDetails.assignToUser === "Y",
                onChange: () => handleCheckboxChange("assignToUser"),
            }
            : null,
        formDetails.formType === "regular" && formDetails.assignToUser === "Y"
            ? {
                label: "Select User(s)",
                id: "userIds",
                type: "multiselect",
                value: formDetails.userIds,
                onChange: handleChange,
                options: users.map((user) => ({
                    value: user.User_ID,
                    label: `${user.FirstName} ${user.LastName}`,
                })),
                required: true,
            }
            : null,
    ].filter(Boolean);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <EditModal
                show={showModal}
                onClose={onClose}
                onSave={handleSubmit}
                modalTitle="Create Form"
                fields={fields}
                data={formDetails}
                onChange={handleChange}
            />
        </div>
    );
};

export default CreateFormModal;
