import React, {useEffect, useState} from "react";
import Row from "@/components/widgets/utils/Row";
import {Col} from "react-bootstrap";
import InputField from "@/components/widgets/InputField";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/ndisSlice";
import {useRouter} from "next/router";

const Highintensity = ({onSaveReady, isButtonClicked, setIsButtonClicked}) => {
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


    useEffect(() => {
        if (isButtonClicked) {
            console.log("Registering save function for NDIS HighIntensity...");
            onSaveReady("NDIS", handleSaveButton()); // Register handleSaveButton for Profile

            // Reset after registration
            setIsButtonClicked(false);
        }
    }, [isButtonClicked, onSaveReady, setIsButtonClicked]);

    const fetchDataAsync = async () => {
        setIsLoading(true);

        // Fetching data from db
        const ndisHCC = await fetchData(
            `/api/getClientNdisHCC/${ClientID}`,
            window.location.href
        );

        if (ndisHCC.length === 0) {
            // If no data found then dont show anything
            setIsLoading(false);
            return;
        }

        const fetchedNdisForm = {
            // High Intensity/Complex Care
            BowelCare: ndisHCC[0].BowelCare,
            BowelCareNote: ndisHCC[0].BowelCareNote,
            EnteralFeeding: ndisHCC[0].EnteralFeeding,
            EnteralFeedingNote: ndisHCC[0].EnteralFeedingNote,
            SubcutaneousInjections: ndisHCC[0].SubcutaneousInjections,
            SubcutaneousInjectionsNote: ndisHCC[0].SubcutaneousInjectionsNote,
            SevereDysphagia: ndisHCC[0].SevereDysphagia,
            SevereDysphagiaNote: ndisHCC[0].SevereDysphagiaNote,
            Tracheostomy: ndisHCC[0].Tracheostomy,
            TracheostomyNote: ndisHCC[0].TracheostomyNote,
            UrinaryCatheter: ndisHCC[0].UrinaryCatheter,
            UrinaryCatheterNote: ndisHCC[0].UrinaryCatheterNote,
            Ventilation: ndisHCC[0].Ventilation,
            VentilationNote: ndisHCC[0].VentilationNote,
            Diabetes: ndisHCC[0].Diabetes,
            DiabetesNote: ndisHCC[0].DiabetesNote,
            Seizure: ndisHCC[0].Seizure,
            SeizureNote: ndisHCC[0].SeizureNote,
            PressureCareWounds: ndisHCC[0].PressureCareWounds,
            PressureCareWoundsNote: ndisHCC[0].PressureCareWoundsNote,
            MealPreparationDelivery: ndisHCC[0].MealPreparationDelivery,
            MealPreparationDeliveryNote: ndisHCC[0].MealPreparationDeliveryNote,
            StomaCare: ndisHCC[0].StomaCare,
            StomaCareNote: ndisHCC[0].StomaCareNote,
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
        // High Intensity/Complex Care
        const data2 = {
            BowelCare: ndisForm.BowelCare,
            BowelCareNote: ndisForm.BowelCareNote,
            EnteralFeeding: ndisForm.EnteralFeeding,
            EnteralFeedingNote: ndisForm.EnteralFeedingNote,
            SubcutaneousInjections: ndisForm.SubcutaneousInjections,
            SubcutaneousInjectionsNote: ndisForm.SubcutaneousInjectionsNote,
            SevereDysphagia: ndisForm.SevereDysphagia,
            SevereDysphagiaNote: ndisForm.SevereDysphagiaNote,
            Tracheostomy: ndisForm.Tracheostomy,
            TracheostomyNote: ndisForm.TracheostomyNote,
            UrinaryCatheter: ndisForm.UrinaryCatheter,
            UrinaryCatheterNote: ndisForm.UrinaryCatheterNote,
            Ventilation: ndisForm.Ventilation,
            VentilationNote: ndisForm.VentilationNote,
            Diabetes: ndisForm.Diabetes,
            DiabetesNote: ndisForm.DiabetesNote,
            Seizure: ndisForm.Seizure,
            SeizureNote: ndisForm.SeizureNote,
            PressureCareWounds: ndisForm.PressureCareWounds,
            PressureCareWoundsNote: ndisForm.PressureCareWoundsNote,
            MealPreparationDelivery: ndisForm.MealPreparationDelivery,
            MealPreparationDeliveryNote: ndisForm.MealPreparationDeliveryNote,
            StomaCare: ndisForm.StomaCare,
            StomaCareNote: ndisForm.StomaCareNote,
        };

        putData(
            `/api/upsertClientNdisHCC/${ClientID}`,
            {
                data: data2,
            },
            window.location.href
        ).then((response) => {
        });

        dispatch(deleteData());
        fetchDataAsync();
    };

    return (
        <div
            style={{
                backgroundColor: "#f9f9f9",
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
            <div>
                <h4 style={{fontWeight: "600", marginBottom: "1rem"}}>NDIS High Intensity/Complex Care</h4>
                <Row>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Bowel Care"
                            type="select"
                            id="BowelCare"
                            value={ndisForm.BowelCare}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}

                        />
                        <InputField
                            label="Bowel Care Note"
                            type="text"
                            id="BowelCareNote"
                            value={ndisForm.BowelCareNote}
                            onChange={handleChange}
                            disabled={disableSection}

                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Enteral Feeding"
                            type="select"
                            id="EnteralFeeding"
                            value={ndisForm.EnteralFeeding}
                            onChange={handleChange}
                            disabled={disableSection}

                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Enteral Feeding Note"
                            type="text"
                            id="EnteralFeedingNote"
                            value={ndisForm.EnteralFeedingNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Subcutaneous Injections"
                            type="select"
                            id="SubcutaneousInjections"
                            value={ndisForm.SubcutaneousInjections}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Subcutaneous Injections Note"
                            type="text"
                            id="SubcutaneousInjectionsNote"
                            value={ndisForm.SubcutaneousInjectionsNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Severe Dysphagia"
                            type="select"
                            id="SevereDysphagia"
                            value={ndisForm.SevereDysphagia}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Severe Dysphagia Note"
                            type="text"
                            id="SevereDysphagiaNote"
                            value={ndisForm.SevereDysphagiaNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Tracheostomy"
                            type="select"
                            id="Tracheostomy"
                            value={ndisForm.Tracheostomy}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Tracheostomy Note"
                            type="text"
                            id="TracheostomyNote"
                            value={ndisForm.TracheostomyNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Urinary Catheter"
                            type="select"
                            id="UrinaryCatheter"
                            value={ndisForm.UrinaryCatheter}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Urinary Catheter Note"
                            type="text"
                            id="UrinaryCatheterNote"
                            value={ndisForm.UrinaryCatheterNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Ventilation"
                            type="select"
                            id="Ventilation"
                            value={ndisForm.Ventilation}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Ventilation Note"
                            type="text"
                            id="VentilationNote"
                            value={ndisForm.VentilationNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Diabetes"
                            type="select"
                            id="Diabetes"
                            value={ndisForm.Diabetes}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Diabetes Note"
                            type="text"
                            id="DiabetesNote"
                            value={ndisForm.DiabetesNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Seizure"
                            type="select"
                            id="Seizure"
                            value={ndisForm.Seizure}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Seizure Note"
                            type="text"
                            id="SeizureNote"
                            value={ndisForm.SeizureNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Pressure Care & Wounds"
                            type="select"
                            id="PressureCareWounds"
                            value={ndisForm.PressureCareWounds}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Pressure Care & Wounds Note"
                            type="text"
                            id="PressureCareWoundsNote"
                            value={ndisForm.PressureCareWoundsNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Meal Preparation & Delivery"
                            type="select"
                            id="MealPreparationDelivery"
                            value={ndisForm.MealPreparationDelivery}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Meal Preparation & Delivery Note"
                            type="text"
                            id="MealPreparationDeliveryNote"
                            value={ndisForm.MealPreparationDeliveryNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column", gap: "1.2rem"}}>
                        <InputField
                            label="Stoma Care"
                            type="select"
                            id="StomaCare"
                            value={ndisForm.StomaCare}
                            onChange={handleChange}
                            disabled={disableSection}
                            options={[
                                {value: "", label: ""},
                                {value: "YES-S", label: "Yes - To be supported"},
                                {
                                    value: "YES-N",
                                    label: "Yes - Not to be supported",
                                },
                                {value: "NO", label: "No"},
                            ]}
                        />
                        <InputField
                            label="Stoma Care Note"
                            type="text"
                            id="StomaCareNote"
                            value={ndisForm.StomaCareNote}
                            onChange={handleChange}
                            disabled={disableSection}
                        />
                    </Col>
                </Row>
            </div>

        </div>
    );
};

export default Highintensity;