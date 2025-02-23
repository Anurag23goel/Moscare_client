"use client";

import {useState} from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {postData} from '@/utility/api_utility';
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    DollarSign,
    Edit,
    FileText,
    Loader2,
    Save,
    UserCircle,
    X,
    XCircle
} from 'lucide-react';

export default function ActivityList({
                                         startDate,
                                         endDate,
                                         activities,
                                         status,
                                         role,
                                         fetchTimesheetData,
                                         addValidationMessage,
                                     }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [editedKM, setEditedKM] = useState('');
    const [editedHours, setEditedHours] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom Header Component
    const CustomHeader = (props) => {
        const icon = {
            ShiftId: FileText,
            Worker: UserCircle,
            ShiftStartDate: Calendar,
            ShiftEndDate: Calendar,
            Hours: Clock,
            Km: DollarSign,
        }[props.column.colId];

        const Icon = icon || ChevronDown;

        return (
            <div className="flex items-center justify-center gap-2 px-2">
                <Icon className="h-4 w-4 text-purple-500"/>
                <span className="font-medium">{props.displayName}</span>
            </div>
        );
    };

    const columnDefs = [
        {
            field: 'ShiftId',
            headerName: 'Shift ID',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'Worker',
            headerName: 'Worker',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ClientId',
            headerName: 'Client ID',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ShiftStartDate',
            headerName: 'Start Date',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ShiftEndDate',
            headerName: 'End Date',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ServiceCode',
            headerName: 'Service Code',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ServiceDescription',
            headerName: 'Service',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'Hours',
            headerName: 'Hours',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'Km',
            headerName: 'KM',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'PayRate',
            headerName: 'Pay Rate',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            field: 'ChargeRate',
            headerName: 'Charge Rate',
            headerComponent: CustomHeader,
            cellStyle: {display: 'flex', justifyContent: 'center'}
        },
        {
            headerName: 'Actions',
            width: 120,
            cellRenderer: params => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleRowSelected(params.data)}
                        className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                    >
                        <Edit className="h-4 w-4"/>
                    </button>
                </div>
            ),
            suppressMenu: true,
            sortable: false,
            filter: false
        }
    ];

    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 130,
        headerClass: 'ag-header-center',
    };

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
        '--ag-border-radius': '1rem',
    };

    // Keep all existing handler functions
    const handleRowSelected = (rowData) => {
        setCurrentItem(rowData);
        setRemarks('');
        setEditedKM(rowData.Km);
        setEditedHours(rowData.Hours);
        setOpenDialog(true);
    };

    const handleApprove = async () => {
        if (!currentItem) return;
        setIsSubmitting(true);

        const endpoint = role === 'Team Lead' ? '/api/approveTimesheetByTl' : '/api/approveTimesheetByRm';

        try {
            const response = await postData(endpoint, {
                ShiftId: currentItem.ShiftId,
                TsId: currentItem.TsId,
            });

            if (response.success) {
                await fetchTimesheetData();
                addValidationMessage('Timesheet approved successfully.', 'success');
                setOpenDialog(false);
            } else {
                addValidationMessage(response.message || 'Failed to approve timesheet.', 'error');
            }
        } catch (error) {
            addValidationMessage('An error occurred while approving the timesheet.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!currentItem || !remarks.trim()) {
            addValidationMessage('Please provide rejection remarks.', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await postData('/api/rejectTimesheetByRm', {
                ShiftId: currentItem.ShiftId,
                TsId: currentItem.TsId,
                rejectionRemarksRm: remarks,
            });

            if (response.success) {
                await fetchTimesheetData();
                addValidationMessage('Timesheet rejected successfully.', 'success');
                setOpenDialog(false);
            } else {
                addValidationMessage(response.message || 'Failed to reject timesheet.', 'error');
            }
        } catch (error) {
            addValidationMessage('An error occurred while rejecting the timesheet.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveEdits = async () => {
        if (!currentItem || editedKM === '' || editedHours === '') {
            addValidationMessage('Kilometers and Hours Worked cannot be empty.', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await postData('/api/updateTimesheetDetail', {
                ShiftId: currentItem.ShiftId,
                TsId: currentItem.TsId,
                Km: parseFloat(editedKM),
                Hours: parseFloat(editedHours),
                Role: role,
            });

            if (response.success) {
                await fetchTimesheetData();
                addValidationMessage('Timesheet details updated successfully.', 'success');
                setOpenDialog(false);
            } else {
                addValidationMessage(response.message || 'Failed to update timesheet details.', 'error');
            }
        } catch (error) {
            addValidationMessage('An error occurred while updating the timesheet details.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Grid */}
            <div className="ag-theme-alpine w-full" style={gridStyle}>
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
                    rowData={activities}
                    columnDefs={columnDefs}
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
                        '<div class="flex flex-col items-center justify-center p-8 text-gray-500"><span>No timesheets found</span></div>'
                    }
                    domLayout="autoHeight"
                />
            </div>

            {/* Details Modal */}
            {openDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                         onClick={() => setOpenDialog(false)}/>

                    <div
                        className="relative w-full max-w-2xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Timesheet Details
                                </h2>
                                <button
                                    onClick={() => setOpenDialog(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500"/>
                                </button>
                            </div>

                            {currentItem && (
                                <div className="space-y-6">
                                    {/* Worker Info */}
                                    <div
                                        className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-500 mb-1">Worker</label>
                                                <p className="text-gray-900">{currentItem.Worker}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Client
                                                    ID</label>
                                                <p className="text-gray-900">
                                                    {currentItem.ClientId === 0 ? 'Location Roster Shift' : currentItem.ClientId}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">Start
                                                    Date</label>
                                                <p className="text-gray-900">{currentItem.ShiftStartDate}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">End
                                                    Date</label>
                                                <p className="text-gray-900">{currentItem.ShiftEndDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Editable Fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Kilometers (KM)
                                            </label>
                                            <input
                                                type="number"
                                                value={editedKM}
                                                onChange={(e) => setEditedKM(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Hours Worked
                                            </label>
                                            <input
                                                type="number"
                                                value={editedHours}
                                                onChange={(e) => setEditedHours(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            />
                                        </div>

                                        {role === 'Rostering Manager' && (
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Rejection Remarks
                                                </label>
                                                <textarea
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    placeholder="Enter rejection remarks..."
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div
                                        className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                        <button
                                            onClick={() => setOpenDialog(false)}
                                            className="px-4 py-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleSaveEdits}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4"/>
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>

                                        {(role === 'Team Lead' || role === 'Rostering Manager') && (
                                            <button
                                                onClick={handleApprove}
                                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                        <span>Approving...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4"/>
                                                        <span>Approve</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {role === 'Rostering Manager' && (
                                            <button
                                                onClick={handleReject}
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                        <span>Rejecting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4"/>
                                                        <span>Reject</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}