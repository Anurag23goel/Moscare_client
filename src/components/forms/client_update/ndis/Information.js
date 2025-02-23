// Information.js
import React, {useEffect, useState} from "react";
import {Card} from "@mui/material";
import InputField from "@/components/widgets/InputField";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/ndisSlice";
import {useRouter} from "next/router";

const Information = ({setSelectedComponent, onSaveReady, isButtonClicked, setIsButtonClicked}) => {
    const router = useRouter();
    const {ClientID} = router.query;

    const dispatch = useDispatch();
    const defaultNdisForm = useSelector((state) => state.clientndis.ndisForm);
    const [prompt, setPrompt] = useState(false);
    const [ndisForm, setNdisForm] = useState(defaultNdisForm);

    const [isLoading, setIsLoading] = useState(true);

    const [disableSection, setDisableSection] = useState(false);

    // const {loading} = useContext(ColorContext);
    // if (loading) {
    //     return <Spinner/>;
    // }

    // If their is any value in db table then it return that else it will written default value
    const mergeDetailsData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] === "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    const fetchDataAsync = async () => {
        setIsLoading(true);

        // Fetching data from db
        const ndisInfo = await fetchData(
            `/api/getClientNdisInfo/${ClientID}`,
            window.location.href
        );

        if (ndisInfo.length === 0) {
            // If no data found then dont show anything
            setIsLoading(false);
            return;
        }

        const fetchedNdisForm = {
            // Information
            NDISNo: ndisInfo[0].NDISNo,
            Aspirations: ndisInfo[0].Aspirations,
            DailyLife: ndisInfo[0].DailyLife,
            LivingOpt: ndisInfo[0].LivingOpt,
            OtherLivingArrangement: ndisInfo[0].OtherLivingArrangement,
            InformalSupports: ndisInfo[0].InformalSupports,
            OtherSupports: ndisInfo[0].OtherSupports,
            Participation: ndisInfo[0].Participation,
            BudgetMgnt: ndisInfo[0].BudgetMgnt,
            Note: ndisInfo[0].Note,
        };

        const mergedNdisForm = mergeDetailsData(defaultNdisForm, fetchedNdisForm);

        setNdisForm(mergedNdisForm); // stores merged value

        setIsLoading(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (prompt) {
                const confirmDelete = window.confirm(
                    "You have unsaved changes. Do you want to save them before they are automatically removed?"
                );
                if (!confirmDelete) {
                    dispatch(deleteData());
                    fetchDataAsync();
                } else {
                    handleSaveButton();
                    dispatch(deleteData());
                    fetchDataAsync();
                }
            }
            setPrompt(false);
        }, 60 * 60 * 1000); // 60 minutes in milliseconds

        return () => clearTimeout(timeoutId);
    }, [prompt]);

    useEffect(() => {
        if (ClientID) {
            fetchDataAsync();
        } else {
            console.log("ClientID not found");
        }
        fetchUserRoles("m_cprofile", "Client_Profile_NDIS", setDisableSection);
    }, [ClientID]);

    const handleChange = (event) => {
        setNdisForm((prevState) => {
            const updatedState = {
                ...prevState,
                [event.target.id]: event.target.value,
            };
            dispatch(upsertData(updatedState));
            return updatedState;
        });

        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleSaveButton = () => {
        // Information
        const data1 = {
            NDISNo: ndisForm.NDISNo,
            Aspirations: ndisForm.Aspirations,
            DailyLife: ndisForm.DailyLife,
            LivingOpt: ndisForm.LivingOpt,
            OtherLivingArrangement: ndisForm.OtherLivingArrangement,
            InformalSupports: ndisForm.InformalSupports,
            OtherSupports: ndisForm.OtherSupports,
            Participation: ndisForm.Participation,
            BudgetMgnt: ndisForm.BudgetMgnt,
            Note: ndisForm.Note,
        };

        putData(
            `/api/upsertClientNdisInfo/${ClientID}`,
            {
                data: data1,
            },
            window.location.href
        ).then((response) => {
        });

        dispatch(deleteData());
        fetchDataAsync();
    };

    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for NDIS information...");
            onSaveReady("NDIS", handleSaveButton()); // Register handleSaveButton for Profile

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    return (
        <>
            <div
                style={{
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <Card
                    style={{
                        backgroundColor: "#f9f9f9",
                        borderTopRightRadius: "0px",
                        borderTopLeftRadius: "0px",
                        borderBottomLeftRadius: "15px",
                        borderBottomRightRadius: "15px",
                        borderLeft: "1px solid",
                        borderBottom: "1px solid",
                        borderRight: "1px solid",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                        width: "100%",
                        padding: "2rem",
                        alignItems: "flex-start",
                    }}
                >
                    <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>NDIS Information</h4>
                    <Row>
                        <Col>
                            <InputField
                                label="NDIS Number"
                                type="number"
                                id="NDISNo"
                                value={ndisForm.NDISNo}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Statement of Goals and Aspirations"
                                type="text"
                                id="Aspirations"
                                value={ndisForm.Aspirations}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputField
                                label="My Daily Life"
                                type="text"
                                id="DailyLife"
                                value={ndisForm.DailyLife}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Living Arrangements"
                                type="select"
                                id="LivingOpt"
                                value={ndisForm.LivingOpt}
                                onChange={handleChange}
                                disabled={disableSection}
                                options={[
                                    {value: "", label: "NONE"},
                                    {value: "Lives Alone", label: "Lives Alone"},
                                    {
                                        value: "Lives with Family",
                                        label: "Lives with Family",
                                    },
                                    {
                                        value: "Lives with friends / housemate",
                                        label: "Lives with friends / housemate",
                                    },
                                    {
                                        value: "Supported Residential Services (SRS)",
                                        label: "Supported Residential Services (SRS)",
                                    },
                                    {
                                        value: "Supported Independent Living (SIL)",
                                        label: "Supported Independent Living (SIL)",
                                    },
                                    {
                                        value: "Supported Disability Accommodation (SDA)",
                                        label: "Supported Disability Accommodation (SDA)",
                                    },
                                    {value: "Homeless", label: "Homeless"},
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputField
                                label="Other Living Arrangement"
                                type="text"
                                id="OtherLivingArrangement"
                                value={ndisForm.OtherLivingArrangement}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Informal Community Supports"
                                type="text"
                                id="InformalSupports"
                                value={ndisForm.InformalSupports}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputField
                                label="Other Community Supports"
                                type="text"
                                id="OtherSupports"
                                value={ndisForm.OtherSupports}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Social and Economic Participation"
                                type="text"
                                id="Participation"
                                value={ndisForm.Participation}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <InputField
                                label="How is the budget managed?"
                                type="select"
                                id="BudgetMgnt"
                                value={ndisForm.BudgetMgnt}
                                onChange={handleChange}
                                disabled={disableSection}
                                options={[
                                    {value: "", label: "NONE"},
                                    {value: "Self-managed", label: "Self-managed"},
                                    {value: "NDIA managed", label: "NDIA managed"},
                                    {value: "Plan managed", label: "Plan managed"},
                                    {
                                        value: "NDIA and Plan managed",
                                        label: "NDIA and Plan managed",
                                    },
                                    {
                                        value: "Part NDIA and Part Self-managed",
                                        label: "Part NDIA and Part Self-managed",
                                    },
                                    {
                                        value: "Part Plan and Part Self-managed",
                                        label: "Part Plan and Part Self-managed",
                                    },
                                    {value: "Agency managed", label: "Agency managed"},
                                    {value: "Provider managed", label: "Provider managed"},
                                    {
                                        value: "Automated transport payments",
                                        label: "Automated transport payments",
                                    },
                                ]}
                            />
                        </Col>
                        <Col>
                            <InputField
                                label="Note"
                                type="text"
                                id="Note"
                                value={ndisForm.Note}
                                onChange={handleChange}
                                disabled={disableSection}
                            />
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
};

export default Information;
