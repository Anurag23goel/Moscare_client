import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import Task from "@/components/forms/operations/task/task";


const TaskPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <Task/>
            </Container>
        </div>
    );
}

export default TaskPage;