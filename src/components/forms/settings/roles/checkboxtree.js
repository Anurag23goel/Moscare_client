import React, {useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, Typography} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CheckboxTree = ({menuData, handleCheckboxChange}) => {
    const [expanded, setExpanded] = useState(false);

    const handleExpand = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const renderTree = (nodes) => (
        <Accordion
            expanded={expanded === nodes.Menu_ID}
            onChange={handleExpand(nodes.Menu_ID)}
            key={nodes.Menu_ID}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls={`${nodes.Menu_ID}-content`}
                id={`${nodes.Menu_ID}-header`}
            >
                <Box display="flex" alignItems="center">
                    <Checkbox
                        checked={nodes.checked || false}
                        onChange={() => handleCheckboxChange(nodes.Menu_ID)}
                    />
                    <Typography>{nodes.Menu_Desc}</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                {nodes.children && nodes.children.length > 0 ? (
                    <div>{nodes.children.map((node) => renderTree(node))}</div>
                ) : (
                    <Typography>No sub-menus</Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );

    return <div>{menuData.map((menu) => renderTree(menu))}</div>;
};

export default CheckboxTree;
