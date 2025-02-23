import React, {useEffect, useRef, useState} from "react";
import {Button, Card, CircularProgress, MenuItem, TextField, Typography,} from "@mui/material";
import styles from "../../../../../styles/settings.module.css"; // Assuming you use a separate CSS module
import {Col, Row} from "react-bootstrap";
import {fetchData, postData, putData} from "@/utility/api_utility";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import style from "@/styles/style.module.css";

const CompanyInfo = ({onSave}) => {
    const [data, setData] = useState([]);
    const [logoLoading, setLogoLoading] = useState(null)
    //const {colors} = useContext(ColorContext)

    const [formData, setFormData] = useState({
        company_name: "",
        abn: "",
        address_1: "",
        address_2: "",
        suburb: "",
        state: "",
        post_code: "",
        website: "",
        phone_1: "",
        phone_2: "",
        fax: "",
        email: "",
        time_zone: "",
        company_logo: "",
        company_govId: "",
        company_hcp_naps_id: "",
        company_hacc_agency_id: "",
        bucket: "moscare",
        folderPath: "",
    });

    // Fetch company info if exists
    const getCompanyInfo = async () => {
        try {
            const data = await fetchData('/api/getCompanyInfo')
            console.log("getCompanyInfo : ", data.data);
            setData(data.data[0])
        } catch (err) {
            console.log(err)
        }
    }

    // Update formData when data changes
    useEffect(() => {
        setFormData({
            company_name: data?.company_name || "",
            abn: data?.abn || "",
            address_1: data?.address_1 || "",
            address_2: data?.address_2 || "",
            suburb: data?.suburb || "",
            state: data?.state || "",
            post_code: data?.post_code || "",
            website: data?.website || "",
            phone_1: data?.phone_1 || "",
            phone_2: data?.phone_2 || "",
            fax: data?.fax || "",
            email: data?.email || "",
            time_zone: data?.time_zone || "",
            company_logo: data?.company_logo || "",
            company_govId: data?.company_govId || "",
            company_hcp_naps_id: data?.company_hcp_naps_id || "",
            company_hacc_agency_id: data?.company_hacc_agency_id || "",
            bucket: "moscare",
            folderPath: data?.folderPath || "",
        });
    }, [data]);

    useEffect(() => {
        getCompanyInfo();
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const fileInputRef = useRef(null);

    // Function to trigger the file input click
    const handleIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle the file selection
    const handleFileChange = async (e) => {
        const file = e.target.files[0]; // Get the selected file
        if (!file) {
            alert("No file selected!");
            return;
        }

        try {
            setLogoLoading(true)
            // Generate the folder path for the file
            const folderPath = `company_logos/${encodeURIComponent(file.name)}`;

            // Request a pre-signed upload URL from the server
            const uploadResponse = await postData("/api/postS3Data", {FolderPath: folderPath});
            const {uploadURL} = uploadResponse;

            if (!uploadURL) {
                alert("Failed to get upload URL.");
                return;
            }

            // Upload the file to S3 using the pre-signed URL
            const uploadResult = await fetch(uploadURL, {
                method: "PUT",
                body: file, // Pass the actual file
            });

            if (!uploadResult.ok) {
                alert("Failed to upload the file.");
                return;
            }

            // Get the public URL for the uploaded file
            const viewResponse = await fetchData(`/api/getS3Data/${folderPath}`);
            const {dataURL} = viewResponse;

            if (!dataURL) {
                alert("Failed to fetch the file URL.");
                return;
            }
            setLogoLoading(false)
            // Update the state with the file information
            setFormData((prevFormData) => ({
                ...prevFormData,
                company_logo: file.name, // Save just the file name
                folderPath,             // Save the folder path
                logoURL: dataURL,       // Save the accessible URL
            }));

            alert("Logo updated successfully!");
            console.log(`Uploaded file available at: ${dataURL}`);
        } catch (error) {
            setLogoLoading(false)
            console.error("Error during file upload:", error);
            alert("An error occurred during the upload process.");
        }
    };


    const handleSubmit = async () => {
        console.log(formData);

        // if (!formData.company_logo) {
        //   alert("Please select a file to upload.");
        //   return;
        // }

        // try {
        //   const folderPath = `company_logos/${encodeURIComponent(
        //     formData.company_logo.name // Access the file name
        //   )}`;

        //   const uploadResponse = await postData("/api/postS3Data", {
        //     FolderPath: folderPath,
        //   });

        //   const { uploadURL } = uploadResponse;

        //   if (!uploadURL) {
        //     alert("Failed to get upload URL");
        //     return;
        //   }

        //   const fileUpload = await fetch(uploadURL, {
        //     method: "PUT",
        //     body: formData.company_logo, // Pass the actual file
        //   });

        //   if (fileUpload.ok) {
        //     try {
        //       const viewResponse = await fetchData(`/api/getS3Data/${folderPath}`);
        //       const { dataURL } = viewResponse;

        //       console.log(`Viewable URL: ${dataURL}`);

        //       // Update formData synchronously and then proceed
        //       setFormData((prevFormData) => {
        //         const updatedFormData = {
        //           ...prevFormData,
        //           company_logo: formData.company_logo.name, // Save just the file name
        //           folderPath, // Save the folder path
        //         };

        //         // Proceed with the next logic after state update
        //         handleFormSubmission(updatedFormData);
        //         return updatedFormData;
        //       });
        //     } catch (error) {
        //       console.error("Error fetching file URL:", error);
        //       alert("Failed to fetch the file URL.");
        //     }
        //   } else {
        //     alert("Failed to upload file.");
        //   }
        // } catch (error) {
        //   console.error(error);
        //   alert("An error occurred during upload.");
        // }


        if (data && data.length !== 0) {
            try {
                const response = await putData(`/api/updateCompanyInfo`, formData);
                console.log("Data Updated Successfully:", response);
                alert("Data Updated Successfully")
            } catch (err) {
                console.log(err);
                alert("Something Went wrong")

            }
        } else {
            try {
                const response = await postData(`/api/postCompanyInfo`, updatedFormData);
                console.log("Data submitted successfully:", response);
                alert("Data submitted Successfully")
            } catch (error) {
                console.error("Error submitting data:", error);
                alert("Something Went wrong")
            }
        }


    };

    // const handleFormSubmission = async (updatedFormData) => {
    //   // Use the updated formData here
    //   if (data && data.length !== 0) {
    //     try {
    //       const response = await putData(`/api/updateCompanyInfo`, updatedFormData);
    //       console.log("Data Updated Successfully:", response);
    //     } catch (err) {
    //       console.log(err);
    //     }
    //   } else {
    //     try {
    //       const response = await postData(`/api/postCompanyInfo`, updatedFormData);
    //       console.log("Data submitted successfully:", response);
    //     } catch (error) {
    //       console.error("Error submitting data:", error);
    //     }
    //     console.log("formData", updatedFormData);
    //   }
    // };


    return (
        <div className={styles.financeContainer}>
            <div className={styles.header}>
                <Button variant="contained" s sx={{
                    backgroundColor: "blue",
                    "&:hover": {
                        backgroundColor: "blue", // Replace this with your desired hover color
                    },
                }} size="small" className={style.maintenanceBtn} onClick={() => handleSubmit()}>
                    Save
                </Button>
            </div>
            <Row>
                <Col md={6}>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>General</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Company Name"
                                        name="company_name"
                                        fullWidth
                                        value={formData.company_name}
                                        onChange={(e) => handleChange(e)}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="ABN"
                                        name="abn"
                                        fullWidth
                                        value={formData.abn}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Address 1"
                                        name="address_1"
                                        fullWidth
                                        value={formData.address_1}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="Address 2"
                                        name="address_2"
                                        fullWidth
                                        value={formData.address_2}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Suburb"
                                        name="suburb"
                                        fullWidth
                                        value={formData.suburb}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="State"
                                        name="state"
                                        fullWidth
                                        value={formData.state}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="Post Code"
                                        name="post_code"
                                        fullWidth
                                        value={formData.post_code}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>


                            <Row>
                                <Col>
                                    <TextField
                                        label="Phone 1"
                                        name="phone_1"
                                        fullWidth
                                        value={formData.phone_1}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="Phone 2"
                                        name="phone_2"
                                        fullWidth
                                        value={formData.phone_2}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Fax"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.fax}
                                        onChange={handleChange}
                                        name="fax"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.email}
                                        onChange={handleChange}
                                        name="email"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Time Zone"
                                        select
                                        variant="outlined"
                                        fullWidth
                                        value={formData.time_zone}
                                        onChange={handleChange}
                                        name="time_zone"
                                        className={styles.formControl}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="Brisbane">Brisbane</MenuItem>
                                        <MenuItem value="Canberra">Canberra</MenuItem>
                                        <MenuItem value="Darwin">Darwin</MenuItem>
                                    </TextField>
                                </Col>
                                <Col>
                                    <TextField
                                        label="Website"
                                        name="website"
                                        fullWidth
                                        value={formData.website}
                                        onChange={handleChange}
                                        variant="outlined"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {
                                                height: "43px",
                                                borderRadius: "7px",
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>

                <Col>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Logo</Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col style={{display: "flex", gap: "0.5rem"}}>
                                    <FileUploadIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => handleIconClick()}
                                    />
                                    <Typography>or Drop file here </Typography>
                                    {
                                        logoLoading ?
                                            <CircularProgress size={20}/>
                                            :
                                            <Typography
                                                sx={{color: "blue"}}>{formData.company_logo}  </Typography>
                                    }
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{display: "none"}}
                                        name="company_logo"
                                        onChange={(e) => handleFileChange(e)} // Handle file selection
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    <Row>
                        <Col>
                            <Card className={styles.card}>
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>Government Id</Typography>
                                </div>
                                <div className={styles.cardContent}>
                                    <Row>
                                        <Col>
                                            <TextField
                                                label="NDIS Government Id"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.company_govId}
                                                onChange={handleChange}
                                                name="company_govId"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="HCP NAPS Id"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.company_hcp_naps_id}
                                                onChange={handleChange}
                                                name="company_hcp_naps_id"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="HACC Agency Id"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.company_hacc_agency_id}
                                                onChange={handleChange}
                                                name="company_hacc_agency_id"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

        </div>
    );
};

export default CompanyInfo;
