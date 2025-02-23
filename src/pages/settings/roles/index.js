import React, {useEffect, useState} from "react";
import MListingDataTable from "@/components/widgets/MListingDataTable";
import {fetchData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import styles from "@/styles/style.module.css";
import {Container} from "react-bootstrap";
import Button from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";

const RowDetails = {
    Role_ID: "",
    Role_Desc: "",
};


const ClientProfile = () => {
    const [data, setData] = useState([]);
    const router = useRouter();

    const newRole = async () => {
        router.push("/settings/roles/new").then((r) => {
            console.log("Navigated to newRole");
        });
    };

    useEffect(() => {
        const fetchDataAsync = async () => {
            const data = await fetchData(
                "/api/getMasterRoleData",
                window.location.href
            );
            console.log("Fetched data:", data);
            setData(data);
        };
        fetchDataAsync();
    }, []);

    const handleRowSelect = async (rowData) => {
        RowDetails.Role_ID = rowData.Role_ID;
        RowDetails.Role_Desc = rowData.Role_Desc;

        router
            .push(`/settings/roles/update/${rowData.Role_ID}`)
            .then((r) => console.log("Navigated to UpdateRoles"));
    };

    return (
        <div>
            {/* <Navbar /> */}
            <Container>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px",
                        width: "100%",
                    }}
                    className={styles.MainContainer}
                >
                    <Button
                        style={{margin: "20px 15px 30px 15px", width: "9%"}}
                        label="Add Role"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon sx={{marginRight: 1}}/>}
                        onClick={() => {
                            newRole();
                        }}
                        size={"small"}
                    />
                    <MListingDataTable
                        rows={data}
                        rowSelected={(row) => {
                            handleRowSelect(row).then((r) =>
                                console.log("Row selected:", row)
                            );
                        }}
                    />
                </div>
            </Container>
        </div>
    );
};

export default ClientProfile;
export {RowDetails};

