import React, {useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import {Box, Button} from "@mui/material";
import styles from "@/styles/style.module.css";

const EditBulkMListingDataTable = ({
                                       getRowClassName,
                                       rows,
                                       rowSelected,
                                       props,
                                       Router,
                                       Type,
                                   }) => {
    const [columns, setColumns] = useState([]);
    const [initialColumns, setInitialColumns] = useState([]);

    useEffect(() => {
        if (Array.isArray(rows) && rows.length > 0) {
            const allCols = Object.keys(rows[0]).map((key) => ({
                field: key,
                headerName: key,
                width: 200, // Increased width for better readability
                editable: true,
                headerClassName: styles.header,
            }));

            // Add 'Edit' and 'Mark as Read' columns
            const actionCols = [
                {
                    field: "View",
                    headerName: "View",
                    width: 150,
                    renderCell: (params) => (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleViewClick(params.row)}
                        >
                            View
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
    }, [rows]);

    const handleViewClick = (row) => {
        if (Type == "client") {
            Router.push(`/client/profile/update/${row.ClientID}`);
        } else {
            Router.push(`/worker/profile/update/${row.WorkerID}`);
        }
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

export default EditBulkMListingDataTable;
