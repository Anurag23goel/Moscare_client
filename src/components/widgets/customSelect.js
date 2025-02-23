// CustomSelect.js
import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import {Box, Typography} from '@mui/material';

const CustomSelect = ({
                          label,
                          options,
                          value,
                          onChange,
                          isDisabled,
                          placeholder,
                          error,
                          containerStyle,
                      }) => {
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: error ? 'red' : provided.borderColor,
            boxShadow: state.isFocused ? (error ? '0 0 0 1px red' : '0 0 0 1px #1976d2') : provided.boxShadow,
            '&:hover': {
                borderColor: error ? 'red' : '#1976d2',
            },
        }),
    };

    return (
        <Box style={containerStyle}>
            {label && (
                <Typography variant="body2" style={{marginBottom: '4px'}}>
                    {label}
                </Typography>
            )}
            <Select
                styles={customStyles}
                options={options}
                value={options.find(option => option.value === value) || null}
                onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
                isDisabled={isDisabled}
                placeholder={placeholder}
                isClearable
            />
            {error && (
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

CustomSelect.propTypes = {
    label: PropTypes.string,
    options: PropTypes.array.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    containerStyle: PropTypes.object,
};

CustomSelect.defaultProps = {
    label: '',
    value: '',
    isDisabled: false,
    placeholder: 'Select...',
    error: '',
    containerStyle: {},
};

export default CustomSelect;
