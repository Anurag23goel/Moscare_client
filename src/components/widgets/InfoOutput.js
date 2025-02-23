import React from "react";

const InfoOutput = ({output}) => {
    return (
        <>
            {
                output ? (
                    <p style={{
                        color: 'black',
                        textAlign: 'center',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        padding: '1rem',
                        border: '1px solid red',
                    }}
                       id={"information"}
                    >
                        {output}
                    </p>
                ) : null
            }
        </>
    );
};

export default InfoOutput;
