// import React, { useEffect, useState } from 'react';
// import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';

// const StatusBar = ({status,setAlert,msg}) => {
//   const [show,setShow] = useState(true);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShow(false); // Reset alert after `duration`
//     }, 2000);

//     // Cleanup the timer if the component unmounts before timeout
//     return () => clearTimeout(timer);
//   }, [setAlert]);

//   return (
//     <>
//     {
//       show &&
//       <div style={{width:"100%", display: "flex", justifyContent: "center" }}>
//         <Alert severity={status ? "success" : "error"} style={{ width: "100%" }}> 
//         <AlertTitle>{status ? "success" : "error"}</AlertTitle>
//            {msg}
//         </Alert> 
//       </div>
//     }

//     </>

//   )
// }

// export default StatusBar

import React, {useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const StatusBar = ({severity = "success", title, msg, duration = 2000, setAlert}) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false); // Hide the alert after the specified duration
            if (setAlert) {
                setAlert(false); // Reset parent alert state if provided
            }
        }, duration);

        // Cleanup timer if component unmounts early
        return () => clearTimeout(timer);
    }, [duration, setAlert]);

    return (
        <>
            {show && (
                <div style={{width: "100%", display: "flex", justifyContent: "center", marginTop: "10px"}}>
                    <Alert severity={severity} sx={{width: "100%", maxWidth: "500px"}}>
                        {/* Conditionally render the title if provided */}
                        {title && <AlertTitle>{title}</AlertTitle>}
                        {msg}
                    </Alert>
                </div>
            )}
        </>
    );
};

export default StatusBar;
