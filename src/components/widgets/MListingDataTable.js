"use client";

import {useEffect, useState} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {BadgeCheck, ChevronDown, Edit, Mail, Phone, UserCircle} from 'lucide-react';

const DataGridComponent = ({getRowClassName, rows, rowSelected, notShowEditButton, props}) => {
    const [columns, setColumns] = useState([]);
    const [initialColumns, setInitialColumns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Custom Header Component
    const CustomHeader = (props) => {
        const icon = {
            FirstName: UserCircle,
            LastName: UserCircle,
            Email: Mail,
            Phone: Phone,
            Department: BadgeCheck,
        }[props?.column?.colId];

        const Icon = icon || ChevronDown;

        return (
            <div className="flex items-center justify-center gap-2 px-2">
                <Icon className="h-4 w-4 text-purple-500"/>
                <span className="font-medium text-gray-700">{props.colDef.headerName}</span>
            </div>
        );
    };

    useEffect(() => {
        if (Array.isArray(rows) && rows.length > 0) {
            const allCols = Object.keys(rows[0]).map((key) => ({
                field: key,
                headerName: key.replace(/_/g, " "),
                width: 150,
                editable: false,
                headerClassName: 'datagrid-header',
                renderHeader: CustomHeader,
                align: 'center',
                headerAlign: 'center',
            }));

            if (!notShowEditButton) {
                allCols.push({
                    field: 'action',
                    headerName: 'Action',
                    width: 120,
                    sortable: false,
                    filterable: false,
                    align: 'center',
                    headerAlign: 'center',
                    renderCell: (params) => (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    rowSelected(params.row);
                                }}
                                className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                            >
                                <Edit className="h-4 w-4"/>
                            </button>
                        </div>
                    ),
                });
            }

            const initialCols = allCols.slice(0, 5);
            setColumns(allCols);
            setInitialColumns(initialCols);
        }
    }, [rows, notShowEditButton, rowSelected]);

    return (
        <div>
            
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>

                <div style={{height: 500, width: '100%'}}>
                    <style>{`
            .ag-theme-alpine {
              --ag-font-family: inherit;
              --ag-font-size: 0.875rem;
            }
            .ag-header-cell {
              background-color: #F3F4F6 !important;
            }
            .ag-row {
              border-bottom: none !important;
            }
            .ag-row-hover {
              background-color: rgba(139, 92, 246, 0.04) !important;
            }
          `}</style>
                    <DataGrid
                        rows={Array.isArray(rows) ? rows.map((row, index) => ({id: index, ...row})) : []}
                        columns={columns.length === 0 ? initialColumns : columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        onRowClick={(params) => rowSelected(params.row)}
                        disableMultipleRowSelection={false}
                        hideFooterSelectedRowCount
                        getRowClassName={getRowClassName}
                        {...props}
                        sx={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit',

                            // Cell styling
                            '& .MuiDataGrid-cell': {
                                border: 'none',
                                color: 'rgb(75, 85, 99)',
                                fontSize: '0.875rem',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            },

                            // Row styling
                            '& .MuiDataGrid-row': {
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(139, 92, 246, 0.04)',
                                },
                            },

                            // Header styling
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#F3F4F6',
                                borderBottom: 'none',
                                minHeight: '48px !important',
                                fontFamily: 'inherit',
                            },

                            '& .MuiDataGrid-columnHeader': {
                                padding: '0',
                                '&:focus': {
                                    outline: 'none',
                                },
                                '&:focus-within': {
                                    outline: 'none',
                                },
                            },

                            // Remove separators
                            '& .MuiDataGrid-columnSeparator': {
                                display: 'none',
                            },

                            // Footer styling
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid rgba(229, 231, 235, 0.3)',
                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                            },

                            // Pagination styling
                            '& .MuiTablePagination-root': {
                                color: 'rgb(107, 114, 128)',
                                fontFamily: 'inherit',
                            },

                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                color: 'inherit',
                                fontFamily: 'inherit',
                            },

                            '& .MuiTablePagination-select': {
                                color: 'inherit',
                                fontFamily: 'inherit',
                            },

                            // Pagination buttons
                            '& .MuiButtonBase-root': {
                                color: 'rgb(139, 92, 246)',
                                fontFamily: 'inherit',
                                '&.Mui-disabled': {
                                    color: 'rgba(139, 92, 246, 0.3)',
                                },
                            },

                            // Scrollbars
                            '& ::-webkit-scrollbar': {
                                width: '8px',
                                height: '8px',
                            },
                            '& ::-webkit-scrollbar-track': {
                                background: 'rgba(0, 0, 0, 0.1)',
                                borderRadius: '4px',
                            },
                            '& ::-webkit-scrollbar-thumb': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                borderRadius: '4px',
                                '&:hover': {
                                    background: 'rgba(139, 92, 246, 0.5)',
                                },
                            },

                            // Selection styling
                            '& .MuiDataGrid-cell.Mui-selected': {
                                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            },
                            '& .MuiDataGrid-cell.Mui-selected:hover': {
                                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                            },

                            // Sort icon
                            '& .MuiDataGrid-sortIcon': {
                                color: 'rgb(139, 92, 246)',
                            },

                            // Column menu
                            '& .MuiMenu-paper': {
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(229, 231, 235, 0.3)',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontFamily: 'inherit',
                            },

                            // Empty state
                            '& .MuiDataGrid-overlay': {
                                backgroundColor: 'transparent',
                                color: 'rgb(107, 114, 128)',
                                fontFamily: 'inherit',
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DataGridComponent;