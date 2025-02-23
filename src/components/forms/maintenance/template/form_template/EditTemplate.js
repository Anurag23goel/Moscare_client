import React, {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import {putData} from "@/utility/api_utility";
import styles from '../../forms/dynamicforms.module.css';

const EditTemplate = ({template, onUpdate, onCancel}) => {
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

    // Load template data into local state
    useEffect(() => {
        if (template) {
            setTemplateName(template.name || "");
            setTemplateDescription(template.description || "");
            // If template.fields is already an array, use it directly; otherwise try to parse it.
            let parsedFields = Array.isArray(template.fields)
                ? template.fields
                : [];
            const processedFields = parsedFields.map((field) => ({
                Name: field.Name || field.name || "",
                Label: field.Label || field.label || "",
                Type: field.Type || field.type || "text",
                Options: field.Options || field.options || "",
                Required: typeof field.Required === "boolean" ? field.Required : !!field.required,
                Placeholder: field.Placeholder || field.placeholder || "",
                ConditionalDisplay: field.ConditionalDisplay || field.conditionalDisplay || "",
            }));
            setFields(processedFields);
        }
    }, [template]);

    const addField = () => {
        setFields([
            ...fields,
            {
                Name: "",
                Label: "",
                Type: "text",
                Options: "",
                Required: false,
                Placeholder: "",
                ConditionalDisplay: "",
            },
        ]);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
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
        // Prepare the updated template data (fields will be stored as JSON)
        const templateData = {
            templateId: template.templateId,
            Name: templateName,
            Description: templateDescription,
            fields,
        };

        try {
            const response = await putData("/api/updateTemplateData", templateData);
            if (response.success) {
                setSubmissionStatus("Template updated successfully!");
                onUpdate && onUpdate();
            } else {
                setSubmissionStatus("Failed to update template.");
            }
        } catch (error) {
            console.error("Error updating template:", error);
            setSubmissionStatus("Error updating template.");
        }
    };

    return (
        <Box className={styles.container} sx={{marginTop: "2rem", padding: "1rem", border: "1px solid #ccc"}}>
            <Typography variant="h6" className={styles.createTemplateHeader}>
                Edit Template
            </Typography>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <Row className={styles.row}>
                    <Col md={12}>
                        <TextField
                            sx={{width: "100%"}}
                            label="Template Name"
                            variant="outlined"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            required
                        />
                    </Col>
                </Row>
                <Row className={styles.row}>
                    <Col md={12}>
                        <TextField
                            sx={{width: "100%"}}
                            label="Description"
                            variant="outlined"
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                        />
                    </Col>
                </Row>

                <Typography className={styles.sectionHeader} sx={{marginTop: "1rem"}}>
                    Fields
                </Typography>
                {fields.map((field, index) => (
                    <div key={index} className={styles.fieldContainer}>
                        <Row className={styles.row}>
                            <Col md={4}>
                                <TextField
                                    name="Name"
                                    label="Field Name"
                                    variant="outlined"
                                    fullWidth
                                    value={field.Name}
                                    onChange={(e) => handleFieldChange(index, e)}
                                    required
                                    sx={{marginBottom: "1rem"}}
                                />
                            </Col>
                            <Col md={4}>
                                <TextField
                                    name="Label"
                                    label="Label"
                                    variant="outlined"
                                    fullWidth
                                    value={field.Label}
                                    onChange={(e) => handleFieldChange(index, e)}
                                    required
                                    sx={{marginBottom: "1rem"}}
                                />
                            </Col>
                            <Col md={4}>
                                <FormControl fullWidth variant="outlined" sx={{marginBottom: "1rem"}}>
                                    <InputLabel>Field Type</InputLabel>
                                    <Select
                                        name="Type"
                                        label="Field Type"
                                        value={field.Type}
                                        onChange={(e) => handleFieldChange(index, e)}
                                    >
                                        {fieldTypes.map((type, i) => (
                                            <MenuItem key={i} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Col>
                        </Row>
                        {field.Type === "select" && (
                            <Row className={styles.row}>
                                <Col md={12}>
                                    <TextField
                                        name="Options"
                                        label="Options (comma-separated)"
                                        variant="outlined"
                                        fullWidth
                                        value={field.Options}
                                        onChange={(e) => handleFieldChange(index, e)}
                                        sx={{marginBottom: "1rem"}}
                                    />
                                </Col>
                            </Row>
                        )}
                        <Row className={styles.row}>
                            <Col md={4}>
                                <TextField
                                    name="Placeholder"
                                    label="Placeholder"
                                    variant="outlined"
                                    fullWidth
                                    value={field.Placeholder}
                                    onChange={(e) => handleFieldChange(index, e)}
                                    sx={{marginBottom: "1rem"}}
                                />
                            </Col>
                            <Col md={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="Required"
                                            checked={field.Required}
                                            onChange={(e) => handleFieldChange(index, e)}
                                        />
                                    }
                                    label="Required"
                                    sx={{marginBottom: "1rem"}}
                                />
                            </Col>
                            <Col md={4}>
                                <TextField
                                    name="ConditionalDisplay"
                                    label="Conditional Display"
                                    variant="outlined"
                                    fullWidth
                                    value={field.ConditionalDisplay}
                                    onChange={(e) => handleFieldChange(index, e)}
                                    sx={{marginBottom: "1rem"}}
                                />
                            </Col>
                        </Row>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeField(index)}
                            className={styles.removeButton}
                        >
                            Remove Field
                        </Button>
                    </div>
                ))}

                <Box className={styles.buttonContainer} sx={{marginTop: "1rem"}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={addField}
                        className={styles.addButton}
                        sx={{marginRight: "1rem"}}
                    >
                        Add Field
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        className={styles.submitButton}
                        sx={{marginRight: "1rem"}}
                    >
                        Update Template
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={onCancel}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                </Box>

                {submissionStatus && (
                    <Typography variant="body1" className={styles.submissionStatus} sx={{marginTop: "1rem"}}>
                        {submissionStatus}
                    </Typography>
                )}
            </form>
        </Box>
    );
};

export default EditTemplate;
