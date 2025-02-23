import AgGridDataTable from '@/components/widgets/AgGridDataTable'
import {Box} from '@mui/material'
import styles from "@/styles/style.module.css";
import React, {useContext, useEffect, useState} from 'react'
import {fetchData} from '@/utility/api_utility';
import MButton from '@/components/widgets/MaterialButton';
import AddIcon from "@mui/icons-material/Add";
import Header from '@/components/widgets/Header';
import ColorContext from '@/contexts/ColorContext';


const Vehicle_Forms = ({selectedComponent, ID}) => {
    const [selectedRow, setSelectedRow] = useState([]);
    // const {colors} = useContext(ColorContext);

    const initialColumns = [
        {Header: "ID", accessor: "id"},
        {Header: "Template Name", accessor: "template_name"},
        {Header: "Form Name", accessor: "form_name"},
        {Header: "Assigned To", accessor: "assigned_to"},
        {Header: "Created By", accessor: "created_by"},
        {Header: "Creation Date", accessor: "creation_date"},
        {Header: "Review Date", accessor: "review_date"},
        {Header: "Completion Date", accessor: "completion_date"},
        {Header: "Status", accessor: "status"},
        {Header: "Visibility", accessor: "visibility"},
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetchData(`/api/getVehiclebytype/${selectedComponent}/${ID}`);
                console.log("Data:", response.data);
                setSelectedRow(response.data)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };


        getData();
    }, [selectedComponent, ID]);

    return (
        <div style={{width: "100%", marginLeft: "1rem"}}>
            <Box className={styles.MainContainer} style={{marginTop: "0", border: "1px solid"}}>
                <Box>

                    <Box className={styles.spaceBetween} style={{paddingBottom: "1rem",}}>
                        <Header title={"Form"}/>
                        <MButton
                            sx={{
                                backgroundColor: "blue",
                                "&:hover": {
                                    backgroundColor: "blue", // Replace this with your desired hover color
                                },
                            }}
                            label="Add Form"
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon/>}
                            onClick={() => console.log("test")}
                            size={"small"}
                        />
                    </Box>
                    <AgGridDataTable
                        rows={selectedRow}
                        columns={initialColumns}
                    />
                </Box>
            </Box>
        </div>
    )
}

export default Vehicle_Forms