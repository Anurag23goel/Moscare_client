import React from "react";
import UserRoles from "@/components/forms/settings/roles/roles";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";

const UpdateRoles = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <UserRoles/>
            </Container>
        </div>
    );
};

export default UpdateRoles;
