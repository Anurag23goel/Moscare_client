import React from "react";
import { Container } from "react-bootstrap";
import styles from "@/styles/style.module.css";
import DataExportsAudit from "@/components/forms/timesheets_main/data_export_audit/data_export_audit";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const DataExportsPage = () => {
  return (
    <div>
      
      {/*<DashMenu />*/}
      <Container className={styles.MainContainer}>
      <div className="pl-8 mb-3">
        <CustomBreadcrumbs />
      </div>
        <DataExportsAudit />
      </Container>
    </div>
  );
};

export default DataExportsPage;
