import React, {useContext, useEffect, useState} from 'react';
import {fetchData} from '@/utility/api_utility';
import CreateTemplate from './createTemplate';
import AgGridDataTable from '@/components/widgets/AgGridDataTable';
import Header from '@/components/widgets/Header';
import style from "@/styles/style.module.css";
import {Box} from "@mui/material";
import ColorContext from '@/contexts/ColorContext';
import {Container} from "react-bootstrap";
import EditTemplate from '../form_template/EditTemplate';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [columns, setColumns] = useState([]);
    // const {colors} = useContext(ColorContext);

    // Fetch templates (each with its fields) from the API
    const fetchTemplates = async () => {
        try {
            const templateData = await fetchData('/api/getTemplatesWithFields', window.location.href);
            if (templateData && Array.isArray(templateData.data)) {
                setTemplates(templateData.data);
                setColumns([
                    {field: "templateId", headerName: "Template ID", width: 100},
                    {field: "name", headerName: "Template Name", width: 200},
                    {field: "description", headerName: "Description", width: 300},
                    {field: "fieldsString", headerName: "Fields", width: 400},
                ]);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // When a row is clicked, select that template for editing
    const handleRowSelected = (row) => {
        console.log("Selected Row Data:", row);
        setSelectedTemplate(row);
    };

    // When the update is complete, refresh the grid and clear the edit view
    const handleUpdateComplete = () => {
        fetchTemplates();
        setSelectedTemplate(null);
    };

    return (
        <Container>
            <Header title={"Template"}/>
            <Box className={style.spaceBetween} sx={{paddingBottom: "1rem"}}>
                <CreateTemplate/>
            </Box>
            {/* Render the EditTemplate component when a template is selected */}
            {selectedTemplate && (
                <EditTemplate
                    template={selectedTemplate}
                    onUpdate={handleUpdateComplete}
                    onCancel={() => setSelectedTemplate(null)}
                />
            )}

            <AgGridDataTable
                rows={templates}
                columns={columns}
                rowSelected={handleRowSelected}
                onRowClicked={(event) => handleRowSelected(event.data)}
            />
        </Container>
    );
};

export default Templates;