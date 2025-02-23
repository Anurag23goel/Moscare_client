"use client";

import {useEffect, useState} from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import {
    ArrowUpDown,
    BadgeCheck,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Download,
    FileText,
    Filter,
    Mail,
    Phone,
    Plus,
    Search,
    UserCircle
} from 'lucide-react';

// Custom Header Component
const CustomHeader = (props) => {
    const icon = {
        FirstName: UserCircle,
        LastName: UserCircle,
        Email: Mail,
        Phone: Phone,
        ClientType: BadgeCheck,
        Company: Building2,
        Date: Calendar,
        Time: Clock,
        Amount: DollarSign,
        Status: FileText
    }[props.column.colId];

    const Icon = icon || ArrowUpDown;

    return (
        <div className="flex items-center justify-center gap-2 px-2">
            <Icon className="h-4 w-4 text-purple-500"/>
            <span className="font-medium">{props.displayName}</span>
        </div>
    );
};

export default function NewDataTable({
                                         rows = [],
                                         rowSelected = () => {
                                         },
                                         rowSelectionModel,
                                         handleRowSelectionModelChange,
                                         props
                                     }) {
    const [columns, setColumns] = useState([]);
    const [initialColumns, setInitialColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (Array.isArray(rows) && rows.length > 0) {
            const allCols = Object.keys(rows[0]).map((key) => ({
                field: key,
                headerName: key,
                flex: 1,
                minWidth: 150,
                headerComponent: CustomHeader,
                cellStyle: {display: 'flex', justifyContent: 'center'}
            }));

            const initialCols = allCols.slice(0, 5);

            // Move Status column to front if it exists
            allCols.sort((a, b) => {
                if (a.field === "Status") return -1;
                if (b.field === "Status") return 1;
                return 0;
            });

            setColumns(allCols);
            setInitialColumns(initialCols);
        }
    }, [rows]);

    // Grid styles with glassmorphism
    const gridStyle = {
        '--ag-background-color': 'transparent',
        '--ag-foreground-color': 'rgb(55, 65, 81)',
        '--ag-border-color': 'transparent',
        '--ag-header-background-color': 'rgba(139, 92, 246, 0.08)',
        '--ag-header-foreground-color': 'rgb(139, 92, 246)',
        '--ag-header-cell-hover-background-color': 'rgba(139, 92, 246, 0.12)',
        '--ag-font-family': 'inherit',
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
        backdropFilter: 'blur(8px)'
    };

    // Default column definition
    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 130,
        headerComponent: CustomHeader,
        cellStyle: {display: 'flex', justifyContent: 'center'}
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
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
                        className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <Filter className="h-5 w-5 text-gray-600"/>
                    </button>

                    <button
                        className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <Download className="h-5 w-5 text-gray-600"/>
                    </button>

                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                        <Plus className="h-4 w-4"/>
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* AG Grid */}
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">

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
                        rowData={Array.isArray(rows) ? rows.map((row, index) => ({id: index, ...row})) : []}
                        columnDefs={columns.length === 0 ? initialColumns : columns}
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
                        onRowClick={(params) => rowSelected(params.data)}
                        rowSelection="multiple"
                        rowSelectionModel={rowSelectionModel}
                        onRowSelectionModelChange={handleRowSelectionModelChange}
                        suppressCellFocus={true}
                        {...props}
                    />
                </div>
            </div>
        </div>
    );
}