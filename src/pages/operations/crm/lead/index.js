import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import Lead from "@/components/forms/operations/lead/lead";

const LeadPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Lead/>
            <Container className={styles.MainContainer}>
            </Container>
        </div>
    );
};

export default LeadPage;
