import React, {useContext, useEffect, useState} from "react";
import {Button, Col, Row} from 'react-bootstrap';
import InputField from "@/components/widgets/InputField";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, postData, putData} from "@/utility/api_utility";
import {Alert, Checkbox, IconButton, InputAdornment, Snackbar} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {getFirestore} from "firebase/firestore";
import styles from "@/styles/style.module.css";
import Typography from "@mui/material/Typography";
import ColorContext from "@/contexts/ColorContext";

// Initialize Firestore
const db = getFirestore();

const UpdateUser = ({selectedRowData, setSelectedRowData, setUserData, fetchUserData, onSave, handleModalCancel}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(selectedRowData.RoleDesc || "");
    const [group, setGroup] = useState([]);
    const [area, setArea] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(selectedRowData.UserGroup || "");
    const [selectedAreaId, setSelectedAreaId] = useState(selectedRowData.Area || "");
    const [accountingSystemAccess, setAccountingSystemAccess] = useState(selectedRowData.AccountingSystemAccess || false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    // const {colors} = useContext(ColorContext);

    useEffect(() => {
        const fetchRolesData = async () => {
            try {
                const rolesData = await fetchData(`/api/getAllRoles`);
                console.log("Roles Data:", rolesData);
                setRoles(rolesData);
            } catch (error) {
                console.error("Error fetching roles data: ", error);
            }
        };
        fetchRolesData();
    }, []);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const groupData = await fetchData(`/api/getGroup`);
                console.log("Group Data:", groupData);
                setGroup(groupData);
            } catch (error) {
                console.error("Error fetching Group data: ", error);
            }
        };
        fetchGroupData();
    }, []);

    useEffect(() => {
        const fetchAreaData = async () => {
            try {
                const areaData = await fetchData(`/api/getAreaData`);
                console.log("Area Data:", areaData);
                setArea(areaData);
            } catch (error) {
                console.error("Error fetching area data: ", error);
            }
        };
        fetchAreaData();
    }, []);

    useEffect(() => {
        setSelectedRoleId(selectedRowData.RoleDesc || '');
        console.log("Selected Role Desc:", selectedRowData.RoleDesc);
    }, [selectedRowData]);

    const handleInputChange = (event) => {
        const {id, value} = event.target;
        if (id === "UserGroup") {
            setSelectedGroupId(value);
        } else if (id === "Area") {
            setSelectedAreaId(value);
        }
        setSelectedRowData((prevState) => ({...prevState, [id]: value || ""}));

        if (id === "NewPassword" || id === "ConfirmPassword") {
            validatePassword(value);
            const newPassword = id === "NewPassword" ? value : selectedRowData.NewPassword;
            const confirmPassword = id === "ConfirmPassword" ? value : selectedRowData.ConfirmPassword;
            const passwordMatch = newPassword === confirmPassword;
            setPasswordsMatch(passwordMatch);
        } else {
            setPasswordError("");
        }

        if (id === "Email") {
            // validate email
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
            if (!emailRegex.test(value)) {
                setEmailError("Invalid email address");
            } else {
                setEmailError("");
            }
        }
    };

    const handleSave = async () => {
        if (!selectedRoleId) {
            alert("Please select a role.");
            return;
        }

        setIsSubmitting(true);

        // if the change password checkbox is checked, then u need to notify the user to change password before saving
        if (changingPassword) {
            setSnackbarMessage("Please change password before saving.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const sqlUserData = {
                User_ID: selectedRowData.ID,
                FirstName: selectedRowData.FirstName,
                LastName: selectedRowData.Lastname,
                Username: selectedRowData.Username,
                Email: selectedRowData.Email,
                Area: selectedAreaId,
                UserGroup: selectedGroupId,
                Role: selectedRoleId,
                Password: selectedRowData.Password,
                AccountingSystemAccess: selectedRowData.AccountingSystemAccess,
            };
            console.log("Firebase User Data:", {
                uid: selectedRowData.ID,
                email: selectedRowData.Email,
                password: selectedRowData.Password,
            });
            // Update Firebase and SQL data
            await putData("/api/updateUserFirebase", {
                uid: selectedRowData.ID,
                email: selectedRowData.Email,
                password: selectedRowData.Password,
            });

            const sqlResponse = await putData("/api/updateUserData", sqlUserData, window.location.href);
            console.log("API Response:", sqlResponse);

            // Fetch updated data and notify parent
            setUserData(await fetchUserData());
            onSave(selectedRowData);

            handleModalCancel(); // Close the modal
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearForm = () => {
        setSelectedRowData({
            User_ID: "",
            Username: "",
            Password: "",
            Role: "",
            Status: "",
            FirstName: "",
            Lastname: "",
            Email: "",
            Phone: "",
            Area: "",
            UserGroup: "",
            NewPassword: "",
            ConfirmPassword: "",
        });
        setSelectedRoleId("");
        handleModalCancel(); // Close the modal
    };

    // Dynamic Password Validation
    const validatePassword = (password) => {
        const upperCaseRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const numericRegex = /\d/;
        const minLength = 8;

        let error = "";
        if (!upperCaseRegex.test(password)) {
            error = "Password must contain at least 1 uppercase letter.";
        } else if (!specialCharRegex.test(password)) {
            error = "Password must contain at least 1 special character.";
        } else if (!numericRegex.test(password)) {
            error = "Password must contain at least 1 numeric character.";
        } else if (password.length < minLength) {
            error = "Password must be at least 8 characters long.";
        }

        setPasswordError(error);
    };

    const handleChangePassword = async () => {
        if (!selectedRowData.NewPassword || !selectedRowData.ConfirmPassword) {
            setSnackbarMessage("Please enter new password and confirm password.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (selectedRowData.NewPassword !== selectedRowData.ConfirmPassword) {
            setPasswordsMatch(false);
            setSnackbarMessage("Passwords do not match.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (passwordError) {
            setSnackbarMessage(passwordError);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            console.log("Selected Row Data:", selectedRowData);
            await putData("/api/updateUserFirebase", {
                uid: selectedRowData.ID,
                email: selectedRowData.email,
                password: selectedRowData.ConfirmPassword,
            });

            await putData("/api/updatePassword", {
                User_ID: selectedRowData.ID,
                NewPassword: selectedRowData.NewPassword,
                ConfirmPassword: selectedRowData.ConfirmPassword,
            });

            setSnackbarMessage("Password changed successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            try {
                const res = await postData("/api/sendUserPasswordChangeEmail", {
                    name: selectedRowData.FirstName + " " + selectedRowData.Lastname,
                    email: selectedRowData.Email,
                    password: selectedRowData.ConfirmPassword
                });

                console.log("Email sent successfully:", res);
            } catch (error) {
                console.error("Error sending password change email:", error);
            }

            // Clear password fields
            setSelectedRowData((prevState) => ({
                ...prevState,
                NewPassword: "",
                ConfirmPassword: ""
            }));
        } catch (error) {
            console.error("Error changing password:", error);
            setSnackbarMessage(`Error changing password: ${error.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    return (
        <div>

            <div className={styles.userDivStyle}>
                <Row className="mb-2 ">
                    <Col style={{marginBottom: '10px'}}>
                        <InputField id="Username" label="Username" value={selectedRowData.Username || ''}
                                    onChange={handleInputChange} disabled/>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col style={{marginBottom: '10px'}}>
                        <InputField id="FirstName" label="First Name" value={selectedRowData.FirstName || ''}
                                    onChange={handleInputChange}/>
                    </Col>
                    <Col style={{marginBottom: '10px'}}>
                        <InputField id="Lastname" label="Last Name" value={selectedRowData.Lastname || ''}
                                    onChange={handleInputChange}/>
                    </Col>
                    <Col style={{marginBottom: '10px'}}>
                        <InputField type="email" id="Email" label="Email" value={selectedRowData.Email || ''}
                                    onChange={handleInputChange}/>
                        <Typography variant="body2" color="error">{emailError}</Typography>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col style={{marginBottom: '10px'}}>
                        <InputField
                            type="select"
                            label="Group"
                            id="UserGroup"
                            value={selectedGroupId}
                            onChange={e => {
                                console.log("Selected Group:", e.target.value);
                                setSelectedGroupId(e.target.value);
                            }}
                            options={[
                                {value: '', label: 'Select Group'},
                                ...(Array.isArray(group.data) ? group.data.map(groupItem => ({
                                    value: groupItem.Groups,
                                    label: groupItem.Groups
                                })) : [])
                            ]}
                        />
                    </Col>
                    <Col style={{marginBottom: '10px'}}>
                        <InputField
                            type="select"
                            label="Area"
                            id="Area"
                            value={selectedAreaId}
                            onChange={e => {
                                console.log("Selected Area ID:", e.target.value);
                                setSelectedAreaId(e.target.value);
                            }}
                            options={[
                                {value: '', label: 'Select Area'},
                                ...(Array.isArray(area.data) ? area.data.map(areaItem => ({
                                    value: areaItem.Area,
                                    label: areaItem.Area
                                })) : [])
                            ]}
                        />
                    </Col>
                    <Col style={{marginBottom: '10px'}}>
                        <InputField type="select" label="Role" id="Role_Desc" value={selectedRoleId}
                                    onChange={e => {
                                        console.log("Selected Role ID:", e.target.value);
                                        console.log("selectedRoleId")
                                        setSelectedRoleId(e.target.value)
                                    }}
                                    options={[
                                        {value: '', label: 'Select Role'},
                                        ...roles.map(role => ({value: role.Role_Desc, label: role.Role_Desc}))
                                    ]}
                        />
                    </Col>
                </Row>
                <Col>
                    <Checkbox
                        checked={selectedRowData.AccountingSystemAccess}
                        onChange={(e) =>
                            setSelectedRowData((prevState) => ({
                                ...prevState,
                                AccountingSystemAccess: e.target.checked,
                            }))
                        }
                    />
                    Enable Accounting System Access
                </Col>
                <Checkbox
                    checked={changingPassword}
                    onChange={() => setChangingPassword(!changingPassword)}
                />{" "}
                Change Password
                {changingPassword && (
                    <div>
                        <Row className="mb-1">
                            <Col style={{marginBottom: "10px"}}>
                                <InputField
                                    id="NewPassword"
                                    label="New Password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={selectedRowData.NewPassword || ""}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    id="ConfirmPassword"
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={selectedRowData.ConfirmPassword || ""}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {!passwordsMatch && (
                                    <Typography variant="body2" color="error">Passwords do not match</Typography>
                                )}
                                {passwordError && (
                                    <Typography variant="body2" color="error">{passwordError}</Typography>
                                )}
                            </Col>
                        </Row>
                        <MButton
                            label="Change Password"
                            onClick={handleChangePassword}
                            variant={"contained"}
                            color="primary"
                        />
                    </div>
                )}
                <Row>
                    <Col>
                        <Checkbox checked={selectedRowData.Status === "Active"}
                                  onChange={() => setSelectedRowData(prevState => ({
                                      ...prevState,
                                      Status: prevState.Status === "Active" ? "Inactive" : "Active"
                                  }))}/>
                        Prevent user login to vCore, vGo and vAssessment (This does not affect billing)
                    </Col>
                </Row>
                <Row>
                    <Col style={{display: 'flex', justifyContent: 'end', marginTop: '15px', gap: "1rem"}}>
                        {/* <MButton label="Save" onClick={handleSave} variant={"contained"} color="primary"
                                     size={"small"}
                                     disabled={isSubmitting}/> */}
                        <Button onClick={handleSave} disabled={isSubmitting}
                                style={{
                                    backgroundColor: "blue",
                                    border: "none",
                                    borderRadius: "25px",
                                    width: "250px",
                                    padding: "8px 4px"
                                }}>
                            Save
                        </Button>
                        <Button label="Suspend" style={{
                            backgroundColor: "yellow",
                            border: "none",
                            borderRadius: "25px",
                            width: "250px",
                            padding: "8px 4px",
                            color: "#fff"
                        }} onClick={handleClearForm} variant={"contained"}
                                size={"small"}> Suspend </Button>
                    </Col>
                </Row>
            </div>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UpdateUser;