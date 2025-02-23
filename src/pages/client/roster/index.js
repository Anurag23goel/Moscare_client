import ClientRosters from '@/components/forms/client_update/rosters/rosters'
import {Container} from "react-bootstrap";
import styles from "@/styles/style.module.css";

function RosterMain() {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container className={styles.MainContainer}>
                <ClientRosters/>
            </Container>
        </div>
    )
}

export default RosterMain
