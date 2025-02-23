import { fetchData } from "@/utility/api_utility";
import React, { useEffect, useState } from "react";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import { Container } from "react-bootstrap";
import { useRouter } from "next/router";
import Modal from "@mui/material/Modal";
import { Box, Fade } from "@mui/material";
import ModalHeader from "@/components/widgets/ModalHeader";
import styles from "@/styles/style.module.css";

import { Plus } from "lucide-react";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const AvatarComp = (a) => {
  console.log("AvatarComp : ", a);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
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

const Agreement = () => {
  const router = useRouter();

  const [agreements, setAgreements] = useState([]);
  const [clients, setClients] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  // const {colors, loading} = useContext(ColorContext);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const fetchDataAsync = async () => {
    const agreements = await fetchData(
      "/api/getClientAgreementDataAll",
      window.location.href
    );
    const clients = await fetchData(
      "/api/getActiveClientMasterData",
      window.location.href
    );
    setClients(clients.data);
    setAgreements(agreements);
  };

  const handleRowClick = (row) => {
    router.push(`/agreement/${row.AgreementCode}`);
  };

  const handleNewAggrButton = () => {
    setOpenModal(true);
  };

  const handleClientRowClick = (row) => {
    router.push(`/agreement/${row.ClientID}`);
  };

  useEffect(() => {
    fetchDataAsync();
  }, []);

  // if (loading) {
  //     return <div>Loading...</div>;
  // }

  const getRowClassName = (row) => {
    if (row["Agreement Ended"]) {
      return styles["agreement-ended"];
    }
    if (row["Agreement Alert Date Reached"]) {
      return styles["agreement-alert-date-reached"];
    }
    if (row["Forecast Balance Exceeded"]) {
      return styles["forecast-balance-exceeded"];
    }
    if (row["Actual Balance Exceeded"]) {
      return styles["actual-balance-exceeded"];
    }
    return "";
  };

  return (
    <div className="min-h-screen gradient-background pt-24">
      {/*<Navbar />*/}

      <div className="max-w-7xl mx-auto  py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Client Agreements
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor client agreements
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Agreement
          </button>
        </div>
      </div>
      <div>
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Fade in={openModal}>
            <Box sx={style}>
              <ModalHeader onCloseButtonClick={() => setOpenModal(false)} />
              <MListingDataTable
                rows={clients}
                rowSelected={(row) => handleClientRowClick(row)}
              />
            </Box>
          </Fade>
        </Modal>

        <Container>
          <div className="pl-2 mb-3"><CustomBreadcrumbs /></div>
          <MListingDataTable
            getRowClassName={getRowClassName}
            rows={agreements}
            rowSelected={(row) => handleRowClick(row)}
          />
        </Container>
      </div>
    </div>
  );
};

export default Agreement;
