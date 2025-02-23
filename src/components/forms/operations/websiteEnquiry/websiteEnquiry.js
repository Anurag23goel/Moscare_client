import React, {useContext, useEffect, useState} from "react";
import {fetchData, getColumns} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import AgGridDataTable from "@/components/widgets/AgGridDataTable";
import {Box} from "@mui/material";
import Header from "@/components/widgets/Header";
import MButton from "@/components/widgets/MaterialButton";
import AddIcon from "@mui/icons-material/Add";
import style from "@/styles/style.module.css";

const WebsiteEnquiry = () => {
    const [showForm, setShowForm] = useState(false);
    const [websiteEnqData, setWebsiteEnqData] = useState([]);
    // const {colors, loading} = useContext(ColorContext);
    const [columns, setColumns] = useState([])
    useEffect(() => {
        let mounted = true;
        const fetchAndSetWebsiteEnqData = async () => {
            const data = await fetchWebsiteEnqData();
            setWebsiteEnqData(data);
            setColumns(getColumns(data))
        };
        fetchAndSetWebsiteEnqData();
        return () => {
            mounted = false;
        };
    }, []);

    const fetchWebsiteEnqData = async () => {
        try {
            const data = await fetchData(
                "/api/getCrmWebsiteEnqDataAll",
                window.location.href
            );
            console.log("Fetched data:", data);
            return data;
        } catch (error) {
            console.error("Error fetching websiteEnq  data:", error);
        }
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div>
            <Box className={style.spaceBetween} sx={{marginBottom: "0rem"}}>
                <Header title={"Website Enquiry"}/>
                <MButton
                    style={{
                        backgroundColor: "blue",
                        padding: "5px 10px",
                    }}
                    label="Add Website Enquiry"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    size="small"
                />
            </Box>
            <div style={{padding: "1rem", zIndex: "5"}}>
                {/* <MListingDataTable
          rows={websiteEnqData?.data}
        /> */}
                <AgGridDataTable
                    rows={websiteEnqData?.data}
                    columns={columns}
                />
            </div>
        </div>
    );
};

export default WebsiteEnquiry;
