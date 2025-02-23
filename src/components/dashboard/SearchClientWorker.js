// // DashboardMain.js
// import {
//   Calendar,
//   Clock,
//   FileWarning,
//   LayoutDashboard,
//   Search,
//   Settings,
//   UserCircle,
//   Users,
//   Bell,
//   Plus,
//   MoreVertical,
//   ArrowLeftRight,
//   CalendarClock,
//   X,
// } from "lucide-react";
// import React, { useState } from "react";
// import {Typography,TextField,IconButton} from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";    
// import { fetchData } from "@/utility/api_utility"; // Adjust the path as necessary
// // Import CSS module
// // import styles from "@/styles/SearchClientWorker.module.css";
// import { useRouter } from "next/router";
// function SearchClientWorker() {
//   // Search state variables
//   const [clientSearchTerm, setClientSearchTerm] = useState("");
//   const [clientSearchResults, setClientSearchResults] = useState([]);
//   const [workerSearchTerm, setWorkerSearchTerm] = useState("");
//   const [workerSearchResults, setWorkerSearchResults] = useState([]);
//   const router = useRouter();
//   // Search Clients
//   const handleClientSearch = async (e) => {
//     const searchTerm = e.target.value;
//     setClientSearchTerm(searchTerm);

//     if (searchTerm.length > 1) {
//       try {
//         const response = await fetchData(`/api/searchClients?q=${searchTerm}`);
//         setClientSearchResults(response.data);
//       } catch (error) {
//         console.error("Error searching clients:", error);
//       }
//     } else {
//       setClientSearchResults([]);
//     }
//   };

//   // Search Workers
//   const handleWorkerSearch = async (e) => {
//     const searchTerm = e.target.value;
//     setWorkerSearchTerm(searchTerm);

//     if (searchTerm.length > 1) {
//       try {
//         const response = await fetchData(`/api/searchWorkers?q=${searchTerm}`);
//         setWorkerSearchResults(response.data);
//       } catch (error) {
//         console.error("Error searching workers:", error);
//       }
//     } else {
//       setWorkerSearchResults([]);
//     }
//   };
//   const handleClientRowClick = (client) => {
//     router.push(`/client/profile/update/${client.ClientID}`);
//   };
//   const handleWorkerRowClick = (worker) => {
//     router.push(`/worker/profile/update/${worker.WorkerID}`);
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Client Search */}
//           <div className="glass shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />
//             <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
//               Search Clients
//             </h2>
//             <div className="relative mb-6">
//               <input
//                 type="text"
//                 placeholder="Search clients..."
//                 value={clientSearchTerm}
//               onChange={handleClientSearch}
//                 className="w-full pl-10 pr-4 shadow py-2 rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
//               />
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             </div>
//             {/* Empty State Illustration */}
//             {clientSearchResults.length == 0  && (
//             <div className="flex flex-col items-center justify-center py-8">
//               {/* Abstract Shapes */}
//               <div className="relative w-32 h-32 mb-6">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse" />
//                 <div
//                   className="absolute inset-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-pulse"
//                   style={{ animationDelay: "200ms" }}
//                 />
//                 <div
//                   className="absolute inset-8 bg-gradient-to-bl from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"
//                   style={{ animationDelay: "400ms" }}
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <Users className="h-12 w-12 text-purple-500/50" />
//                 </div>
//               </div>
//               <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
//                 No Clients Found
//               </p>
//               <p className="text-sm text-gray-500 text-center max-w-xs">
//                 Start typing to search through your client database
//               </p>
//             </div>)}
//             {clientSearchResults.length > 0 && (
//               <div >
//                 <DataGrid
//                   rows={clientSearchResults.map((client, index) => ({
//                     id: index,
//                     ...client,
//                   }))}
//                   columns={[
//                     { field: "ClientID", headerName: "Client ID", width: 100 },
//                     {
//                       field: "FirstName",
//                       headerName: "First Name",
//                       width: 150,
//                     },
//                     { field: "LastName", headerName: "Last Name", width: 150 },
//                   ]}
//                   pageSize={3}
//                   onRowClick={(e) => handleClientRowClick(e.row)}
//                   autoHeight
//                 />
//               </div>
//             )}
//             <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-pink-500/0 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

// </div>

