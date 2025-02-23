import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import BulkNdis from "../../../components/forms/operations/bulkndis/bulkndis";


const BulkNdisPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <BulkNdis/>
            </Container>
        </div>
    );
}

export default BulkNdisPage;