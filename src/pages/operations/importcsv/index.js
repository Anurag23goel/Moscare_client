import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import Importcsv from "@/components/forms/operations/importcsv/importcsv";


const EmailWorkerPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <Importcsv/>
            </Container>
        </div>
    );
}

export default EmailWorkerPage;