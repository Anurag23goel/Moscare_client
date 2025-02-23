import {Card, Checkbox} from "@mui/material";
import React, {useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import MButton from "@/components/widgets/MaterialButton";
import {fetchData, fetchUserRoles, putData} from "@/utility/api_utility";
import {useDispatch, useSelector} from "react-redux";
import {deleteData, upsertData} from "@/redux/client/preferencesSlice";
import {useRouter} from "next/router";
import PreferedWorker from "./preferedworker/preferedWorker";
import NonPreferedWorker from "./nonpreferedworker/nonPreferedWorker";
import WorkerCompliance from "./workercompliance/wokerCompliance";
import {MdOutlineDeleteForever} from "react-icons/md";
import {Col, Container, Row} from 'react-bootstrap';

const Preferences = ({setPreferencesEdit, setSelectedComponent}) => {
    const router = useRouter();
    const {ClientID} = router.query;
    const dispatch = useDispatch();
    const defaultPreferencesForm = useSelector(
        (state) => state.clientpreferences.preferencesForm
    );
    const [prompt, setPrompt] = useState(false);
    const [skillsData, setSkillsData] = useState([]);
    const [trainingData, setTrainingData] = useState([]);
    const [gender, setGender] = useState([]);
    const [cultureData, setCultureData] = useState([]);
    const [interestsData, setInterestsData] = useState([]);
    const [preferencesForm, setPreferencesForm] = useState(
        defaultPreferencesForm
    );
    const [language, setLanguage] = useState("");
    const [disableSection, setDisableSection] = useState(false);
    // If their is any value in db table then it return that else it will written default value
    const mergePreferencesData = (defaultData, fetchedData) => {
        const mergedData = {...defaultData};
        for (const key in fetchedData) {
            if (mergedData[key] == "") {
                mergedData[key] = fetchedData[key];
            }
        }
        return mergedData;
    };

    // fetch data from db
    const fetchDataAsync = async () => {
        const preferenceData = await fetchData(
            `/api/getClientPreferencesData/${ClientID}`,
            window.location.href
        );
        const fetchskill = await fetchData(`/api/getSkills`, window.location.href);
        const fetchculture = await fetchData(
            `/api/getCulture`,
            window.location.href
        );
        const fetchinterests = await fetchData(
            `/api/getInterests`,
            window.location.href
        );
        const fetchtraining = await fetchData(
            `/api/getTrainingItems`,
            window.location.href
        );
        const fetchgenderData = await fetchData(
            'api/getGenderData',
            window.location.href
        )

        const fetchedPreferencesForm = {
            skills: preferenceData.data[0]?.Skills
                ? JSON.parse(preferenceData.data[0].Skills)
                : [],
            training: preferenceData.data[0]?.Training
                ? JSON.parse(preferenceData.data[0].Training)
                : [],
            language: preferenceData.data[0]?.Language
                ? JSON.parse(preferenceData.data[0].Language)
                : [],
            culture: preferenceData.data[0]?.Culture
                ? JSON.parse(preferenceData.data[0].Culture)
                : [],
            interests: preferenceData.data[0]?.Interests
                ? JSON.parse(preferenceData.data[0].Interests)
                : [],
            nonSmoker: preferenceData.data[0]?.NonSmoker,
            petFriendly: preferenceData.data[0]?.PetFriendly,
            gender: preferenceData.data[0]?.Gender,
            addtionalPreferences: preferenceData.data[0]?.AddtionalPreferences,
        };

        const mergedPreferencesForm = mergePreferencesData(
            defaultPreferencesForm,
            fetchedPreferencesForm
        );

        setSkillsData(fetchskill.data);
        setCultureData(fetchculture.data);
        setInterestsData(fetchinterests.data);
        setTrainingData(fetchtraining.data);
        setGender(fetchgenderData.data);

        setPreferencesForm(mergedPreferencesForm); // stores merged value
    };

    // handle save button
    const handleSaveButton = () => {
        const data = {
            Gender: preferencesForm.gender,
            Skills: preferencesForm.skills,
            Training: preferencesForm.training,
            Language: preferencesForm.language,
            Culture: preferencesForm.culture,
            Interests: preferencesForm.interests,
            NonSmoker: preferencesForm.nonSmoker,
            PetFriendly: preferencesForm.petFriendly,
            AddtionalPreferences: preferencesForm.addtionalPreferences,
        };

        putData(
            `/api/updateClientPreferencesData/${ClientID}`,
            {
                data: data,
            },
            window.location.href
        ).then((response) => {
            console.log("Response:", response);
        });

        dispatch(deleteData());
        fetchDataAsync();
        setPreferencesEdit(false);
        // you should keep one blank space after the preferences
        setSelectedComponent("Preferences ");
    };

    const handleChange = (event) => {
        setPreferencesEdit(true);
        setSelectedComponent("Preferences *");
        const value =
            event.target.name === "checkbox"
                ? event.target.checked
                : event.target.value;

        setPreferencesForm((prevState) => {
            const updatedState = {...prevState, [event.target.id]: value};
            dispatch(upsertData(updatedState));
            return updatedState;
        });
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleLanguage = (event) => {
        setPreferencesEdit(true);
        setSelectedComponent("Preferences *");
        const value = event.target.value;

        setLanguage(value);
        setTimeout(() => {
            setPrompt(true);
        }, 10 * 1000);
    };

    const handleSaveLanguage = () => {
        setPreferencesForm((prevForm) => {
            const updatedForm = {
                ...prevForm,
                language: [...prevForm.language, language],
            };
            dispatch(upsertData(updatedForm));
            setLanguage("");
            return updatedForm;
        });
    };

    const handleDelete = (id) => {
        setPreferencesEdit(true);
        setSelectedComponent("Preferences *");
        setPreferencesForm((prevForm) => ({
            ...prevForm,
            language: prevForm.language.filter((_, i) => i !== id),
        }));
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
        fetchUserRoles('m_cprofile', 'Client_Profile_Preferences', setDisableSection);
    }, [ClientID]);

    return (
        <div
            style={{
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div>
                <Card
                    style={{
                        backgroundColor: "#f9f9f9",
                        marginTop: "1rem",
                        marginLeft: "2rem",
                        borderRadius: "15px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                        width: "80vw",
                        padding: "1rem 2rem",
                        alignItems: "flex-start",
                    }}
                >
                    <Container>
                        <Row className="mt-4">
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    type={"select"}
                                    label={"Gender:"}
                                    id={"gender"}
                                    disabled={disableSection}
                                    value={preferencesForm.gender}
                                    options={gender.map((form) => ({
                                        label: form.ParamDesc,
                                        value: form.ParamValue,
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    type={"select"}
                                    label={"Skills:"}
                                    multiple
                                    id={"skills"}
                                    disabled={disableSection}
                                    value={preferencesForm.skills}
                                    options={skillsData?.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    type={"select"}
                                    label={"Interests:"}
                                    multiple
                                    id={"interests"}
                                    value={preferencesForm.interests}
                                    options={interestsData?.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    type={"select"}
                                    label={"Training:"}
                                    multiple
                                    id={"training"}
                                    value={preferencesForm.training}
                                    options={trainingData?.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col md={3}>
                                <InputField
                                    onChange={handleLanguage}
                                    disabled={disableSection}
                                    type={"text"}
                                    label={"Language:"}
                                    id={"language"}
                                    value={language}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    type={"select"}
                                    label={"Culture:"}
                                    multiple
                                    id={"culture"}
                                    value={preferencesForm.culture}
                                    options={cultureData?.map((form) => ({
                                        value: form.Description,
                                        label: form.Description,
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    onChange={handleChange}
                                    type={"textarea"}
                                    label={"Addtional Preferences:"}
                                    disabled={disableSection}
                                    id={"addtionalPreferences"}
                                    value={preferencesForm.addtionalPreferences}
                                />
                            </Col>

                        </Row>
                        <Row>
                            <Col>
                                <Checkbox
                                    name={"checkbox"}
                                    id={"petFriendly"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    checked={preferencesForm.petFriendly}
                                />
                                Pet Friendly
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Checkbox
                                    name={"checkbox"}
                                    id={"nonSmoker"}
                                    onChange={handleChange}
                                    disabled={disableSection}
                                    checked={preferencesForm.nonSmoker}
                                />
                                Non Smoker
                            </Col>
                        </Row>
                    </Container>


                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <MButton
                            variant="contained"
                            onClick={handleSaveLanguage}
                            label={"Save Language"}
                            disabled={disableSection}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            width: "100vw",
                            textTransform: "capitalize",
                            gap: "1rem",
                            fontSize: "1rem",
                        }}
                    >
                        {preferencesForm.language.map((item, id) => (
                            <div key={id} style={{display: "flex", alignItems: "center"}}>
                                <p>{item}</p>
                                <div
                                    style={{
                                        fontSize: "large",
                                        color: "red",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleDelete(id)}
                                >
                                    <MdOutlineDeleteForever/>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div style={{width: "70vw"}}>
                <PreferedWorker/>
                <NonPreferedWorker/>
                <WorkerCompliance/>
            </div>
        </div>
    );
};

export default Preferences;
