import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  fetchData,
  fetchUserRoles,
  getColumns,
  postData,
} from "@/utility/api_utility";
import CHKMListingDataTable from "@/components/widgets/CHKMListingDataTable";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditModal from "@/components/widgets/EditModal";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const DownloadWorkerRoster = () => {
  const [workerListData, setWorkerListData] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [disableSection, setDisableSection] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [formData, setFormData] = useState([]);
  const [downloadType, setDownloadType] = useState("Separately");

  const [shiftStartDate, setShiftStartDate] = useState(
    new Date().toISOString().split(" ")[0]
  );
  const [noOfWeeks, setNoOfWeeks] = useState(1);
  const [exportServices, setExportServices] = useState(true);
  const [exportAddress, setExportAdress] = useState(true);
  const [rosterCategory, setRosterCategory] = useState(false);
  const [columns, setColumns] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (option) => {
    setDownloadType(option);
    setShowDownloadModal(true);
    handleClose();
  };

  const fetchWorkers = async () => {
    try {
      const workers = await fetchData(
        "/api/getDownloadWorkerRosterListAll",
        window.location.href
      );
      console.log("Fetched emailClientRoster data:", workers);
      return workers;
    } catch (error) {
      console.error("Error fetching emailClientRoster data:", error);
    }
  };

  useEffect(() => {
    const fetchAndSetEmailClientRosterData = async () => {
      const data = await fetchWorkers();
      setWorkerListData(data);
      setColumns(getColumns(data));
    };
    fetchAndSetEmailClientRosterData();
    fetchUserRoles(
      "m_download_worker_roster",
      "Operations_DownloadWorkerRoster",
      setDisableSection
    );
  }, []);

  // const {colors, loading} = useContext(ColorContext);
  // if (loading) {
  //     return <div>Loading...</div>;
  // }

  const handleRowSelectionModelChange = (selectedRowIndices) => {
    const selectedData = selectedRowIndices.map(
      (index) => workerListData.data[index].WorkerID
    );
    setSelectedWorkers(selectedData);
    console.log("Selected workers:", selectedData);
  };

  const handleDownloadRosterButton = async () => {
    console.log("FormData : ", formData);
    if (!selectedWorkers.length) {
      alert("Please select at least one worker to download the roster.");
      return;
    }
    try {
      const res = await postData(
        "/api/getRosterDataForWorkerDownload",
        {
          selectedWorkers: selectedWorkers,
          shiftStartDate,
          noOfWeeks,
          exportServices,
          exportAddress,
          rosterCategory,
          downloadType,
        },
        window.location.href
      );

      console.log("Roster data response:", res);

      if (downloadType === "Separately") {
        // For separate downloads, assuming `res.results` is an array of objects with URLs
        if (res.success && res.results) {
          res.results.forEach((result, index) => {
            if (result.success && result.url) {
              setTimeout(async () => {
                try {
                  const response = await fetch(result.url);
                  const blob = await response.blob();
                  const link = document.createElement("a");
                  link.href = window.URL.createObjectURL(blob);
                  link.setAttribute(
                    "download",
                    `worker_${index + 1}_roster.pdf`
                  ); // optional filename
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(link.href); // Free up memory
                } catch (err) {
                  console.error("Error downloading PDF:", err);
                }
              }, index * 1000); // Delay for sequential downloads
            } else {
              console.error("Error in individual download result:", result);
            }
          });
        } else {
          console.error(
            "Error in response structure for separate downloads:",
            res
          );
        }
      } else if (downloadType === "Combined") {
        // For a combined download, `res.url` should be the direct download link
        if (res.success && res.url) {
          const response = await fetch(res.url);
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", "combined_roster.pdf"); // optional filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href); // Free up memory
        } else {
          console.error(
            "Error in response structure for combined download:",
            res
          );
        }
      }
    } catch (error) {
      console.error("Error fetching roster data for download:", error);
    } finally {
      setShowDownloadModal(false);
    }
  };

  const handleChange = ({ id, value }) => {
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const fields = [
    {
      type: "date",
      label: "Shift Start Date",
      id: "ShiftStart",
    },
    {
      type: "number",
      label: "Weeks",
      id: "NoOfWeeks",
    },
    {
      type: "checkbox",
      label: "Export Services",
      id: "ExportServices",
    },
    {
      type: "checkbox",
      label: "Export Address",
      id: "ExportAddress",
    },
    {
      type: "checkbox",
      label: "Roster Category",
      id: "RosterCategory",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 py-8">
        <div className="pl-2 mb-3"><CustomBreadcrumbs /></div>
        <div className=" glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          {/* <Modal
                //     isOpen={showDownloadModal}
                //     onRequestClose={() => setShowDownloadModal(false)}
                //     contentLabel="Download Worker Roster"
                //     style={{
                //         overlay: {
                //             backgroundColor: "rgba(0, 0, 0, 0.5)",
                //         },
                //         content: {
                //             top: "50%",
                //             left: "50%",
                //             right: "auto",
                //             bottom: "auto",
                //             marginRight: "-50%",
                //             transform: "translate(-50%, -50%)",
                //             width: "fit-content",
                //         },
                //     }}
                // >
                //     <ModalHeader
                //         title="Download Worker Roster"
                //         handleClose={() => setShowDownloadModal(false)}
                //     />
                //     <div style={{padding: "1rem"}}>
                //         {
                //             downloadType === "Separately" ? (
                //                 <h6>Download {selectedWorkers.length} worker roster(s)</h6>
                //             ) : (
                //                 <h6>Download {selectedWorkers.length} worker roster(s) combined</h6>
                //             )
                //         }
                //         <div style={{display: "flex"}}>
                //             <Row>
                //                 <InputField
                //                     label="Shift Start Date"
                //                     type="date"
                //                     id="ShiftStart"
                //                     value={formData.ShiftStart}
                //                     onChange={handleChange}
                //                 />
                //                 <InputField
                //                     label="Weeks"
                //                     type="number"
                //                     id="NoOfWeeks"
                //                     value={formData.NoOfWeeks}
                //                     onChange={handleChange}
                //                 />
                //             </Row>
                //         </div>
                //         <div style={{display: "flex", flexDirection: "column"}}>
                //             <div>
                //                 <Checkbox
                //                     checked={formData.ExportServices}
                //                     onChange={handleChange}
                //                 /> Export Services
                //             </div>
                //             <div>
                //                 <Checkbox
                //                     checked={formData.ExportAddress}
                //                     onChange={handleChange}
                //                 /> Export Address
                //             </div>
                //             <div>
                //                 <Checkbox
                //                     checked={formData.RosterCategory}
                //                     onChange={handleChange}
                //                 /> Roster Category
                //             </div>
                //         </div>
                //         <br/>
                //         <Button
                //             label="Print PDF"
                //             variant="contained"
                //             color="secondary"
                //             size="small"
                           
                //             onClick={handleDownloadRosterButton}
                //         />
                //     </div>
                // </Modal> */}

          <EditModal
            show={showDownloadModal}
            onClose={() => setShowDownloadModal(false)}
            onSave={handleDownloadRosterButton}
            modalTitle="Download Worker Roster"
            fields={fields}
            data={formData}
            btnName={"Download"}
            btnIcon={<DownloadForOfflineIcon />}
            onChange={handleChange}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "2rem",
            }}
          >
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DownLoad Worker Roster
              </h2>

              <p className="text-gray-600 dark:text-gray-400">
                Manage all DownLoad Worker Roster. Click on Edit to update their
                DownLoad Worker Roster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {true && (
                <button
                  onClick={handleClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <span>Bulk Download Roster</span>
                </button>
              )}
            </div>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={() => handleOptionClick("Separately")}>
                Separately
              </MenuItem>
              <MenuItem onClick={() => handleOptionClick("Combined")}>
                Combined
              </MenuItem>
            </Menu>
          </div>

          <CHKMListingDataTable
            rows={workerListData.data || []}
            rowSelected={() => {}}
            handleRowSelectionModelChange={handleRowSelectionModelChange}
          />
          {/* <AgGridDataTable
                   rows={workerListData.data || []}
                   rowSelected={() => {
                   }}
                   rowSelection="multiple" // Enable multiple row selection
                   onSelectionChanged={(params) => {
                     const selectedRows = params.api.getSelectedRows(); // Get selected rows
                     console.log(selectedRows); // Log selected rows or handle them as needed
                     handleRowSelectionModelChange(selectedRows); // Optional: Pass the selected rows to your handler
                   }}
                   handleRowSelectionModelChange={handleRowSelectionModelChange}
                   columns={columns}
                /> */}
        </div>
      </div>
    </div>
  );
};

export default DownloadWorkerRoster;
