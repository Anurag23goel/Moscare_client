"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchData, postData } from "@/utility/api_utility";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import {
  BadgeCheck,
  ChevronDown,
  Edit,
  FileSpreadsheet,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  UserCircle,
} from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

export default function WorkerProfile() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const cacheRef = useRef({});

  // Custom Avatar Component
  const AvatarComp = ({ value }) => (
    <div className="flex items-center justify-center">
      {value ? (
        <img
          src={value}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-purple-500" />
        </div>
      )}
    </div>
  );

  // Custom Header Component
  const CustomHeader = (props) => {
    const icon = {
      FirstName: UserCircle,
      LastName: UserCircle,
      Email: Mail,
      Phone: Phone,
      Department: BadgeCheck,
    }[props.column.colId];

    const Icon = icon || ChevronDown;

    return (
      <div className="flex items-center justify-center gap-2 px-2">
        <Icon className="h-4 w-4 text-purple-500" />
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
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "LastName",
        headerName: "Last Name",
        headerComponent: CustomHeader,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "Email",
        headerName: "Email",
        headerComponent: CustomHeader,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "Phone",
        headerName: "Phone",
        headerComponent: CustomHeader,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
      {
        field: "Department",
        headerName: "Department",
        headerComponent: CustomHeader,
        cellStyle: { display: "flex", justifyContent: "center" },
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
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 130,
      headerClass: "ag-header-center",
    }),
    []
  );

  const gridStyle = {
    "--ag-background-color": "transparent",
    "--ag-foreground-color": "rgb(55, 65, 81)",
    "--ag-border-color": "transparent",
    "--ag-header-background-color": "rgba(139, 92, 246, 0.08)",
    "--ag-header-foreground-color": "rgb(139, 92, 246)",
    "--ag-header-cell-hover-background-color": "rgba(139, 92, 246, 0.12)",
    "--ag-font-family": "inherit",
    "--ag-font-size": "0.875rem",
    "--ag-row-hover-color": "rgba(139, 92, 246, 0.04)",
    "--ag-selected-row-background-color": "rgba(139, 92, 246, 0.08)",
    "--ag-odd-row-background-color": "rgba(139, 92, 246, 0.02)",
    "--ag-row-border-color": "rgba(229, 231, 235, 0.3)",
    "--ag-borders": "none",
    "--ag-cell-horizontal-border": "none",
    "--ag-border-radius": "1rem",
  };

  const generatePFPFolderPath = (company, WorkerID, filename) => {
    return `${company}/worker/${WorkerID}/profile_picture/${filename}`;
  };

  const fetchDataAsync = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Fetch worker master data
      const response = await fetchData("/api/getWorkerMasterDataAll");
      const workers = response.data;

      // Step 2: Filter workers needing S3 data and optimize cache checks
      const workersWithFiles = workers.filter(
        (worker) => worker.Folder && worker.File
      );
      const cacheHits = new Map();
      const toFetch = new Set(); // Use Set to avoid duplicates

      workersWithFiles.forEach((worker) => {
        const cacheKey = `${worker.WorkerID}-${worker.File}`;
        if (cacheRef.current[cacheKey]) {
          cacheHits.set(worker.WorkerID, cacheRef.current[cacheKey]);
        } else {
          toFetch.add({
            WorkerID: worker.WorkerID,
            Folder: worker.Folder,
            File: worker.File,
          });
        }
      });

      // Step 3: Fetch uncached S3 data in parallel with Promise.all
      const fetchPromises = Array.from(toFetch).map(
        async ({ WorkerID, Folder, File }) => {
          const cacheKey = `${WorkerID}-${File}`;
          try {
            const imageUrl = await fetchData(
              `/api/getS3Data/${Folder}/${File}`
            );
            cacheRef.current[cacheKey] = imageUrl.dataURL || null;
            return { WorkerID, UserProfile: imageUrl.dataURL };
          } catch (error) {
            console.error(`Error fetching S3 data for ${cacheKey}:`, error);
            cacheRef.current[cacheKey] = null;
            return { WorkerID, UserProfile: null };
          }
        }
      );

      const s3Results = await Promise.all(fetchPromises);
      const s3DataMap = new Map(
        s3Results.map((result) => [result.WorkerID, result.UserProfile])
      );

      // Step 4: Combine data efficiently
      const updatedData = workers.map((worker) => {
        if (!worker.Folder || !worker.File) {
          return { ...worker, UserProfile: null };
        }
        const cacheKey = `${worker.WorkerID}-${worker.File}`;
        const cachedUrl =
          cacheHits.get(worker.WorkerID) || s3DataMap.get(worker.WorkerID);
        return {
          ...worker,
          UserProfile: cachedUrl ?? cacheRef.current[cacheKey] ?? null,
        };
      });

      // Step 5: Single state update
      setData(updatedData);
    } catch (error) {
      console.error("Error fetching worker data:", error);
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
      await postData(`/api/createNewEntryIfNotExist/${rowData.WorkerID}`);
      router.push(`/worker/profile/update/${rowData.WorkerID}`);
    } catch (error) {
      console.error("Error handling row selection:", error);
    }
    setLoading(false);
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
    <div className="min-h-screen gradient-background pt-24">
      {/*<Navbar />*/}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Worker Profiles
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and view all worker information
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton
              icon={Plus}
              variant="primary"
              onClick={() => router.push("/workers/new")}
            >
              Add Worker
            </ActionButton>

            <ActionButton
              icon={FileSpreadsheet}
              onClick={() => {
                /* Handle export */
              }}
            >
              Export
            </ActionButton>
          </div>
        </div>

        <div className="pl-2 mb-3"><CustomBreadcrumbs /></div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <p className="text-gray-600">Loading worker data...</p>
            </div>
          </div>
        ) : (
          <div className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" />

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
                  '<div class="flex flex-col items-center justify-center p-8 text-gray-500"><span>No workers found</span></div>'
                }
                domLayout="autoHeight"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