//           {/* Worker Search */}
//           <div className="glass shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />
//             <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
//               Search Workers
//             </h2>
//             <div className="relative mb-6">
//               <input
//                 type="text"
//                 placeholder="Search workers..."
//                 value={workerSearchTerm}
//               onChange={handleWorkerSearch}
//                 className="w-full pl-10 pr-4 py-2 shadow rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
//               />
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             </div>
//             {/* Empty State Illustration */}
//             {workerSearchResults.length == 0 && (<div className="flex flex-col items-center justify-center py-8">
//               {/* Abstract Shapes */}
//               <div className="relative w-32 h-32 mb-6">
//                 <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full animate-pulse" />
//                 <div
//                   className="absolute inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse"
//                   style={{ animationDelay: "200ms" }}
//                 />
//                 <div
//                   className="absolute inset-8 bg-gradient-to-bl from-blue-600/20 to-indigo-600/20 rounded-full animate-pulse"
//                   style={{ animationDelay: "400ms" }}
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <UserCircle className="h-12 w-12 text-blue-500/50" />
//                 </div>
//               </div>
//               <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
//                 No Workers Found
//               </p>
//               <p className="text-sm text-gray-500 text-center max-w-xs">
//                 Start typing to search through your worker database
//               </p>
//             </div>
//             )}
//             {workerSearchResults.length > 0 && (
//               <div>
//                 <DataGrid
//                   rows={workerSearchResults.map((worker, index) => ({
//                     id: index,
//                     ...worker,
//                   }))}
//                   columns={[
//                     { field: "WorkerID", headerName: "Worker ID", width: 100 },
//                     {
//                       field: "FirstName",
//                       headerName: "First Name",
//                       width: 150,
//                     },
//                     { field: "LastName", headerName: "Last Name", width: 150 },
//                   ]}
//                   pageSize={3}
//                   onRowClick={(e) => handleWorkerRowClick(e.row)}
//                   autoHeight
//                 />
//               </div>
//             )}
//             <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
//           </div>
//         </div>

//   );
// }

// export default SearchClientWorker;


"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {DataGrid, gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector,} from '@mui/x-data-grid';
import {styled} from '@mui/material/styles';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import {Search, UserCircle, Users,} from 'lucide-react';
import {fetchData} from "@/utility/api_utility";

// Styled DataGrid component with our theme
const StyledDataGrid = styled(DataGrid)(({theme}) => ({
    border: 0,
    backgroundColor: 'transparent',
    fontFamily: 'inherit',

    '& .MuiDataGrid-main': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        borderRadius: '0.75rem',
    },

    // Column headers
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.1)',
        color: 'rgb(139, 92, 246)',
        minHeight: '56px !important',
    },

    '& .MuiDataGrid-columnHeader': {
        '&:focus': {
            outline: 'none',
        },
        '&:focus-within': {
            outline: 'none',
        },
    },

    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
        fontSize: '0.875rem',
    },

    // Column Menu
    '& .MuiDataGrid-menuIcon': {
        color: 'rgb(139, 92, 246)',
        opacity: 1,
        '& .MuiButtonBase-root': {
            color: 'rgb(139, 92, 246)',
        },
    },

    '& .MuiDataGrid-menu': {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(229, 231, 235, 0.3)',
        '& .MuiMenuItem-root': {
            fontSize: '0.875rem',
            color: 'rgb(55, 65, 81)',
            '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
            },
        },
    },

    // Cells
    '& .MuiDataGrid-cell': {
        borderBottom: '1px solid rgba(229, 231, 235, 0.1)',
        color: 'inherit',
        fontSize: '0.875rem',
        '&:focus': {
            outline: 'none',
        },
        '&:focus-within': {
            outline: 'none',
        },
    },

    // Rows
    '& .MuiDataGrid-row': {
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
        },
        cursor: 'pointer',
    },

    // Footer
    '& .MuiDataGrid-footerContainer': {
        backgroundColor: 'rgba(139, 92, 246, 0.00)',
        borderTop: '1px solid rgba(229, 231, 235, 0.0)',
        minHeight: '56px !important',
    },

    // Pagination
    '& .MuiTablePagination-root': {
        color: 'inherit',
    },

    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        color: 'inherit',
        fontSize: '0.875rem',
    },

    '& .MuiTablePagination-select': {
        color: 'inherit',
    },

    // Icons and UI elements
    '& .MuiDataGrid-sortIcon': {
        color: 'rgb(139, 92, 246)',
    },

    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },

    // Filter Panel
    '& .MuiDataGrid-filterPanel': {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(229, 231, 235, 0.3)',
    },

    // Scrollbar
    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
    },

    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
    },

    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
        background: 'rgba(139, 92, 246, 0.3)',
        borderRadius: '4px',
        '&:hover': {
            background: 'rgba(139, 92, 246, 0.5)',
        },
    },

    // No rows overlay
    '& .MuiDataGrid-overlay': {
        backgroundColor: 'transparent',
    },

    // Remove cell borders
    '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader': {
        borderRight: 'none',
    },
}));

