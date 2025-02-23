import React from "react";
import { Container } from "react-bootstrap";
import styles from "@/styles/style.module.css";
import LocationRoster from "../../../components/forms/roster_management/LocationRostering";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const LocationRosterPage = () => {
  return (
    <div>
      {/*<DashMenu />*/}
      <Container className={styles.MainContainer}>
        
        <LocationRoster />
      </Container>
    </div>
  );
};

export default LocationRosterPage;
