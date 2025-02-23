// pages/operations/quote.js
import React, {useContext, useEffect, useState} from "react";
import InputField from "@/components/widgets/InputField";
import Button from "@/components/widgets/MaterialButton";
import {fetchData, postData} from "@/utility/api_utility";
import {useRouter} from "next/router";
import {Col, Container, Row} from "react-bootstrap";
import styles from "@/styles/style.module.css";
import ColorContext from "@/contexts/ColorContext";


const Quote = () => {
    const [clients, setClient] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [area, setArea] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedLoc, setSelectedLoc] = useState('');
    const [payer, setPayer] = useState([]);
    const [selectedPayer, setSelectedPayer] = useState('');
    const [selectedQuoteStatus, setSelectedQuoteStatus] = useState('');
    const [form, setForm] = useState({
        ClientLead: "",
        DateOfQuote: "",
        ClientFirstName: "",
        ClientLastName: "",
        DateOfBirth: "",
        Phone1: "",
        Email: "",
        QuoteStatus: "",
        FollowUpDate: "",
        ClientAddressLine1: "",
        ClientAddressLine2: "",
        Suburb: "",
        PostCode: "",
        State: "",
        MyAgedCareNumber: "",
        StartDate: "",
        EndDate: "",
        Payer: "",
        Loaction: "",
        Area: "",
        NdisNumber: "",
        FundingType: "",
        QuoteName: "",
        KM: "",
        MakerUser: "",
        MakerDate: "",
        UpdateUser: "",
        UpdateDate: "",
    });

    const router = useRouter();


    const fetchClients = async () => {
        try {
            const clientData = await fetchData(`/api/getActiveClientMasterData`, window.location.href);
            setClient(clientData.data); // Set the fetched services to the state
            console.log(clientData.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    const fetchClientsAddress = async () => {
        try {
            const clientArea = await fetchData(`/api/getClientDetailsAddressSpecificDataAll`, window.location.href);
            setArea(clientArea.data); // Set the fetched services to the state
            console.log(clientArea.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    const fetchPayer = async () => {
        try {
            const payerData = await fetchData(`/api/getPayer`, window.location.href);
            setPayer(payerData.data); // Set the fetched services to the state
            console.log(payerData.data);
        } catch (error) {
            console.error("Error fetching client services:", error);
        }
    };

    useEffect(() => {

        fetchClients();
        fetchClientsAddress();
        fetchPayer();
    }, []);


    const handleInputChange = (event) => {
        const {id, value} = event.target;
        setFormData((prevState) => ({...prevState, [id]: value}));
    };

    const handleSave = async () => {
        try {
            const data = await postData("/api/postQuoteData", formData, window.location.href);
            console.log("Save response:", data);
            router.push("/operations/quotes");
        } catch (error) {
            console.error("Error saving new quote data:", error);
        }
    };

    // const {colors, loading} = useContext(ColorContext);
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.id]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = {
            ClientLead: form.ClientLead,
            DateOfQuote: form.DateOfQuote,
            ClientFirstName: form.ClientFirstName,
            ClientLastName: form.ClientLastName,
            DateOfBirth: form.DateOfBirth,
            Phone1: form.Phone1,
            Email: form.Email,
            QuoteStatus: form.QuoteStatus,
            FollowUpDate: form.FollowUpDate,
            ClientAddressLine1: form.ClientAddressLine1,
            ClientAddressLine2: form.ClientAddressLine2,
            Suburb: form.Suburb,
            PostCode: form.PostCode,
            State: form.State,
            MyAgedCareNumber: form.MyAgedCareNumber,
            StartDate: form.StartDate,
            EndDate: form.EndDate,
            Payer: form.Payer,
            Loaction: form.Loaction,
            Area: form.Area,
            NdisNumber: form.NdisNumber,
            FundingType: form.FundingType,
            QuoteName: form.QuoteName,
            KM: form.KM,
            MakerUser: "John",
            MakerDate: null,
            UpdateUser: null,
            UpdateDate: null,
        };
    }

    // const handleClearForm = () => {
    //    setFormData({
    //       ClientLead: "",
    //       DateOfQuote: "",
    //       ClientFirstName: "",
    //       ClientLastName: "",
    //       DateOfBirth: "",
    //       Phone1: "",
    //       Email: "",
    //       QuoteStatus: "",
    //       FollowUpDate: "",
    //       ClientAddressLine1: "",
    //       ClientAddressLine2: "",
    //       Suburb: "",
    //       PostCode: "",
    //       State: "",
    //       MyAgedCareNumber: "",
    //       StartDate: "",
    //       EndDate: "",
    //       Payer: "",
    //       Loaction: "",
    //       Area: "",
    //       NdisNumber: "",
    //       FundingType: "",
    //       QuoteName: "",
    //       KM: "",
    //       MakerUser: "",
    //       MakerDate: "",
    //       UpdateUser: "",
    //       UpdateDate: "",
    //    });
    // };

    return (
        <div>
            <form
                style={{padding: "1rem", transition: "all 0.5s"}}
                // onSubmit={handleSubmit}
            >
                <Container className={styles.QuoteContainer}>
                    <div style={{margin: "0px 30px 0px 30px"}}>
                        <Row className="mt-3">
                            <Col md={3}>
                                <InputField
                                    label="Client/Lead"
                                    type="select"
                                    id="ClientLead"

                                    // value={form.ClientLead}
                                    value={selectedClient}
                                    onChange={(e) => {
                                        setSelectedClient(e.target.value);
                                        setSelectedArea(e.target.value);
                                    }}
                                    options={clients.map(client => ({
                                        value: client.ClientID,
                                        label: `${client.FirstName} ${client.LastName}`,
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="Date Of Quote"
                                    type="date"
                                    id="DateOfQuote"
                                    value={form.DateOfQuote}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Client FirstName"
                                    type="text"
                                    id="ClientFirstName"
                                    value={form.ClientFirstName}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Client LastName"
                                    type="text"
                                    id="ClientLastName"
                                    value={form.ClientLastName}
                                    onChange={handleChange}
                                />
                            </Col>

                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <InputField
                                    label="Date Of Birth"
                                    type="date"
                                    id="DateOfBirth"
                                    value={form.DateOfBirth}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Phone1"
                                    type="text"
                                    id="Phone1"
                                    value={form.Phone1}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Email"
                                    type="text"
                                    id="Email"
                                    value={form.Email}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Quote Status"
                                    type="select"
                                    id="QuoteStatus"

                                    // value={form.QuoteStatus}
                                    value={selectedQuoteStatus}
                                    onChange={(e) => setSelectedQuoteStatus(e.target.value)}
                                    options={[
                                        {value: 'lead', label: 'Lead'},
                                        {value: 'inProgress', label: 'In Progress'},
                                        {value: 'pending', label: 'Pending'},
                                        {value: 'won', label: 'Won'},
                                        {value: 'lost', label: 'Lost'},
                                        {value: 'superceded', label: 'Superceded'},
                                        {value: 'redundant', label: 'Redundant'},
                                    ]}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <InputField
                                    label="Client Address Line1"
                                    type="text"
                                    id="ClientAddressLine1"
                                    value={form.ClientAddressLine1}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Client Address Line2"
                                    type="text"
                                    id="ClientAddressLine2"
                                    value={form.ClientAddressLine2}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="Location"
                                    type="select"

                                    id="Loaction"
                                    // value={form.Loaction}
                                    value={selectedLoc}
                                    onChange={(e) => setSelectedLoc(e.target.value)}
                                    options={area.map(area => ({
                                        value: area.ClientID,
                                        label: area.State,
                                    }))}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Payer"
                                    type="select"
                                    id="Payer"
                                    // value={form.Payer}
                                    value={selectedPayer}
                                    onChange={(e) => setSelectedPayer(e.target.value)}
                                    options={payer.map(pay => ({
                                        value: pay.ID,
                                        label: pay.Description,
                                    }))}
                                />
                            </Col>


                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <InputField
                                    label="Suburb"
                                    type="text"
                                    id="Suburb"
                                    value={form.Suburb}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="Area"
                                    type="select"
                                    id="Area"
                                    // value={form.Area}
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    options={area.map(area => ({
                                        value: area.ClientID,
                                        label: area.AddressLine1,
                                    }))}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="State"
                                    type="text"
                                    id="State"
                                    value={form.State}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="PostCode"
                                    type="text"
                                    id="PostCode"
                                    value={form.PostCode}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <InputField
                                    label="StartDate"
                                    type="date"
                                    id="StartDate"
                                    value={form.StartDate}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="EndDate"
                                    type="date"
                                    id="EndDate"
                                    value={form.EndDate}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="MyAgedCareNumber"
                                    type="text"
                                    id="MyAgedCareNumber"
                                    value={form.MyAgedCareNumber}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col>
                                <InputField
                                    label="Follow Up Date"
                                    type="date"
                                    id="FollowUpDate"
                                    value={form.FollowUpDate}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={3}>
                                <InputField
                                    label="NdisNumber"
                                    type="text"
                                    id="NdisNumber"
                                    value={form.NdisNumber}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="Funding Type"
                                    type="select"
                                    id="FundingType"
                                    value={form.FundingType}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="QuoteName"
                                    type="text"
                                    id="QuoteName"
                                    value={form.QuoteName}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={3}>
                                <InputField
                                    label="KM"
                                    type="text"
                                    id="KM"
                                    value={form.KM}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row className=" mt-3">
                            <Col className="d-flex justify-content-between">
                                <Button
                                    style={{backgroundColor: "blue"}}
                                    type="submit"
                                    label="Save Quote"
                                    variant={"contained"}
                                    size={"big"}
                                />
                            </Col>
                        </Row>
                    </div>
                </Container>

                <Container className={styles.QuoteContainer}>
                    <div style={{margin: "0px 30px 0px 30px"}}>
                        <b>Save the start and end date to be able to add services</b>
                    </div>
                </Container>

                <Container className={styles.QuoteContainer}>
                    <div style={{margin: "0px 30px 0px 30px"}}>
                        <Row>
                            <Col md={4}>
                                <h6>Total Budget: <b>$0.00</b></h6>
                            </Col>
                            <Col md={4}>
                                <h6>Total Scheduled Price: <b>$0.00</b></h6>
                            </Col>
                            <Col md={4}>
                                <h6>Total Hours: <b>0</b></h6>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </form>


        </div>
    );
};

export default Quote;
