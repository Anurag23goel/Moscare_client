import React, {useEffect, useMemo, useState} from "react";
// import dynamic from "next/dynamic";
import {AgGridReact} from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import {Button, Checkbox, FormControlLabel, IconButton, Popover, TextField, Tooltip,} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDatabase, faFileExcel} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import styles from "../../styles/MListingDataTable.module.css";
import {Modal} from "react-bootstrap";
// import TimeSheetMap from "../widgets/TimeSheetMap"
import {useRouter} from "next/router";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const AgGridDataTable = ({
                             rows = [],
                             columns: initialColumns = [],
                             rowSelected = () => {
                             },
                             showActionColumn = true,
                             showUploadColumn = false,
                             onUpload = (file, data) => {
                             },
                             getRowStyle = () => {
                             }, // Accept a function for row style
                             isExtraButton,
                             isLocationRoster = false,
                             handleViewClick,
                             isAgreementTable,
                             rowSelectionModel,
                             showEditButton = true,
                             rowSelection,
                             isDataExportAudit = false,
                         }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [columns, setColumns] = useState([]);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);
    const router = useRouter();
    // const {colors} = useContext(ColorContext);
    // Set the columns when initialColumns prop changes
    useEffect(() => {
        if (initialColumns && initialColumns.length > 0) {
            setColumns(
                initialColumns.map((col) => ({...col, hide: false})) // Initialize with all columns visible
            );
        }
    }, [initialColumns]);

    // Default column definitions for the grid
    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 130,
        }),
        []
    );


    // Toggle visibility for individual columns
    const toggleColumnVisibility = (field) => {
        setColumns((prevColumns) =>
            prevColumns.map((col) =>
                col.accessor === field ? {...col, hide: !col.hide} : col
            )
        );
    };

    // Filter columns based on search term
    const filteredColumns = columns.filter(
        (col) =>
            col.Header && col.Header.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowMap = (data) => {
        // console.log(json.parse(data.position))
        setSelectedRow(data);
        setIsMapModalOpen(true);
    };

    // Close the modal
    const handleCloseMap = () => {
        setIsMapModalOpen(false);
        setSelectedRow(null);
    };

    const actionCellRenderer = (params) => (
        <div style={{width: "500px",}} className="action-cell">
            {(isLocationRoster || isDataExportAudit) && (
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        fontSize: "12px",
                        padding: "3px 4px",
                        textTransform: "none",
                        backgroundColor: "blue", // Apply custom color
                        color: "#fff", // Adjust text color as needed
                        "&:hover": {
                            backgroundColor: "blue", // Define a hover color if desired
                        },
                    }}
                    onClick={() => {
                        if (isLocationRoster) {
                            handleViewClick(params.data);
                        }
                        rowSelected(params.data);
                    }}

                    endIcon={<VisibilityIcon fontSize="small"/>}
                >
                    View
                </Button>
            )}

            {/* Conditionally show the Edit button (if not isLocationRoster) */}
            {showEditButton && !isLocationRoster && !isDataExportAudit && (
                <Button
                    color="primary"
                    size="large"
                    onClick={() => rowSelected(params.data)}
                    className="agGridEditButton"
                    endIcon={
                        <BorderColorOutlinedIcon className="endicon" fontSize="small"/>
                    }
                >
                    Edit
                </Button>
            )}

            {/* Conditionally show the Show Map button */}
            {isExtraButton && (
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleShowMap(params.data)}
                    className="agGridEditButton"
                    style={{marginTop: "5px"}}
                    endIcon={<VisibilityIcon className="endicon" fontSize="small"/>}
                >
                    Show Map
                </Button>
            )}
        </div>
    );

    // Upload cell renderer (Upload button)
    const uploadCellRenderer = (params) => {
        const fileInputRef = React.useRef(null);

        const handleFileChange = (event) => {
            const file = event.target.files[0];
            if (file) {
                onUpload(file, params.data);
            }
        };

        const handleButtonClick = () => {
            // Programmatically click the hidden file input
            fileInputRef.current.click();
        };

        return (
            <div style={{}}>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: "none"}}
                    onChange={handleFileChange}
                />
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleButtonClick}
                    className='agGridEditButton'
                    style={{fontSize: "12px", padding: "1px 4px", textTransform: "none", marginTop: "1.2rem"}}
                    endIcon={<UploadFileIcon className="endicon" fontSize="small"/>}
                >
                    Upload
                </Button>
            </div>
        );
    };

    // Build the grid columns, conditionally including the action and upload columns
    const gridColumns = useMemo(() => {
        const baseColumns = columns.map((col) => ({
            field: col.accessor || col.field,
            headerName: col.Header || col.headerName,
            hide: col.hide,
        }));

        const actionColumns = [];

        if (showActionColumn && showEditButton) {
            actionColumns.push({
                headerName: "Action",
                cellRenderer: actionCellRenderer,
                pinned: "right",
                width: 90,
                sortable: false,
                filter: false,
                resizable: false,
                suppressMenu: true,
                suppressMovable: true,
                suppressResize: true,
            });
        }

        if (showUploadColumn) {
            actionColumns.push({
                headerName: "Upload",
                cellRenderer: uploadCellRenderer,
                pinned: "right",
                width: 90,
                sortable: false,
                filter: false,
                resizable: false,
                suppressMenu: true,
                suppressMovable: true,
                suppressResize: true,
            });
        }

        return [...baseColumns, ...actionColumns];
    }, [columns, showActionColumn, showUploadColumn]);

    // Export grid data to Excel
    const handleExport = () => {
        if (!rows || rows.length === 0) {
            console.error("No data available for export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GridData");
        XLSX.writeFile(workbook, "grid_data.xlsx");
    };

    // Apply row styles based on the getRowStyle function passed down
    const applyRowStyle = (params) => {
        const customRowStyle = getRowStyle(params);
        return customRowStyle ? customRowStyle : null;
    };

    // Handle the opening of the column chooser popover
    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle the closing of the popover
    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? "column-chooser-popover" : undefined;

    // Custom styles for the grid
    const gridStyle = useMemo(
        () => ({
            // Remove hover and other styles
            "--ag-row-hover-color": "transparent",
            "--ag-selected-row-background-color": "#e6e6e6",
            "--ag-header-background-color": "#D3D3D3", // Light grey header
            "--ag-header-foreground-color": "#000", // Black text
            "--ag-row-border-color": "#ccc",
        }),
        []
    );

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginRight: "12px",
                }}
            >
                {/* Export to Excel Icon Button */}
                <Tooltip title="Export to Excel">
                    <IconButton onClick={handleExport}>
                        <div
                            style={{
                                border: "1px solid #ccc",
                                padding: "0px 10px",
                                borderRadius: "5px",
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faFileExcel}
                                style={{color: "green", fontSize: 20}}
                            />
                        </div>
                    </IconButton>
                </Tooltip>

                {/* Column Chooser Icon Button */}
                <Tooltip title="Choose Columns">
                    <IconButton
                        onClick={handleOpenPopover}
                        className={styles.columnChooserButton}
                    >
                        <div
                            style={{
                                border: "1px solid #ccc",
                                padding: "0px 10px",
                                borderRadius: "5px",
                            }}
                        >
                            <FontAwesomeIcon icon={faDatabase} style={{fontSize: 20}}/>
                        </div>
                    </IconButton>
                </Tooltip>

                {/* Popover for Column Chooser */}
                <Popover
                    id={popoverId}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClosePopover}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    PaperProps={{
                        style: {maxHeight: "200px", width: "200px", padding: "10px"},
                    }}
                >
                    {/* Search Bar */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        style={{marginBottom: "10px", fontWeight: "bold"}}
                    />
                    {/* List of columns with checkboxes */}
                    {filteredColumns.map((col) => (
                        <FormControlLabel
                            key={col.accessor}
                            control={
                                <Checkbox
                                    checked={!col.hide}
                                    onChange={() => toggleColumnVisibility(col.accessor)}
                                />
                            }
                            label={col.Header}
                            style={{fontSize: "12px"}}
                        />
                    ))}
                </Popover>
            </div>

            <div>
                {/* AG Grid Component with "ag-theme-material" */}
                <div
                    className="ag-theme-material"
                    style={{
                        height: "500px",
                        width: "100%",
                        padding: "5px",
                        fontFamily: "Metropolis",
                        ...gridStyle, // Apply custom styles
                    }}
                >
                    <AgGridReact
                        className={styles.fontFamily}
                        rowData={rows}
                        columnDefs={gridColumns}
                        defaultColDef={defaultColDef}
                        getRowStyle={applyRowStyle}
                        pagination={true}
                        paginationPageSize={20}
                        suppressRowHoverHighlight={true}
                        headerHeight={55}
                        rowHeight={50}
                        fontWeight={700}
                        rowSelection={isAgreementTable ? "multiple" : null}
                        rowSelectionModel={isAgreementTable ? rowSelectionModel : []}
                    />
                </div>

                {/* Modal for TimeSheetMap */}
                <Modal show={isMapModalOpen} onHide={handleCloseMap}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            // width: "50%",
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            divShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        {/* {selectedRow && (
            <TimeSheetMap
            workerLat={24.6047874}
            workerLon={73.7674401}
            timestamp={"2024-11-20T12:34:56Z"}
            distance={2.5}
            />
          )} */}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AgGridDataTable;
