import React from "react";
import { Container } from "react-bootstrap";
import styles from "@/styles/style.module.css";
import ClientWorkerMap from "@/components/forms/operations/clientworkermap/clientworkermap";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const QuotesPage = () => {
  return (
    <div>
      <div>
        {/*<DashMenu />*/}
        <Container className={styles.MainContainer}>
          <CustomBreadcrumbs />
          <ClientWorkerMap />
        </Container>
      </div>
    </div>
  );
};

export default QuotesPage;
