import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchData, postData } from "@/utility/api_utility";
import { useRouter } from "next/router";
import style from "@/styles/style.module.css";
import { Button } from "react-bootstrap";
import { Avatar } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-material.css";
import * as XLSX from "xlsx";

import { themeAlpine, themeBalham, themeQuartz } from "ag-grid-community";

import {
  BadgeCheck,
  Edit,
  FileSpreadsheet,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Star,
  UserCircle,
} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const AvatarComp = (a) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        height: "100%", // Ensures it takes the full height of the cell
      }}
    >
      <Avatar
        alt="Remy Sharp"
        src={a.value}
        sx={{
          width: 30,
          height: 30,
        }}
      />
    </div>
  );
};

const ClientProfile = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]); // To store selected columns
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  // const {colors} = useContext(ColorContext);
  const cacheRef = useRef({});

  const themes = [
    { id: "themeQuartz", theme: themeQuartz },
    { id: "themeBalham", theme: themeBalham },
    { id: "themeAlpine", theme: themeAlpine },
  ];

  const [theme, setBaseTheme] = useState(themes[0]);
  const router = useRouter();
  const open = Boolean(anchorEl);
  // Define the columns to display
  const aggridColumns = [
    {
      field: "UserProfile",
      HeaderName: "Client Profile",
      cellRenderer: AvatarComp,
    },
    { accessor: "FirstName", Header: "First Name" },
    { accessor: "LastName", Header: "Last Name" },
    { accessor: "Email", Header: "Email" },
    { accessor: "Phone", Header: "Phone" },
    { accessor: "ClientType", Header: "Client Type" },
  ];
  const popoverId = open ? "column-chooser-popover" : undefined;

  const rowSelected = (params) => {
    console.log(params);
  };
  const actionCellRenderer = (params) => (
    <div style={{ width: "500px" }}>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => handleRowSelect(params.data)}
        style={{
          fontSize: "12px",
          padding: "2px 20px",
          textTransform: "none",
          color: "white",
          backgroundColor: "blue",
        }}
      >
        Edit
      </Button>
    </div>
  );

  // Toggle visibility for individual columns
  const toggleColumnVisibility = (field) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.accessor === field ? { ...col, hide: !col.hide } : col
      )
    );
  };

  // Export grid data to Excel
  const handleExport = useCallback(() => {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "clients.xlsx");
  }, [data]);

  const CustomHeader = (props) => {
    const icon = {
      FirstName: UserCircle,
      LastName: UserCircle,
      Email: Mail,
      Phone: Phone,
      ClientType: BadgeCheck,
    }[props.column.colId];

    // const Icon = icon || ChevronDown;

    return (
      <div className="flex items-center justify-center gap-2 px-2">
        {/* <Icon className="h-4 w-4 text-purple-500" /> */}
        <span className="font-medium">{props.displayName}</span>
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "UserProfile",
        headerName: "Profile",
        cellRenderer: AvatarComp,
        width: 100,
        headerComponent: CustomHeader,
        suppressMenu: true,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "FirstName",
        headerName: "First Name",
        headerComponent: CustomHeader,
        sortable: true,
        filter: true,
        suppressMenu: true,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "LastName",
        headerName: "Last Name",
        headerComponent: CustomHeader,
        suppressMenu: false,
        sortable: true,
        filter: true,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "Email",
        headerName: "Email",
        headerComponent: CustomHeader,
        suppressMenu: false,
        sortable: true,
        filter: true,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "Phone",
        headerName: "Phone",
        headerComponent: CustomHeader,
        suppressMenu: false,
        sortable: true,
        filter: true,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "ClientType",
        headerName: "Client Type",
        headerComponent: CustomHeader,
        suppressMenu: false,
        sortable: true,
        filter: true,
        cellStyle: { display: "flex", justifyContent: "center" },
        cellRenderer: (params) => (
          <div className="flex items-center justify-center gap-2">
            {params.value === "Premium" ? (
              <Star className="h-4 w-4 text-amber-500" />
            ) : (
              <BadgeCheck className="h-4 w-4 text-purple-500" />
            )}
            <span
              className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                params.value === "Premium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: "Actions",
        width: 120,
        cellRenderer: (params) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleRowSelect(params.data)}
              className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ),
        suppressMenu: true,
        sortable: false,
        filter: false,

        cellStyle: { display: "flex", justifyContent: "center" },
      },
    ],
    []
  );

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 130,
    headerClass: "ag-header-center",
  };

  const filteredColumns = columnDefs.filter(
    (col) =>
      col.Header && col.Header.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // useEffect(() => {
  //   const fetchDataAsync = async () => {
  //     setLoading(true); // Start loading
  //     try {
  //       const response = await fetchData(
  //         "/api/getClientMasterDataAll",
  //         window.location.href
  //       );
  //       console.log("Fetched data:", response.data);
  //       setData(response.data);
  //       setColumns(selectedColumns);
  //     } catch (error) {
  //       console.error("Error fetching client data:", error);
  //     }
  //     setLoading(false);
  //   };
  //   fetchDataAsync();
  // }, []);
  const generatePFPFolderPath = (company, ClientID, filename) => {
    return `${company}/client/${ClientID}/profile_picture/${filename}`;
  };

  const fetchDataAsync = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Fetch client master data
      const response = await fetchData("/api/getClientMasterDataAll");
      const clients = response.data;

      // Step 2: Filter clients needing S3 data and optimize cache checks
      const clientsWithFiles = clients.filter(
        (client) => client.Folder && client.File
      );
      const cacheHits = new Map();
      const toFetch = new Set(); // Use Set to avoid duplicates

      clientsWithFiles.forEach((client) => {
        const cacheKey = `${client.ClientID}-${client.File}`;
        if (cacheRef.current[cacheKey]) {
          cacheHits.set(client.ClientID, cacheRef.current[cacheKey]);
        } else {
          toFetch.add({
            ClientID: client.ClientID,
            Folder: client.Folder,
            File: client.File,
          });
        }
      });

      // Step 3: Fetch uncached S3 data in parallel with Promise.all
      const fetchPromises = Array.from(toFetch).map(
        async ({ ClientID, Folder, File }) => {
          const cacheKey = `${ClientID}-${File}`;
          try {
            const imageUrl = await fetchData(
              `/api/getS3Data/${Folder}/${File}`
            );
            cacheRef.current[cacheKey] = imageUrl.dataURL || null;
            return { ClientID, UserProfile: imageUrl.dataURL };
          } catch (error) {
            console.error(`Error fetching S3 data for ${cacheKey}:`, error);
            cacheRef.current[cacheKey] = null;
            return { ClientID, UserProfile: null };
          }
        }
      );

      const s3Results = await Promise.all(fetchPromises);
      const s3DataMap = new Map(
        s3Results.map((result) => [result.ClientID, result.UserProfile])
      );

      // Step 4: Combine data efficiently
      const updatedData = clients.map((client) => {
        if (!client.Folder || !client.File) {
          return { ...client, UserProfile: null };
        }
        const cacheKey = `${client.ClientID}-${client.File}`;
        const cachedUrl =
          cacheHits.get(client.ClientID) || s3DataMap.get(client.ClientID);
        return {
          ...client,
          UserProfile: cachedUrl ?? cacheRef.current[cacheKey] ?? null,
        };
      });

      // Step 5: Single state update
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]); // Fallback on error
    } finally {
      setLoading(false);
    }
  }, [setLoading, setData]);

  useEffect(() => {
    fetchDataAsync();
  }, [fetchDataAsync]);

  const handleRowSelect = async (rowData) => {
    setLoading(true);
    try {
      const response = await postData(
        `/api/createNewEntryIfNotExist/${rowData.ClientID}`,
        { url: window.location.href }
      );

      console.log("Response:", response);

      await router.push(`/client/profile/update/${rowData.ClientID}`);
      console.log("Navigated to updateClientProfile");
    } catch (error) {
      console.error("Error handling row selection:", error);
    }
    setLoading(false);
  };

  const gridStyle = {
    // Base styles

    "--ag-background-color": "transparent",
    "--ag-foreground-color": "rgb(55, 65, 81)",
    "--ag-border-color": "transparent",

    // Header styling
    "--ag-header-background-color": "rgba(139, 92, 246, 0.08)",
    "--ag-header-foreground-color": "rgb(139, 92, 246)",
    "--ag-header-cell-hover-background-color": "rgba(139, 92, 246, 0.12)",

    // Font settings
    "--ag-font-family":
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    "--ag-font-size": "0.875rem",

    // Row styling
    "--ag-row-hover-color": "rgba(139, 92, 246, 0.04)",
    "--ag-selected-row-background-color": "rgba(139, 92, 246, 0.08)",
    "--ag-odd-row-background-color": "rgba(139, 92, 246, 0.02)",
    "--ag-row-border-color": "rgba(229, 231, 235, 0.3)",

    // Remove default borders
    "--ag-borders": "none",
    "--ag-cell-horizontal-border": "none",
    "--ag-row-border-style": "solid",
    "--ag-row-border-width": "1px",

    // Rounded corners
    "--ag-border-radius": "1rem",

    // Glassmorphism effects
    backdropFilter: "blur(8px)",

    // Pagination styling
    "--ag-paging-panel-height": "60px",
    "--ag-paging-button-width": "32px",
    "--ag-paging-button-height": "32px",

    // Custom scrollbar
    "--ag-scrollbar-background": "rgba(0, 0, 0, 0.1)",
    "--ag-scrollbar-thumb-color": "rgba(139, 92, 246, 0.3)",
  };

  // Handle the opening of the column chooser popover
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle the closing of the popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const ActionButton = ({
    icon: Icon,
    children,
    onClick,
    variant = "default",
  }) => {
    const baseClasses =
      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200";
    const variants = {
      default:
        "bg-white/50 hover:bg-white/80 text-gray-700 border border-gray-200/50",
      primary:
        "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90",
      outline:
        "border border-purple-500/20 text-purple-600 hover:bg-purple-50/50",
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]}`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </button>
    );
  };

  return (
    <>
      {/*<Navbar />*/}
      <div className="min-h-screen pt-24 gradient-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CustomBreadcrumbs />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Client Profiles
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view all client information
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                icon={Plus}
                variant="primary"
                onClick={() => router.push("/clients/new")}
              >
                Add Client
              </ActionButton>

              <ActionButton icon={FileSpreadsheet} onClick={handleExport}>
                Export
              </ActionButton>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                <p className="text-gray-600">Loading client data...</p>
              </div>
            </div>
          ) : (
            <div sx={{ marginTop: "1rem", backgroundColor: "#fff" }}>
              <div>{/* AG Grid Component with "ag-theme-material" */}</div>
              <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

                <div className="ag-theme-alpine  w-full" style={gridStyle}>
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
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .ag-row:hover {
              background-color: rgba(139, 92, 246, 0.04) !important;
            }
          `}</style>
                  <AgGridReact
                    rowData={data}
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
                      '<div class="flex flex-col items-center justify-center p-8 text-gray-500"><span>No clients found</span></div>'
                    }
                    domLayout="autoHeight"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientProfile;
