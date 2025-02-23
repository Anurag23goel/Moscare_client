import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import DailySchedule from "@/components/forms/operations/DailySchedule/dailyschedule";


const EmailClientRosterPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <DailySchedule/>
            </Container>
        </div>
    );
}

export default EmailClientRosterPage;