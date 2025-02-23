"use client";

import {useEffect, useMemo, useState} from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {Columns, FileSpreadsheet, Search, X} from 'lucide-react';
import * as XLSX from 'xlsx';

const CustomAgGridDataTable = ({
                                   title,
                                   subtitle,
                                   primaryButton,
                                   secondaryButton,
                                   rows = [],
                                   columns: initialColumns = [],
                                   rowSelected = () => {
                                   },
                                   showActionColumn = true,
                                   showUploadColumn = false,
                                   onUpload = () => {
                                   },
                                   getRowStyle = () => {
                                   },
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
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Grid styles
    const gridStyle = {
        '--ag-background-color': 'transparent',
        '--ag-foreground-color': 'rgb(55, 65, 81)',
        '--ag-border-color': 'transparent',
        '--ag-header-background-color': 'rgba(139, 92, 246, 0.08)',
        '--ag-header-foreground-color': 'rgb(139, 92, 246)',
        '--ag-header-cell-hover-background-color': 'rgba(139, 92, 246, 0.12)',
        '--ag-font-family': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '--ag-font-size': '0.875rem',
        '--ag-row-hover-color': 'rgba(139, 92, 246, 0.04)',
        '--ag-selected-row-background-color': 'rgba(139, 92, 246, 0.08)',
        '--ag-odd-row-background-color': 'rgba(139, 92, 246, 0.02)',
        '--ag-row-border-color': 'rgba(229, 231, 235, 0.3)',
        '--ag-borders': 'none',
        '--ag-cell-horizontal-border': 'none',
        '--ag-row-border-style': 'solid',
        '--ag-row-border-width': '1px',
        '--ag-border-radius': '1rem',
        // backdropFilter: 'blur(8px)',
        '--ag-paging-panel-height': '60px',
        '--ag-paging-button-width': '32px',
        '--ag-paging-button-height': '32px',
        '--ag-scrollbar-background': 'rgba(0, 0, 0, 0.1)',
        '--ag-scrollbar-thumb-color': 'rgba(139, 92, 246, 0.3)',
    };

    // Set initial columns
    useEffect(() => {
        if (initialColumns?.length > 0) {
            setColumns(initialColumns.map(col => ({...col, hide: false})));
        }
    }, [initialColumns]);

    // Column definitions
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 130,
    }), []);

    // Export to Excel
    const handleExport = () => {
        if (!rows?.length) return;
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GridData");
        XLSX.writeFile(workbook, "grid_data.xlsx");
    };

    // Toggle column visibility
    const toggleColumnVisibility = (field) => {
        setColumns(prevColumns =>
            prevColumns.map(col =>
                col.accessor === field ? {...col, hide: !col.hide} : col
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Card Header */}
            <div className="">

                {/* Title Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {secondaryButton && (
                            <button
                                onClick={secondaryButton.onClick}
                                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                {secondaryButton.icon}
                                <span>{secondaryButton.label}</span>
                            </button>
                        )}

                        {primaryButton && (
                            <button
                                onClick={primaryButton.onClick}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                            >
                                {primaryButton.icon}
                                <span>{primaryButton.label}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Controls */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <FileSpreadsheet className="h-4 w-4"/>
                            <span>Export to Excel</span>
                        </button>

                        <button
                            onClick={() => setShowColumnSelector(true)}
                            className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <Columns className="h-4 w-4"/>
                            <span>Select Columns</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* AG Grid */}
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                <div className="ag-theme-alpine" style={gridStyle}>
                    <style>{`
            .ag-header-center {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .ag-header-cell-label {
              justify-content: center;
            }
            .ag-root ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .ag-root ::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 4px;
            }
            .ag-root ::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.3);
              border-radius: 4px;
            }
            .ag-root ::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.5);
            }
            .ag-row {
              transition: background-color 0.2s ease;
            }
            .ag-row:hover {
              background-color: rgba(139, 92, 246, 0.04) !important;
            }
          `}</style>

                    <AgGridReact
                        rowData={rows}
                        columnDefs={columns}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        rowHeight={60}
                        headerHeight={48}
                        animateRows={true}
                        enableCellTextSelection={true}
                        suppressMovableColumns={false}
                        rowClass="hover:bg-purple-50/50 transition-colors"
                        overlayNoRowsTemplate={
                            '<div class="flex flex-col items-center justify-center p-8 text-gray-500"><span>No data found</span></div>'
                        }
                        domLayout="autoHeight"
                    />
                </div>
            </div>

            {/* Column Selector Modal */}
            {showColumnSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                         onClick={() => setShowColumnSelector(false)}/>

                    <div
                        className="relative w-full max-w-md mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Select Columns
                                </h2>
                                <button
                                    onClick={() => setShowColumnSelector(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500"/>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {columns.map((col) => (
                                    <label
                                        key={col.accessor}
                                        className="flex items-center p-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!col.hide}
                                            onChange={() => toggleColumnVisibility(col.accessor)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {col.Header}
                    </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomAgGridDataTable;