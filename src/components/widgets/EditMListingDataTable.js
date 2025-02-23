import React, {useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import {Box, Button} from "@mui/material";
import styles from "@/styles/style.module.css";

const EditMListingDataTable = ({
                                   getRowClassName,
                                   rows,
                                   rowSelected,
                                   onMarkAsRead,
                                   readRows,
                                   props,
                               }) => {
    const [columns, setColumns] = useState([]);
    const [initialColumns, setInitialColumns] = useState([]);

    useEffect(() => {
        if (Array.isArray(rows) && rows.length > 0) {
            // Specify the columns you want to show
            const columnsToShow = [
                "Priority",
                "TimeAndDate",
                "Category",
                "Subject",
                "Notes",
                "CreatedBy",
                "Read",
                "AssignedTo",
                "Collaborators"
            ];

            const allCols = Object.keys(rows[0])
                .filter((key) => columnsToShow.includes(key))
                .map((key) => ({
                    field: key,
                    headerName: key,
                    width: 150, // Adjust width for readability
                    editable: true,
                    headerClassName: styles.header,
                }));

            // Add 'Edit' and 'Mark as Read' columns
            const actionCols = [
                {
                    field: "markAsRead",
                    headerName: "Action",
                    width: 150,
                    renderCell: (params) =>
                        params.row.Status === "Y" ? (
                            <span>Already Read</span>
                        ) : (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => onMarkAsRead(params.row.ID)}
                            >
                                Mark as Read
                            </Button>
                        ),
                },
            ];

            allCols.sort((a, b) => {
                if (a.field === "Status") return -1;
                if (b.field === "Status") return 1;
                return 0;
            });

            setColumns([...allCols, ...actionCols]);
            setInitialColumns(allCols.slice(0, 5));
        }
    }, [rows, readRows]);


    const handleMarkAsReadClick = (row) => {
        console.log("Mark as Read clicked for row:", row);
        // Add your mark as read logic here
    };

    return (
        <div>
            <Box
                sx={{
                    height: "100vh",
                    minHeight: "400px",
                    width: "100%",
                    maxHeight: "500px",
                }}
            >
                <DataGrid
                    className={styles.data_table}
                    style={{
                        cursor: "pointer",
                    }}
                    getRowClassName={getRowClassName}
                    rows={
                        Array.isArray(rows)
                            ? rows.map((row, index) => ({id: index, ...row}))
                            : []
                    }
                    columns={columns.length === 0 ? initialColumns : columns}
                    pageSize={5}
                    rowsPerPageOptions={[10]}
                    onRowClick={(row) => rowSelected(row.row)}
                    isCellEditable={(params) => false}
                    onCellClick={(params) => false}
                    disableMultipleRowSelection={true}
                    showCellVerticalBorder={true}
                    scrollbarSize={1}
                    {...props}
                />
            </Box>
        </div>
    );
};

export default EditMListingDataTable;
