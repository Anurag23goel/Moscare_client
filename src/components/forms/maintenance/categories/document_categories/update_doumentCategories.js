import React, {useContext, useEffect, useState} from "react";
import {deleteData, fetchData, fetchUserRoles, getColumns, putData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import CustomAgGridDataTable2 from "@/components/widgets/CustomAgGridDataTable2";
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import {Briefcase, CheckCircle2, GripHorizontal, Plus, Save, Trash2, Users, X} from 'lucide-react';

export const fetchDocumentCategoryData = async () => {
    try {
        const data = await fetchData("/api/getDocumentCategories", window.location.href);
        return data;
    } catch (error) {
        console.error("Error fetching document category data:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

export const fetchUserGroups = async () => {
    try {
        const data = await fetchData("/api/getUserGroups", window.location.href);
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return {data: []}; // Return an empty array in case of an error
    }
};

const UpdateDocumentCategory = ({setDocumentCategoryData, documentCategoryData, setShowForm, addValidationMessage}) => {
    const [selectedRowData, setSelectedRowData] = useState({
        ID: "",
        Description: "",
        UserGroupPermission: [], // Initialize as array
        WorkerTypePermission: [], // Initialize as array
    IsActive: "",
    Delete: "",
  });
  console.log("Selected Row Data:", selectedRowData);
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [disableSection, setDisableSection] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [columns, setColumns] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableUserGroups, setAvailableUserGroups] = useState([]);
    const [assignedUserGroups, setAssignedUserGroups] = useState([]);
    const [availableWorkerTypes, setAvailableWorkerTypes] = useState([
        {id: 'ft', text: 'Full-Time'},
        {id: 'pt', text: 'Part-Time'},
        {id: 'ct', text: 'Contractor'}
    ]);
    const [assignedWorkerTypes, setAssignedWorkerTypes] = useState([]);

    //const {colors} = useContext(ColorContext)
    const fetchAndSetDocumentCategoryData = async () => {
        const data = await fetchDocumentCategoryData();
        setDocumentCategoryData(data);
        setColumns(getColumns(data))

        const userGroupData = await fetchUserGroups();
        console.log("userGroupData.data", userGroupData.data)
        console.log("userGroups", userGroups)

        const formattedUserGroups = userGroupData.data.map(group => ({
            id: group.UserGroup, // Assign the UserGroup value to id
            text: group.UserGroup, // Assign the UserGroup value to text
        }));
        setAvailableUserGroups(formattedUserGroups);

        setUserGroups(userGroupData.data);
        // setAvailableUserGroups(userGroupData.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAndSetDocumentCategoryData();
        fetchUserRoles('m_doc_ctg', "Maintainence_Document_Categories", setDisableSection);
    }, []);

    const handleSelectRowClick = (row) => {
        setSelectedRowData({
      ...row,
      IsActive: row.IsActive,
      Delete: row.Delete,
    });
        setShowModal(true);
    };

    const getGradient = () => {
        const gradients = [
            'from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20',
            'from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20',
            'from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20',
            'from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20',
            'from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/20 dark:to-blue-900/20',
            'from-rose-500/10 to-red-500/10 dark:from-rose-900/20 dark:to-red-900/20'
        ];

        const randomIndex = Math.floor(Math.random() * gradients.length);
        return gradients[randomIndex];
    };

    const PermissionItem = ({id, text, type, onRemove, isAssigned}) => {
        const [{isDragging}, drag] = useDrag(() => ({
            type: type,
            item: {id, text},
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }));

        return (
            <div
                ref={drag}
                className={`flex items-center justify-between p-3 mb-2 rounded-lg glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 cursor-move transition-all ${
                    isDragging ? 'opacity-50' : ''
                } ${isAssigned ? 'bg-purple-50/50 dark:bg-purple-900/20' : ''} bg-gradient-to-r ${getGradient()}`}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal className="h-4 w-4 text-gray-400"/>
                    <span className="text-sm font-medium">{text}</span>
                </div>
                {isAssigned && (
                    <button
                        onClick={() => onRemove(id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                )}
            </div>
        );
    };

    // Permission Container Component
    const PermissionContainer = ({title, icon: Icon, items, onDrop, onRemove, type}) => {

        const [{isOver}, drop] = useDrop(() => ({
            accept: type,
            drop: (item) => onDrop(item),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }));

        return (
            <div
                ref={drop}
                className={`glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 ${
                    isOver ? 'ring-2 ring-purple-500/50' : ''
                }`}
            >
                <div className="flex  justify-center gap-2 mb-4">
                    <Icon className=" text-purple-500 flex-shrink-0"/>
                    <h3 className="text-lg font-medium relative ">{title}</h3>
                </div>
                <div className="min-h-[200px]">
                    {items.map((item) => (
                        <PermissionItem
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            type={type}
                            onRemove={onRemove}
                            isAssigned={item.isAssigned}
                        />
                    ))}
                    {items.length === 0 && (
                        <div
                            className="flex items-center justify-center  text-center h-32 text-gray-400 dark:text-gray-500">
                            Drag and drop you first permission from available
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Handle drops for user groups
    const handleUserGroupDrop = (item) => {
        const group = availableUserGroups.find(g => g.id === item.id);
        if (group && !assignedUserGroups.find(g => g.id === item.id)) {
            setAssignedUserGroups(prev => [...prev, {...group, isAssigned: true}]);
            setSelectedRowData(prev => ({
                ...prev,
                UserGroupPermission: [...prev.UserGroupPermission, item.id]
            }));
        }
    };

    // Handle drops for worker types
    const handleWorkerTypeDrop = (item) => {
        const type = availableWorkerTypes.find(t => t.id === item.id);
        if (type && !assignedWorkerTypes.find(t => t.id === item.id)) {
            setAssignedWorkerTypes(prev => [...prev, {...type, isAssigned: true}]);
            setSelectedRowData(prev => ({
                ...prev,
                WorkerTypePermission: [...prev.WorkerTypePermission, item.id]
            }));
        }
    };

    // Handle removing permissions
    const handleRemoveUserGroup = (id) => {
        setAssignedUserGroups(prev => prev.filter(g => g.id !== id));
        setSelectedRowData(prev => ({
            ...prev,
            UserGroupPermission: prev.UserGroupPermission.filter(g => g !== id)
        }));
    };

    const handleRemoveWorkerType = (id) => {
        setAssignedWorkerTypes(prev => prev.filter(t => t.id !== id));
        setSelectedRowData(prev => ({
            ...prev,
            WorkerTypePermission: prev.WorkerTypePermission.filter(t => t !== id)
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
        ...selectedRowData,
        // Ensure the payload values are "Y" or "N"
        IsActive: selectedRowData.IsActive ? "Y" : "N",
        Delete: selectedRowData.Delete ? "Y" : "N",
      };
      const response = await putData("/api/putDocumentCategory", selectedRowData, window.location.href);
            console.log("Save clicked:", response);
            if (response.success) {
                addValidationMessage("Document category updated successfully", "success");
                const updatedData = await fetchDocumentCategoryData();
                setDocumentCategoryData(updatedData);
            } else {
                console.error("Error in response:", response.message);
            }
        } catch (error) {
            addValidationMessage("An error occured while updating document categories")
            console.error("Error saving data:", error);
        }
        setShowModal(false);

    };
    const handleCloseModal = () => setShowModal(false);

    const handleDelete = async () => {
        try {
            const response = await deleteData("/api/deleteDocumentCategory", {ID: selectedRowData.ID}, window.location.href);
            console.log("Delete clicked:", response);
            if (response.success) {
                handleClearForm();
                const updatedData = await fetchDocumentCategoryData();
                setDocumentCategoryData(updatedData);
            } else {
                console.error("Error in response:", response.message);
            }
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            ID: "",
            Description: "",
            UserGroupPermission: [], // Reset to empty array
            WorkerTypePermission: [], // Reset to empty array
            IsActive: "",
            Delete: "",
        });
    };

    // const handleInputChange = (event) => {
    //   setSelectedRowData(prevData => ({
    //     ...prevData,
    //     [event.target.id]: event.target.value // Dynamic input handling for description
    //   }));
    // };

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
        setSelectedRowData((prevState) => ({...prevState, [id]: value}));
    }
    };

    const handleCheckboxChange = (event, group) => {
        const selectedGroups = selectedRowData.UserGroupPermission;
        if (event.target.checked) {
            // Add the group to the selected list
            setSelectedRowData(prevData => ({
                ...prevData,
                UserGroupPermission: [...selectedGroups, group]
            }));
        } else {
            // Remove the group from the selected list
            setSelectedRowData(prevData => ({
                ...prevData,
                UserGroupPermission: selectedGroups.filter(item => item !== group)
            }));
        }
    };

    const handleWorkerTypeCheckboxChange = (event, type) => {
        const selectedTypes = selectedRowData.WorkerTypePermission;
        if (event.target.checked) {
            // Add the type to the selected list
            setSelectedRowData(prevData => ({
                ...prevData,
                WorkerTypePermission: [...selectedTypes, type]
            }));
        } else {
            // Remove the type from the selected list
            setSelectedRowData(prevData => ({
                ...prevData,
                WorkerTypePermission: selectedTypes.filter(item => item !== type)
            }));
        }
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const modalFields = [
        {id: "Description", label: "Description", type: "text"},
        {
            id: "UserGroupPermission",
            label: "User Group Permission",
            type: "checkbox-group",
            options: userGroups.map(group => ({value: group.UserGroup, label: group.UserGroup}))
        },
        {
            id: "WorkerTypePermission",
            label: "Worker Type Permission",
            type: "checkbox-group",
            options: [
                {value: "Full-Time", label: "Full-Time"},
                {value: "Part-Time", label: "Part-Time"},
                {value: "Contractor", label: "Contractor"}
            ]
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
    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className="max-w-7xl pt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Document Categories
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage document categories and permissions
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={disableSection || isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Save className="h-4 w-4"/>
                                <span>Save Changes</span>
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={disableSection || isLoading}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-red-200/50 dark:border-red-700/50 text-red-600 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4"/>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
                            <div className="max-w-xl">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="Description"
                                    value={selectedRowData.Description}
                                    onChange={(e) => handleInputChange({id: 'Description', value: e.target.value})}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="Enter category description"
                                />
                            </div>
                        </div>

                        {/* Permissions Kanban Board */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* User Group Permissions */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    User Group Permissions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PermissionContainer
                                        title="Available Groups"
                                        icon={Users}
                                        items={availableUserGroups.filter(t => !assignedUserGroups.find(at => at.id === t.id))}
                                        onDrop={handleUserGroupDrop}
                                        type="userGroup"
                                    />
                                    <PermissionContainer
                                        title="Assigned Groups"
                                        icon={CheckCircle2}
                                        items={assignedUserGroups}
                                        onDrop={handleUserGroupDrop}
                                        onRemove={handleRemoveUserGroup}
                                        type="userGroup"
                                    />
                                </div>
                            </div>

                            {/* Worker Type Permissions */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Worker Type Permissions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PermissionContainer
                                        title="Available Types"
                                        icon={Briefcase}
                                        items={availableWorkerTypes.filter(t => !assignedWorkerTypes.find(at => at.id === t.id))}
                                        onDrop={handleWorkerTypeDrop}
                                        type="workerType"
                                    />
                                    <PermissionContainer
                                        title="Assigned Types"
                                        icon={CheckCircle2}
                                        items={assignedWorkerTypes}
                                        onDrop={handleWorkerTypeDrop}
                                        onRemove={handleRemoveWorkerType}
                                        type="workerType"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Grid Section */}
                    <div
                        className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                        {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}

                        <div className="flex items-center justify-between mb-6">
                            <div className="relative flex-1 max-w-xs">

                            </div>

                            <button
                                onClick={() => setShowForm(true)}
                                disabled={disableSection}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4"/>
                                <span>Add Category</span>
                            </button>
                        </div>

                        <CustomAgGridDataTable2


                            rows={documentCategoryData.data}
                            columns={columns}
                            rowSelected={handleSelectRowClick}
                            showActionColumn={true}
                        />
                    </div>
                </div>

                {/* Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                             onClick={() => setShowModal(false)}/>

                        <div
                            className="relative w-full max-w-2xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Edit Document Category
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500"/>
                                    </button>
                                </div>

                                {/* Modal content would go here */}

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default UpdateDocumentCategory;
