import React, {useEffect, useState} from "react";
import {Box} from "@mui/material";
import InputField from "@/components/widgets/InputField";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch} from "react-redux";
import {deleteData} from "@/redux/client/ndisSlice";
import {useRouter} from "next/router";
import Modal from "@mui/material/Modal";
import ModalHeader from "@/components/widgets/ModalHeader";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";

const Funding = () => {
    const router = useRouter();
    const {ClientID} = router.query;

    const dispatch = useDispatch();
    const [prompt, setPrompt] = useState(false);
    const [columns, setColumns] = useState([]);
    const [newPeriod, setNewPeriod] = useState(false);

    const [fundingForm, setFundingForm] = useState({
        PeriodStart: "",
        PeriodEnd: "",
        FundingAmount: "",
    });
    const [fundingData, setFundingData] = useState([]);
    const [disableSection, setDisableSection] = useState(false);

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <Spinner/>;
    // }

    const fetchFundings = async () => {
        const funds = await fetchData(
            `/api/getNdisFunding/${ClientID}`,
            window.location.href
        );
        const columns = Object.keys(funds[0] || {}).map((key) => ({
            field: key,
            headerName: key.replace(/([a-z])([A-Z])/g, "$1 $2"),
        }));
        setColumns(columns)
        if (funds.length > 0) {
            console.log("Funds : ", funds[0])
            setFundingData(funds);
        }
    };

    const handleNewPeriodClick = () => {
        setNewPeriod(true);
    };

    const handleSelectRowClick = (row) => {
        // setSelectedRowData(row);
        // setShowModal(true);
        console.log("Selected Row:", row);
    };

    const handleCreatePeriodBClick = async () => {
        const funds = await fetchData(
            `/api/getClientNDISFundingBetweenDates/${ClientID}?startDate=${fundingForm.PeriodStart}&endDate=${fundingForm.PeriodEnd}`,
            window.location.href
        );
        console.log("Funds : ", funds);
        if (funds.length > 0 && funds[0].TotalBudget !== null) {
            setFundingForm((prevState) => {
                const updatedState = {
                    ...prevState,
                    FundingAmount: parseFloat(funds[0].TotalBudget).toFixed(2),
                };
                updateDatabase(updatedState);
                return updatedState;
            });
        } else {
            setFundingForm((prevState) => {
                const updatedState = {...prevState, FundingAmount: "0.00"};
                updateDatabase(updatedState);
                return updatedState;
            });
        }
    };

    const updateDatabase = (formData) => {
        console.log(formData); // Ensure that formData includes the latest FundingAmount
        putData(
            `/api/insertNdisFunding/${ClientID}`,
            {
                data: formData,
            },
            window.location.href
        )
            .then((response) => {
                setNewPeriod(false);
                fetchFundings();
            })
            .catch((error) => {
                console.error("Failed to update NDIS funding:", error);
            });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                } else {
                    dispatch(deleteData());
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (ClientID) {
            fetchFundings();
        } else {
            console.log("ClientID not found");
        }
        fetchUserRoles("m_cprofile", "Client_Profile_NDIS", setDisableSection);
    }, [ClientID]);

    const handleChange = (event) => {
        // if period start is changed then update the funding form
        if (event.target.id === "PeriodStart" || event.target.id === "PeriodEnd") {
            setFundingForm((prevState) => {
                const updatedState = {
                    ...prevState,
                    [event.target.id]: event.target.value,
                };
                return updatedState;
            });
        }

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };


    return (
        <div
            style={{
                backgroundColor: "#f9f9f9",
                borderBottomLeftRadius: "15px",
                borderBottomRightRadius: "15px",
                borderLeft: "1px solid",
                borderBottom: "1px solid",
                borderRight: "1px solid",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                width: "100%",
                padding: "2rem",
                alignItems: "flex-start",
            }}
        >
            <Modal open={newPeriod} onClose={() => setNewPeriod(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <ModalHeader
                        onCloseButtonClick={() => setNewPeriod(false)}
                        title={"New Period"}
                    />

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            marginTop: "2rem",
                        }}
                    >
                        <InputField
                            label="Period Start"
                            type="date"
                            id="PeriodStart"
                            value={fundingForm.PeriodStart}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                        <InputField
                            label="Period End"
                            type="date"
                            id="PeriodEnd"
                            value={fundingForm.PeriodEnd}
                            onChange={handleChange}
                            disabled={disableSection}
                        />

                        <MButton
                            variant={"outlined"}
                            label={"Create"}
                            onClick={handleCreatePeriodBClick}
                            disabled={disableSection}
                        />
                    </div>
                </Box>
            </Modal>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>NDIS Funding</h4>
                    </div>
                    <div>
                        <MButton
                            variant={"contained"}
                            label={"New Period"}
                            onClick={handleNewPeriodClick}
                            disabled={disableSection}
                            size={"small"}
                            style={{
                                fontSize: "12px",
                                color: "white",
                                borderRadius: "10px",
                                backgroundColor: "red",
                                padding: "5px 10px"
                            }}
                        />
                    </div>
                </div>
                {/* <CellMListingDataTable
          rows={
            // remove the ClientID, MakerID, and MakerDate columns
            fundingData.map((row) => {
              const {
                ClientID,
                MakerUser,
                MakerDate,
                UpdateUser,
                UpdateDate,
                ...rest
              } = row;
              return rest;
            })
          }
          // handle row selection and cell click
          rowSelected={(row) => {
            setFundingForm({
              PeriodStart: row.PeriodStart,
              PeriodEnd: row.PeriodEnd,
              FundingAmount: row.TotalBudget,
            });
          }}
          handleCellClick={(row) => {
            setFundingForm({
              PeriodStart: row.PeriodStart,
              PeriodEnd: row.PeriodEnd,
              FundingAmount: row.TotalBudget,
            });
          }}
        /> */}
                <AgGridDataTable
                    rows={fundingData}
                    columns={columns.filter(
                        (col) =>
                            ![
                                "Maker Date",
                                "Maker User",
                                "Update User",
                                "Update Date",
                            ].includes(col.headerName)
                    )}
                    rowSelected={handleSelectRowClick}
                />
            </div>
        </div>
    );
};

export default Funding;
