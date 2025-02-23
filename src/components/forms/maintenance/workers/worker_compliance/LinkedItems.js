import React from 'react';
import Button from "@/components/widgets/Button";

const LinkedItems = ({linkedItems, onDeleteRole}) => {
    console.log(linkedItems)
    return (
        <div style={{display: "flex", flexDirection: "column", gap: "10px", margin: "10px"}}>
            {linkedItems.map(item => (
                <div key={item.ID} style={{display: "flex", alignItems: "center"}}>
                    <div style={{flexGrow: 1}}>{item.Role ? item.Role : item.Type}</div>
                    <Button label="Delete" onClick={() => onDeleteRole(item.ID)} variant="contained"/>
                </div>
            ))}
        </div>
    );
};

export default LinkedItems;
