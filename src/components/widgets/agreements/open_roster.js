import {useEffect, useState} from "react";
import {Box, Fade, List, ListItem, ListItemText, Modal} from "@mui/material";
import {useRouter} from "next/router";
import ModalHeader from "@/components/widgets/ModalHeader";
import {fetchData} from "@/utility/api_utility";
import OutlinedInput from "@mui/material/OutlinedInput";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const OpenRoster = ({clientID, open, onClose}) => {
    const [rosters, setRosters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const fetchRosters = async () => {
        try {
            console.log(clientID)
            const result = await fetchData(`/api/getRosterMasterData/${clientID}`, window.location.href);
            setRosters(result.data);
        } catch (error) {
            console.error("Error fetching rosters: ", error);
        }
    };

    const handleRosterClick = (rosterId) => {
        window.open(`/RosterManagement/ClientCalendar?clientId=${clientID}&rosterId=${rosterId}`, '_blank');
        onClose();
    };

    useEffect(() => {
        if (open) {
            fetchRosters();
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose}>
            <Fade in={open}>
                <Box sx={style}>
                    <ModalHeader title="Open Roster" onClose={
                        () => {
                            onClose();
                            setSearchTerm("");
                        }
                    }/>
                    <br></br>
                    <OutlinedInput
                        placeholder="Search..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <List>
                        {rosters
                            .filter((roster) =>
                                roster.RosterID.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((roster) => (
                                <ListItem button key={roster.RosterID}
                                          onClick={() => handleRosterClick(roster.RosterID)}>
                                    <ListItemText primary={roster.RosterID}/>
                                </ListItem>
                            ))}
                    </List>
                </Box>
            </Fade>
        </Modal>
    );
};

export default OpenRoster;