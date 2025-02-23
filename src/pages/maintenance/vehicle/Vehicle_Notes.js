import AgGridDataTable from '@/components/widgets/AgGridDataTable'
import {Box} from '@mui/material'
import styles from "@/styles/style.module.css";
import React, {useContext, useEffect, useState} from 'react'
import {fetchData} from '@/utility/api_utility';
import MButton from '@/components/widgets/MaterialButton';
import ColorContext from '@/contexts/ColorContext';
import Header from '@/components/widgets/Header';

const Vehicle_Notes = ({selectedComponent, ID}) => {
    const [selectedRow, setSelectedRow] = useState([]);
    // const {colors} = useContext(ColorContext);

    const initialColumns = [
        {Header: "ID", accessor: "id"},
        {Header: "priority", accessor: "priority"},
        {Header: "Category", accessor: "category"},
        {Header: "Note", accessor: "note"},
        {Header: "Created On", accessor: "created_on"},
        {Header: "Note Date", accessor: "note_date"},
        {Header: "Remind Date", accessor: "remind_date"},
        {Header: "Closed Date", accessor: "closed_date"},
        {Header: "Created By", accessor: "created_by"},
        {Header: "Assigned To", accessor: "assigned_to"},
        {Header: "Read By", accessor: "read_by"},
        {Header: "Complete", accessor: "complete"},
        {Header: "Read By", accessor: "read_by"},

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
                    {/* <Button varient = "contained">New Form</Button> */}
                    <Box className={styles.spaceBetween} style={{paddingBottom: "1rem",}}>
                        <Header title={"Notes"}/>
                        <MButton
                            sx={{

                                backgroundColor: "blue",
                                "&:hover": {
                                    backgroundColor: "blue", // Replace this with your desired hover color
                                },
                            }}
                            label="Add Notes"
                            variant="contained"
                            color="primary"
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

export default Vehicle_Notes