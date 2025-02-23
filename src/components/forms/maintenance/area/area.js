import React, {useContext, useEffect, useState} from "react";
import Modal from "react-modal";
import {postData} from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateArea, {fetchAreaData} from "@/components/forms/maintenance/area/update_area";
import EditModal from "@/components/widgets/EditModal";
import ValidationBar from "@/components/widgets/ValidationBar";
import {ValidationContext} from "@/pages/_app";


Modal.setAppElement("#__next");

function Area() {
  const [showForm, setShowForm] = useState(false);
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [area, setArea] = useState("");
  // const { color, loading } = useContext(ColorContext);
  const [formData,setFormData] = useState({
    code:"",
    area:""
  })
  const [areaData, setAreaData] = useState([]);
  const { addValidationMessage, validationMessages, handleCloseMessage } = useContext(ValidationContext);

  useEffect(() => {
    const fetchAndSetAreaData = async () => {
      const data = await fetchAreaData();
      setAreaData(data);
    };
    fetchAndSetAreaData();
  }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Formdata" , formData)
    // Frontend validation
    if (!formData.code || !formData.area ) {
      setOutput("All fields are mandatory.");
      return;
    }

    const dataToSend = {
      code: formData.code,
      area: formData.area,
      makerUser: "John",
      updateUser: null,
      updateTime: null,
    };

    try {
      const response = await postData("/api/insertArea", dataToSend, window.location.href);
      console.log("Response from backend:", response);
      if (response.success) {
        setOutput(response.message);
        clearForm();
        setShowForm(false);
        fetchAreaData().then((data) => setAreaData(data));
        addValidationMessage("Area added successfully","success")
      } else {
        setOutput(response.message);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      addValidationMessage("Failed To add Area data","error")
      setOutput("An error occurred while adding the area");
    }
  };

  const clearForm = () => {
    setOutput("");
    setCode("");
    setArea("");
  };

  const handleModalCancel = () => {
    clearForm();
    setOutput("");
    setShowForm(false);
  };

  const handleInputChange = ({ id, value }) => {
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const fields = [
    {
      id: "code",
      label: "Code:",
      value: formData.code,
      type: "text",
    
    },
    {
      id: "area",
      label: "Area:",
      value: formData.area,
      type: "text",
   
    },

  ];
  

  return (
    <div style={{padding:"0 1rem"}}>
           <ValidationBar messages={validationMessages} onClose={handleCloseMessage} />

      <UpdateArea
        areaData={areaData}
        setAreaData={setAreaData}
        setShowForm={setShowForm}
      />
     

      <EditModal
        show={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSubmit}
        modalTitle="Add Area Details"
        fields={fields}
        data={formData}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default Area;