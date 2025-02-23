// src/pages/TimesheetMainPage.jsx

import React, { useCallback, useState } from "react";
import TimesheetsMain from "@/components/forms/timesheets_main/timesheets/timesheets";
import ValidationBar from "@/components/widgets/ValidationBar";
import { v4 as uuidv4 } from "uuid"; // Ensure uuid is imported
import { CustomBreadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";

const TimesheetMainPage = () => {
  const [validationMessages, setValidationMessages] = useState([]);

  // Function to add a validation message
  const addValidationMessage = useCallback((content, type = "info") => {
    const id = uuidv4();
    setValidationMessages((prev) => [...prev, { id, type, content }]);

    // Automatically remove the message after 4 seconds
    setTimeout(() => {
      setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 4000);
  }, []);

  // Function to handle manual dismissal of a message
  const handleCloseMessage = useCallback((id) => {
    setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return (
    <div>
      {/*<DashMenu />*/}
      {/* Validation Bar */}
      
      <ValidationBar
        messages={validationMessages}
        onClose={handleCloseMessage}
      />
      {/* Pass addValidationMessage to TimesheetsMain */}
      {/* <Container className={styles.MainContainer}> */}
      
      <TimesheetsMain addValidationMessage={addValidationMessage} />

      {/* </Container> */}
    </div>
  );
};

export default TimesheetMainPage;
