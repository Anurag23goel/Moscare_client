import React, {useEffect, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import {Box} from "@mui/material";
import styles from "@/styles/style.module.css";

const MListingDataTable = ({getRowClassName, rows, rowSelected, props}) => {
    const [columns, setColumns] = useState([]);
    const [initialColumns, setInitialColumns] = useState([]);

    useEffect(() => {
        if (Array.isArray(rows) && rows.length > 0) {
            const allCols = Object.keys(rows[0]).map((key) => ({
                field: key,
                headerName: key,
                width: 121.4,
                editable: true,
                headerClassName: styles.header,
            }));

            const initialCols = allCols.slice(0, 5);

            // Move 'Status' column to the front
            allCols.sort((a, b) => {
                if (a.field === "Status") return -1;
                if (b.field === "Status") return 1;
                return 0;
            });

            setColumns(allCols);
            setInitialColumns(initialCols);
        }
    }, [rows]);

    return (
        <div>
            <Box sx={{height: "100vh", minHeight: '400px', width: "100%", maxHeight: "500px"}}>
                <DataGrid
                    className={styles.data_table}
                    style={{
                        cursor: "pointer"
                    }}
                    getRowClassName={getRowClassName}
                    rows={Array.isArray(rows) ? rows.map((row, index) => ({id: index, ...row})) : []}
                    columns={columns.length === 0 ? initialColumns : columns}
                    pageSize={5}
                    rowsPerPageOptions={[10]}
                    onRowClick={(row) => rowSelected(row.row)}
                    isCellEditable={(params) => true}
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

export default MListingDataTable;
