import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { fetchUserRoles, postData } from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import UpdateAddress, {
  fetchAddressData,
} from "@/components/forms/maintenance/addresses/update_address";
import EditModal from "@/components/widgets/EditModal";
import { ValidationContext } from "@/pages/_app";
import ValidationBar from "@/components/widgets/ValidationBar";
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

Modal.setAppElement("#__next");

const Address = () => {
  const [showForm, setShowForm] = useState(false);
  const [output, setOutput] = useState("");
  const [form, setForm] = useState({
    unitNo: "",
    streetNo: "",
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    state: "",
    postcode: "",
    generalNotes: "",
    identifiedRisks: "",
  });

  const [addressData, setAddressData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    addValidationMessage,
    validationMessages,
    handleCloseMessage,
  } = useContext(ValidationContext);
  const [errMsgs, setErrMsgs] = useState({});
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [disableSection, setDisableSection] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAndSetAddressData = async () => {
      const data = await fetchAddressData();
      setAddressData(data);
    };
    fetchAndSetAddressData();
    return () => {
      mounted = false;
    };
  }, []);

  // const { colors, loading } = useContext(ColorContext);
  // if (loading) {
  //     return <div>Loading...</div>;
  // }

  const states = [
    "New South Wales",
    "Victoria",
    "Queensland",
    "South Australia",
    "Western Australia",
    "Tasmania",
    "Australian Capital Territory",
    "Northern Territory",
    "Auckland",
    "Wellington",
    "Canterbury",
    "Waikato",
    "Otago",
    "Bay of Plenty",
    "Manawatu-Wanganui",
    "Hawke's Bay",
    "Taranaki",
    "Northland",
    "Nelson",
    "Marlborough",
    "Southland",
  ];
  const allSuburbs = [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Hobart",
    "Canberra",
    "Darwin",
    "Gold Coast",
    "Newcastle",
    "Wollongong",
    "Geelong",
    "Cairns",
    "Townsville",
    "Ballarat",
    "Auckland",
    "Wellington",
    "Christchurch",
    "Hamilton",
    "Tauranga",
    "Napier-Hastings",
    "Dunedin",
    "Palmerston North",
    "Rotorua",
    "New Plymouth",
    "Whangarei",
    "Invercargill",
    "Nelson",
    "Whanganui",
    "Timaru",
  ];

  const handleChange = ({ id, value }) => {
    const validators = {
      postcode: /^\d{4}$/, // AU (4 digits) and NZ postcodes (4 digits)
    };

    // Logic for handling the state search
    if (id === "state") {
      const searchTerm = value.toLowerCase().trim(); // User's input
      console.log("search term: " + searchTerm);
      if (searchTerm === "") {
        // If no input, clear filtered states
        setFilteredStates([]);
      } else {
        // Filter states based on search term
        const filteredStates = states.filter(
          (state) => state.toLowerCase().includes(searchTerm) // Case-insensitive search
        );
        setFilteredStates(filteredStates); // Update filtered states list
      }

      setForm((prevState) => ({
        ...prevState,
        state: value, // Ensure the value from the input is updated in the state
      }));
    }

    if (id === "suburb") {
      const searchTerm = value.toLowerCase().trim(); // User's input
      console.log("search term: " + searchTerm);

      if (searchTerm === "") {
        // If no input, clear filtered suburbs
        setFilteredSuburbs([]);
      } else {
        // Filter merged suburbs based on search term
        const filteredSuburbsList = allSuburbs.filter(
          (suburb) => suburb.toLowerCase().includes(searchTerm) // Case-insensitive search
        );
        setFilteredSuburbs(filteredSuburbsList); // Update filtered suburbs list
      }

      setForm((prevState) => ({
        ...prevState,
        suburb: value, // Ensure the value from the input is updated in the form state
      }));
    }

    setErrMsgs((prevMsgs) => {
      const newErrMsgs = { ...prevMsgs };

      // Check if the field is empty
      if (value === "") {
        // Remove error message if the field is empty
        delete newErrMsgs[id];
      } else if (validators[id] && !validators[id].test(value)) {
        // Add error message for invalid input
        newErrMsgs[id] = `Invalid ${id}. Please enter a valid value.`;
      } else {
        // Remove error message if validation passes
        delete newErrMsgs[id];
      }

      return newErrMsgs;
    });
    setForm((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = {
      unitNo: form.unitNo,
      streetNo: form.streetNo,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      suburb: form.suburb,
      state: form.state,
      postcode: form.postcode,
      generalNotes: form.generalNotes,
      identifiedRisks: form.identifiedRisks,
      makerUser: "John",
      updateUser: null,
      updateTime: null,
    };

    try {
      const response = await postData(
        "/api/insertAddress",
        formData,
        window.location.href
      );
      if (response.success) {
        setOutput("Address added successfully");
        clearForm();
        setShowForm(false);
        fetchAddressData().then((data) => setAddressData(data));
        addValidationMessage("Address added successfully", "success");
      } else {
        setOutput("Failed to add address");
        addValidationMessage("Failed To add Address data", "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setOutput("");
    setForm({
      unitNo: "",
      streetNo: "",
      addressLine1: "",
      addressLine2: "",
      suburb: "",
      state: "",
      postcode: "",
      generalNotes: "",
      identifiedRisks: "",
    });
  };

  const handleModalCancel = () => {
    clearForm();
    setOutput("");
    setShowForm(false);
  };

  const fields = [
    {
      label: "Unit No",
      type: "number",
      id: "unitNo",
    },
    {
      label: "Street No",
      type: "number",
      id: "streetNo",
    },
    {
      label: "Address Line 1",
      type: "text",
      id: "addressLine1",
    },
    {
      label: "Address Line 2",
      type: "text",
      id: "addressLine2",
    },
    {
      label: "Suburb",
      type: "text",
      id: "suburb",
    },
    {
      label: "State",
      type: "text",
      id: "state",
    },
    {
      label: "Postcode",
      type: "number",
      id: "postcode",
    },
    {
      label: "General Notes",
      type: "text",
      id: "generalNotes",
    },
    {
      label: "Identified Risks",
      type: "text",
      id: "identifiedRisks",
    },
  ];

  // Fetch address data and user roles on mount
  useEffect(() => {
    const fetchAndSetAddressData = async () => {
      const data = await fetchAddressData();
      setAddressData(data);
    };
    fetchAndSetAddressData();
    fetchUserRoles("m_addresses", "Maintainence_Addresses", setDisableSection);
  }, []);

  return (
    <div style={{ padding: "0 0rem" }}>
      <ValidationBar
        messages={validationMessages}
        onClose={handleCloseMessage}
      />

      <CustomBreadcrumbs />

      <UpdateAddress
        addressData={addressData}
        setAddressData={setAddressData}
        setShowForm={setShowForm}
      />

      <EditModal
        show={showForm}
        onClose={handleModalCancel}
        onSave={handleSubmit}
        modalTitle="Add Address"
        fields={fields}
        data={form}
        onChange={handleChange}
        errMsgs={errMsgs}
        filteredStates={filteredStates || []}
        setFilteredStates={setFilteredStates || []}
        filteredSuburbs={filteredSuburbs || []}
        setFilteredSuburbs={setFilteredSuburbs || []}
        disabled={disableSection}
      />
    </div>
  );
};

export default Address;
