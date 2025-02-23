import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function ControlRadio({label}) {
    return (
        <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">{label}</FormLabel>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
            >
                <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                <FormControlLabel value="No" control={<Radio/>} label="No"/>
                <FormControlLabel value="N/A" control={<Radio/>} label="N/A"/>
            </RadioGroup>
        </FormControl>
    );
}
