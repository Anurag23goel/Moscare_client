import React, {useContext, useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Popover,
    TextField,
    Typography
} from "@mui/material";
import styles from "../../../../../styles/settings.module.css"; // Assuming you use a separate CSS module
import {Col, Row} from "react-bootstrap";
import {fetchData, postData, putData} from "@/utility/api_utility";
import {SketchPicker} from 'react-color'; // Import the color picker
import style from "@/styles/style.module.css";
import ColorContext from "@/contexts/ColorContext";

const Rostering = () => {
    const [data, setData] = useState([])
    const [color, setColors] = useState({
        pastColor: '#808080',
        ongoingColor: '#3081ec',
        futureColor: '#caf0d9',
        unallocatedColor: '#fdddc6',
        draftColor: '#fffbaa',
        notStartedColor: '#D3BDF0',
        pendingForApprovalColor: '#f48fbd66',
    });
    //const {colors} = useContext(ColorContext)
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeField, setActiveField] = useState('');

    const handleColorChange = (color) => {
        setColors((prevColors) => ({
            ...prevColors,
            [activeField]: color.hex,
        }));
        setAnchorEl(null);
    };

    const handlePopoverOpen = (e, field) => {
        setAnchorEl(e.currentTarget);
        setActiveField(field);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const [formData, setFormData] = useState({
        roster_default_length: "",
        late_shift_minutes: "",
        afternoon_evening_start: "",
        afternoon_evening_end: "",
        night_start: "18:00",
        night_end: "06:00",
        lock_roster_on_or_before: "",
        auto_split_shift: false,
        allow_shift_edit_started: 'no',
        create_separate_series_per_day: 'no',
        compact: false,
        conflict_type: "",
        default_email_message: "",
        default_leave_code: "no code",
        location_roster: 'Group Client and Worker shifts',
        show_run_button: "no", // Enum 'yes' or 'no'
        roster_require_compliance: "no", // Enum 'yes' or 'no'
        display_availability_note: "no", // Enum 'yes' or 'no'
        pre_load_roster_data: false,
    });

    // Handle input change
    const handleInputChange = (event) => {
        const {name, value, type, checked} = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        const dataToSend = {
            ...formData,
            ...color
        }
        if (data && data.length != 0) {
            try {
                const response = await putData("/api/updateColorRostering", dataToSend);
                console.log("Data Updated successfully:", response);
            } catch (error) {
                console.error("Error Updating data:", error);
            }
        } else {
            try {
                const response = await postData("/api/postColorRostering", dataToSend);
                console.log("Data submitted successfully:", response.data);
            } catch (error) {
                console.error("Error submitting data:", error);
            }
        }
    };


    // Get SHift Data if exists
    const getShiftData = async () => {
        try {
            const data = await fetchData('/api/getShiftData')
            console.log("getShiftData : ", data.data);
            setData(data.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        setFormData({
            roster_default_length: data.roster_default_length || "",
            late_shift_minutes: data.late_shift_minutes || "",
            afternoon_evening_start: data.afternoon_evening_start || "",
            afternoon_evening_end: data.afternoon_evening_end || "",
            night_start: data.night_start || "",
            night_end: data.night_end || "",
            lock_roster_on_or_before: data.lock_roster_on_or_before || "",
            auto_split_shift: data.auto_split_shift || false,
            allow_shift_edit_started: data.allow_shift_edit_started || "no",
            create_separate_series_per_day: data.create_separate_series_per_day || "no",
            compact: data.compact || false,
            conflict_type: data.conflict_type || "",
            default_email_message: data.default_email_message || "",
            default_leave_code: data.default_leave_code || "no code",
            location_roster: data.location_roster || "Group Client and Worker shifts",
            show_run_button: data.show_run_button || "no", // Enum 'yes' or 'no'
            roster_require_compliance: data.roster_require_compliance || "no", // Enum 'yes' or 'no'
            display_availability_note: data.display_availability_note || "no", // Enum 'yes' or 'no'
            pre_load_roster_data: data.pre_load_roster_data || false,
        });

        setColors({
            pastColor: data.pastColor || '#808080',
            ongoingColor: data.ongoingColor || '#3081ec',
            futureColor: data.futureColor || '#caf0d9',
            unallocatedColor: data.unallocatedColor || '#fdddc6',
            draftColor: data.draftColor || '#fffbaa',
            notStartedColor: data.notStartedColor || '#D3BDF0',
            pendingForApprovalColor: data.pendingForApprovalColor || '#f48fbd66',
        })
    }, [data]);


    useEffect(() => {
        getShiftData()
    }, [])


    const update = async () => {
        const dataToSend = {
            ...formData,
            ...color

        }
        const res = await putData(`/api/updateColorRostering`, dataToSend);
        console.log(res)
    }


    return (
        <div className={styles.financeContainer}>
            <div className={styles.header}>
                <Button variant="contained" color="primary" size="small"
                        sx={{
                            backgroundColor: "blue",
                            ":hover": {
                                backgroundColor: "blue", // Prevent hover effect
                            },
                        }} className={style.maintenanceBtn} onClick={() => handleSubmit()}>
                    Save
                </Button>
            </div>
            <Row>
                <Col md={6}>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>Shift Colours</Typography>
                        </div>
                        <div className={styles.cardContentForColorRostering}>


                            {['pastColor', 'ongoingColor', 'futureColor', 'unallocatedColor', 'draftColor', 'notStartedColor', 'pendingForApprovalColor'].map((field) => (
                                <Row key={field}>
                                    <Col>
                                        <TextField
                                            label={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalize first letter of the field name
                                            name={field}
                                            variant="outlined"
                                            fullWidth
                                            value={color[field]} // Display the color hex code as the value
                                            onClick={(e) => handlePopoverOpen(e, field)} // Open color picker popover on click
                                            SelectProps={{
                                                // Prevent default behavior of the select component
                                                MenuProps: {
                                                    PaperProps: {
                                                        onClick: (e) => e.stopPropagation(), // Prevent closing the popover on select interaction
                                                    },
                                                },
                                            }}
                                            InputProps={{
                                                sx: {
                                                    height: '43px',
                                                    borderRadius: '7px',
                                                    color: '#000', // Set text color to black for contrast
                                                },
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <div
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                backgroundColor: color[field],
                                                                borderRadius: '3px',
                                                                marginRight: '8px',
                                                            }}
                                                        ></div>

                                                    </InputAdornment>
                                                ),
                                            }}
                                        >

                                        </TextField>
                                    </Col>

                                    {/* Color Picker Popover */}
                                    <Popover
                                        open={open && activeField === field}
                                        anchorEl={anchorEl}
                                        onClose={handlePopoverClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        disableRestoreFocus
                                    >
                                        <Box>
                                            <SketchPicker
                                                color={color[field]} // Current selected color
                                                onChange={handleColorChange} // Update color on change
                                            />
                                        </Box>
                                    </Popover>

                                </Row>
                            ))}


                        </div>
                    </Card>
                </Col>

                <Col>
                    <Card className={styles.card}>
                        <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                            <Typography variant="h6" color={"#fff"}>
                                Time
                            </Typography>
                        </div>
                        <div className={styles.cardContent}>
                            <Row>
                                <Col>
                                    <TextField
                                        label="Roster Default Length"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.roster_default_length}
                                        onChange={handleInputChange}
                                        name="roster_default_length"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "45px", borderRadius: "7px"},
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        label="How many minutes late consider as late shift?"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.late_shift_minutes}
                                        onChange={handleInputChange}
                                        name="late_shift_minutes"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                    />
                                </Col>
                            </Row>

                            {/* <Row>
          <Col>
            <TextField
              label="Afternoon / Evening Start"
              variant="outlined"
              type="time"
              fullWidth
              value={formData.afternoon_evening_start}
              onChange={handleInputChange}
              name="afternoon_evening_start"
              className={styles.formControl}
              InputProps={{
                sx: { height: "43px", borderRadius: "7px" },
              }}
            />
          </Col>
          <Col>
            <TextField
              label="Afternoon / Evening End"
              variant="outlined"
              type="time"
              fullWidth
              value={formData.afternoon_evening_end}
              onChange={handleInputChange}
              name="afternoon_evening_end"
              className={styles.formControl}
              InputProps={{
                sx: { height: "43px", borderRadius: "7px" },
              }}
            />
          </Col>
        </Row> */}

                            <Row>
                                <Col>
                                    <TextField
                                        label="Night Start"
                                        variant="outlined"
                                        type="time"
                                        fullWidth
                                        value={formData.night_start}
                                        onChange={handleInputChange}
                                        name="night_start"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                        disabled={true}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        label="Night End"
                                        variant="outlined"
                                        type="time"
                                        fullWidth
                                        value={formData.night_end}
                                        onChange={handleInputChange}
                                        name="night_end"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Lock Roster On And Before"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.lock_roster_on_or_before}
                                        onChange={handleInputChange}
                                        name="lock_roster_on_or_before"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.auto_split_shift}
                                            onChange={handleInputChange}
                                            name="auto_split_shift"
                                        />
                                    }
                                    label="Auto Split Shift"
                                    className={styles.formControl}
                                />
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Allow shift(s) to be edited when it has already been started by workers"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={formData.allow_shift_edit_started}
                                        onChange={handleInputChange}
                                        name="allow_shift_edit_started"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                    >
                                        <MenuItem value="yes">Yes</MenuItem>
                                        <MenuItem value="no">No</MenuItem>
                                    </TextField>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField
                                        label="Create separate series per day for roster templates"
                                        variant="outlined"
                                        select
                                        fullWidth
                                        value={formData.create_separate_series_per_day}
                                        onChange={handleInputChange}
                                        name="create_separate_series_per_day"
                                        className={styles.formControl}
                                        InputProps={{
                                            sx: {height: "43px", borderRadius: "7px"},
                                        }}
                                    >
                                        <MenuItem value='yes'>Yes</MenuItem>
                                        <MenuItem value='no'>No</MenuItem>
                                    </TextField>
                                </Col>
                            </Row>

                        </div>
                    </Card>

                    <Row>
                        <Col>
                            <Card className={styles.card}>
                                <div className={styles.cardHeader} style={{backgroundColor: "blue"}}>
                                    <Typography variant="h6" color={"#fff"}>Display</Typography>
                                </div>
                                <div className={styles.cardContent}>
                                    <Row>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.compact}
                                                    onChange={handleInputChange}
                                                    name="compact"
                                                />
                                            }
                                            label="Compact"
                                            className={styles.formControl}
                                        />
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Conflict Type"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.conflict_type}
                                                onChange={handleInputChange}
                                                name="conflict_type"
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
                                                label="Default Email Message"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.default_email_message}
                                                onChange={handleInputChange}
                                                name="default_email_message"
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
                                                label="Default Leave Code"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={formData.default_leave_code}
                                                onChange={handleInputChange}
                                                name="default_leave_code"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value='no code'>No code</MenuItem>
                                                <MenuItem value='same as shift'>same as shift</MenuItem>
                                            </TextField>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Location Roster"
                                                variant="outlined"
                                                fullWidth
                                                select
                                                value={formData.location_roster}
                                                onChange={handleInputChange}
                                                name="location_roster"
                                                className={styles.formControl}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value='Group Client and Worker shifts'>Group Client and Worker
                                                    shifts</MenuItem>
                                                <MenuItem value='List client and worker shifts'>List client and worker
                                                    shifts</MenuItem>
                                            </TextField>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Show Run Button"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={formData.show_run_button}
                                                onChange={handleInputChange}
                                                name="show_run_button"
                                                className={styles.formControl}
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px", // Set a consistent height
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="yes">Yes</MenuItem>
                                                <MenuItem value="no">No</MenuItem>
                                            </TextField>
                                            <Typography
                                                className={styles.typo}
                                                variant="body2"
                                                sx={{color: "gray"}}
                                            >
                                                Show run button in Timeline Worker (Week/Month) and Timeline Location
                                            </Typography>
                                        </Col>
                                    </Row>


                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Roster Require Compliance"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={formData.roster_require_compliance || ""}
                                                onChange={handleInputChange}
                                                name="roster_require_compliance"
                                                className={styles.formControl}
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="yes">Yes</MenuItem>
                                                <MenuItem value="no">No</MenuItem>
                                            </TextField>
                                            <Typography className={styles.typo} variant="body2" sx={{color: "gray"}}>
                                                Require worker compliance when rostering
                                            </Typography>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Client Shift Description"
                                                variant="outlined"
                                                fullWidth
                                                value={formData.client_shift_description || ""}
                                                onChange={handleInputChange}
                                                name="client_shift_description"
                                                className={styles.formControl}
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            />
                                            <Typography className={styles.typo} variant="body2" sx={{color: "gray"}}>
                                                Default: Start Time - End Time (total hrs) Service Description Service
                                                Code Carer name
                                            </Typography>
                                            <Typography className={styles.typo} variant="body2"
                                                        sx={{marginBottom: "1rem", color: "gray"}}>
                                                <strong>Valid Tags:</strong> [from_time], [to_time], [hours],
                                                [service_desc], [service_code], [carer], [roster_cat]
                                            </Typography>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Display Availability Note"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={formData.display_availability_note || ""}
                                                onChange={handleInputChange}
                                                name="display_availability_note"
                                                className={styles.formControl}
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="yes">Yes</MenuItem>
                                                <MenuItem value="no">No</MenuItem>
                                            </TextField>
                                            <Typography className={styles.typo} variant="body2" sx={{color: "gray"}}>
                                                Display availability note in Timeline Worker (Week/Month)
                                            </Typography>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <TextField
                                                label="Pre-load Roster Data"
                                                variant="outlined"
                                                select
                                                fullWidth
                                                value={formData.pre_load_roster_data || ""}
                                                onChange={handleInputChange}
                                                name="pre_load_roster_data"
                                                className={styles.formControl}
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    sx: {
                                                        height: "43px",
                                                        borderRadius: "7px",
                                                    },
                                                }}
                                            >
                                                {['1 Month', '2 Month', '3 Month', '4 Month', '5 Month', '6 Month'].map((month) => (
                                                    <MenuItem key={month} value={month}>
                                                        {month}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            <Typography className={styles.typo} variant="body2" sx={{color: "gray"}}>
                                                Pre-load data for a specified number of months in advance
                                            </Typography>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>


                </Col>
            </Row>
            <Box sx={{display: "flex", justifyContent: "right", alignItems: "center"}}>
                <Button variant="contained" sx={{
                    backgroundColor: "blue",
                    ":hover": {
                        backgroundColor: "blue", // Prevent hover effect
                    },
                }} className={style.maintenanceBtn} onClick={() => handleSubmit()}>Save</Button>
            </Box>
        </div>
    );
};

export default Rostering;