// Custom Pagination component
const CustomPagination = () => {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            variant="outlined"
            shape="rounded"
            page={page + 1}
            count={pageCount}
            // @ts-expect-error
            renderItem={(props2) => (
                <PaginationItem
                    {...props2}
                    sx={{
                        color: 'inherit',
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            color: 'rgb(139, 92, 246)',
                            borderColor: 'rgb(139, 92, 246)',
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.05)',
                        },
                    }}
                />
            )}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    );
};

export default function SearchClientWorker() {
    const router = useRouter();
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [workerSearchTerm, setWorkerSearchTerm] = useState("");
    const [workerSearchResults, setWorkerSearchResults] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 5,
        page: 0,
    });

    const handleClientSearch = async (e) => {
        const searchTerm = e.target.value;
        setClientSearchTerm(searchTerm);

        if (searchTerm.length > 1) {
            try {
                const response = await fetchData(`/api/searchClients?q=${searchTerm}`);
                setClientSearchResults(response.data);
            } catch (error) {
                console.error("Error searching clients:", error);
            }
        } else {
            setClientSearchResults([]);
        }
    };

    const handleWorkerSearch = async (e) => {
        const searchTerm = e.target.value;
        setWorkerSearchTerm(searchTerm);

        if (searchTerm.length > 1) {
            try {
                const response = await fetchData(`/api/searchWorkers?q=${searchTerm}`);
                setWorkerSearchResults(response.data);
            } catch (error) {
                console.error("Error searching workers:", error);
            }
        } else {
            setWorkerSearchResults([]);
        }
    };

    const handleClientRowClick = (client) => {
        router.push(`/client/profile/update/${client.ClientID}`);
    };

    const handleWorkerRowClick = (worker) => {
        router.push(`/worker/profile/update/${worker.WorkerID}`);
    };

    const columns = {
        clients: [
            {field: 'ClientID', headerName: 'Client ID', width: 120, filterable: true},
            {field: 'FirstName', headerName: 'First Name', width: 150, filterable: true},
            {field: 'LastName', headerName: 'Last Name', width: 150, filterable: true},
        ],
        workers: [
            {field: 'WorkerID', headerName: 'Worker ID', width: 120, filterable: true},
            {field: 'FirstName', headerName: 'First Name', width: 150, filterable: true},
            {field: 'LastName', headerName: 'Last Name', width: 150, filterable: true},
        ],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Client Search */}
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Search Clients
                </h2>
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearchTerm}
                        onChange={handleClientSearch}
                        className="w-full pl-10 pr-4 shadow py-2 rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                </div>

                {clientSearchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative w-32 h-32 mb-6">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"/>
                            <div
                                className="absolute inset-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full animate-pulse"
                                style={{animationDelay: "200ms"}}/>
                            <div
                                className="absolute inset-8 bg-gradient-to-bl from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"
                                style={{animationDelay: "400ms"}}/>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Users className="h-12 w-12 text-purple-500/50"/>
                            </div>
                        </div>
                        <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            No Clients Found
                        </p>
                        <p className="text-sm text-gray-500 text-center max-w-xs">
                            Start typing to search through your client database
                        </p>
                    </div>
                ) : (
                    <StyledDataGrid
                        rows={clientSearchResults.map((client, index) => ({id: index, ...client}))}
                        columns={columns.clients}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25]}
                        slots={{
                            pagination: CustomPagination,
                        }}
                        onRowClick={(params) => handleClientRowClick(params.row)}
                        disableColumnMenu={false}
                        autoHeight
                    />
                )}
            </div>

            {/* Worker Search */}
            <div
                className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Search Workers
                </h2>
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search workers..."
                        value={workerSearchTerm}
                        onChange={handleWorkerSearch}
                        className="w-full pl-10 pr-4 py-2 shadow rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                </div>

                {workerSearchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative w-32 h-32 mb-6">
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full animate-pulse"/>
                            <div
                                className="absolute inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse"
                                style={{animationDelay: "200ms"}}/>
                            <div
                                className="absolute inset-8 bg-gradient-to-bl from-blue-600/20 to-indigo-600/20 rounded-full animate-pulse"
                                style={{animationDelay: "400ms"}}/>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <UserCircle className="h-12 w-12 text-blue-500/50"/>
                            </div>
                        </div>
                        <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            No Workers Found
                        </p>
                        <p className="text-sm text-gray-500 text-center max-w-xs">
                            Start typing to search through your worker database
                        </p>
                    </div>
                ) : (
                    <StyledDataGrid
                        rows={workerSearchResults.map((worker, index) => ({id: index, ...worker}))}
                        columns={columns.workers}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25]}
                        slots={{
                            pagination: CustomPagination,
                        }}
                        onRowClick={(params) => handleWorkerRowClick(params.row)}
                        disableColumnMenu={false}
                        autoHeight
                    />
                )}
            </div>
        </div>
    );
}