import React from "react";
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import WebsiteEnquiry from "@/components/forms/operations/websiteEnquiry/websiteEnquiry";

const WebsiteEnquiryPage = () => {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <WebsiteEnquiry/>
            </Container>
        </div>
    );
};

export default WebsiteEnquiryPage;
