import React, {useContext, useEffect, useState} from "react";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateMailerTemplate, {
    fetchMailerData
} from "@/components/forms/maintenance/template/mailer_template/update_mailer_template";
import Cookies from 'js-cookie';

const MailerTemplate = () => {
    const [showForm, setShowForm] = useState(false);
    const [output, setOutput] = useState("");
    const [form, setForm] = useState({
        Name: "",
        Subject: "",
        Body: "",
        UserId: ""
    });

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            UserId: Cookies.get('User_ID') || ''
        }))
    }, [])

    const [mailerData, setMailerData] = useState([])

    useEffect(() => {
        const fetchAndsetMailerData = async () => {
            const data = await fetchMailerData();
            setMailerData(data);
        };
        fetchAndsetMailerData();
    }, []);

    // const {colors, loading} = useContext(ColorContext);


    const handleSubmit = async () => {
        // setIsSubmitting(true);
        console.log("first", form)
        try {
            const data = await postData("/api/postMailerTemplateData", form)
            console.log(data)
        } catch (e) {
            console.log(e)
        }
        setShowForm(false);
    };

    const clearForm = () => {
        setOutput("");
        setForm({
            Name: "",
            Subject: "",
            Body: ""
        });
    };

    const handleModalCancel = () => {
        clearForm();
        setOutput("");
        setShowForm(false);
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    const handleChange = ({id, value}) => {
        setForm((prevState) => ({...prevState, [id]: value}));
    };

    const fields = [
        {
            id: "Name",
            label: "Name",
            placeholder: "Enter template name",
            type: "text",
        },
        {
            id: "Subject",
            label: "Subject",
            placeholder: "Enter template subject",
            type: "text",
        },
        {
            id: "Body",
            label: "Body",
            placeholder: "Enter template body",
            type: "textarea",
        },
    ];

    return (
        <div>
            <UpdateMailerTemplate
                mailerData={mailerData}
                setMailerData={setMailerData}
                setShowForm={setShowForm}
                showForm={showForm}
            />

            {/*<Modal show={showForm} onHide={handleModalCancel} centered  style={{backgroundColor:"rgba(255,255,255,0.75)"}}>*/}
            {/*       <Modal.Header closeButton>*/}
            {/*         <Modal.Title>Add Template</Modal.Title>*/}
            {/*       </Modal.Header>*/}
            {/*       <Modal.Body>*/}
            {/*         <Form>*/}
            {/*           <Row className="mb-3">*/}
            {/*             <Col>*/}
            {/*               <InputField*/}
            {/*                 id="Name"*/}
            {/*                 label="Name"*/}
            {/*                 type="text"*/}
            {/*                 value={form.Name}*/}
            {/*                 onChange={(e) => handleChange({ id: "Name", value: e.target.value })}*/}
            {/*               />*/}
            {/*             </Col>*/}
            {/*             <Col>*/}
            {/*               <InputField*/}
            {/*                 id="Subject"*/}
            {/*                 label="Subject"*/}
            {/*                 type="text"*/}
            {/*                 value={form.Subject}*/}
            {/*                 onChange={(e) => handleChange({ id: "Subject", value: e.target.value })}*/}
            {/*               />*/}
            {/*             </Col>*/}
            {/*           </Row>*/}
            {/*           <Row className="mb-3">*/}
            {/*             <Col>*/}
            {/*               <InputField*/}
            {/*                 id="Body"*/}
            {/*                 label="Body"*/}
            {/*                 type="textarea"*/}
            {/*                 value={form.Body}*/}
            {/*                 onChange={(e) => handleChange({ id: "Body", value: e.target.value })}*/}
            {/*               />*/}
            {/*             </Col>*/}
            {/*           </Row>*/}
            {/*         </Form>*/}
            {/*       </Modal.Body>*/}
            {/*       <Modal.Footer>*/}
            {/*         <Button variant="secondary" onClick={handleModalCancel} style={{backgroundColor:"darkgray",border:"none",borderRadius:"25px",width:"250px",padding:"8px 4px"}}>Cancel</Button>*/}
            {/*         <Button variant="primary" onClick={handleSubmit} style={{backgroundColor:"blue",border:"none",borderRadius:"25px",width:"250px",padding:"8px 4px"}}>Save Changes</Button>*/}
            {/*       </Modal.Footer>*/}
            {/*     </Modal>*/}
        </div>
    );
};

export default MailerTemplate;
