import React, {useState} from "react";
import {AlertTriangle, ChevronDown, Plus, Save, Trash2} from 'lucide-react';
import {postData} from "@/utility/api_utility";

const CreateTemplate = () => {
    const [templateName, setTemplateName] = useState("");
    const [templateDescription, setTemplateDescription] = useState("");
    const [fields, setFields] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState("");

    const fieldTypes = [
        {label: "Text", value: "text"},
        {label: "Number", value: "number"},
        {label: "Select", value: "select"},
        {label: "Date", value: "date"},
        {label: "Checkbox", value: "checkbox"},
    ];

    const addField = () => {
        setFields([
            ...fields,
            {Name: "", Label: "", Type: "text", Options: "", Required: false, Placeholder: "", ConditionalDisplay: ""},
        ]);
    };

    const removeField = (index) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        setFields(updatedFields);
    };

    const handleFieldChange = (index, event) => {
        const {name, value, type, checked} = event.target;
        const updatedFields = fields.map((field, i) =>
            i === index ? {...field, [name]: type === "checkbox" ? checked : value} : field
        );
        setFields(updatedFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const templateData = {
            Name: templateName,
            Description: templateDescription,
            fields, // This remains an array on the client side.
        };

        try {
            const response = await postData("/api/postTemplateData", templateData);
            if (response.success) {
                setSubmissionStatus("Template created successfully!");
                setTemplateName("");
                setTemplateDescription("");
                setFields([]);
            } else {
                setSubmissionStatus("Failed to create template.");
            }
        } catch (error) {
            console.error("Error creating template:", error);
            setSubmissionStatus("Error creating template.");
        }
    };


    return (
        <div className=" bg-white gradient-background glass mx-auto border rounded-xl">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex  justify-between gap-3 mb-2">

                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Create Template
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Design and configure form templates
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Details */}
                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="Enter template name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={templateDescription}
                                        onChange={(e) => setTemplateDescription(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="Enter template description"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fields Section */}
                        <div
                            className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Template Fields
                                </h2>
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    <Plus className="h-4 w-4"/>
                                    <span>Add Field</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div
                                        key={index}
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => removeField(index)}
                                            className="absolute top-4 right-4 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Field Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="Name"
                                                    value={field.Name}
                                                    onChange={(e) => handleFieldChange(index, e)}
                                                    required
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Label
                                                </label>
                                                <input
                                                    type="text"
                                                    name="Label"
                                                    value={field.Label}
                                                    onChange={(e) => handleFieldChange(index, e)}
                                                    required
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Field Type
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="Type"
                                                        value={field.Type}
                                                        onChange={(e) => handleFieldChange(index, e)}
                                                        className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                                    >
                                                        {fieldTypes.map((type) => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                                                </div>
                                            </div>

                                            {field.Type === "select" && (
                                                <div className="md:col-span-3">
                                                    <label
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Options (comma-separated)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="Options"
                                                        value={field.Options}
                                                        onChange={(e) => handleFieldChange(index, e)}
                                                        className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Placeholder
                                                </label>
                                                <input
                                                    type="text"
                                                    name="Placeholder"
                                                    value={field.Placeholder}
                                                    onChange={(e) => handleFieldChange(index, e)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="Required"
                                                        checked={field.Required}
                                                        onChange={(e) => handleFieldChange(index, e)}
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Required Field</span>
                                                </label>
                                            </div>

                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Conditional Display
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ConditionalDisplay"
                                                    value={field.ConditionalDisplay}
                                                    onChange={(e) => handleFieldChange(index, e)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    placeholder="Enter condition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <Save className="h-4 w-4"/>
                                <span>Save Template</span>
                            </button>
                        </div>

                        {/* Submission Status */}
                        {submissionStatus && (
                            <div
                                className="mt-4 p-4 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center gap-2">
                                    {submissionStatus.includes('success') ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500"/>
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-amber-500"/>
                                    )}
                                    <span className="text-gray-700 dark:text-gray-300">
                    {submissionStatus}
                  </span>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTemplate;