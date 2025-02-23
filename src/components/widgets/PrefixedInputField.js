"use client";

import React from 'react';
import {ChevronDown, Scale as Female, Scale as Male, Users} from 'lucide-react';

// Mapping for gender icons
const genderIconMap = {
    Male: <Male className="h-4 w-4"/>,
    Female: <Female className="h-4 w-4"/>,
    Other: <Users className="h-4 w-4"/>,
};

const PrefixedInputField = ({
                                label,
                                code,
                                prefixType = "none",
                                prefixValue,
                                onPrefixChange,
                                type = "text",
                                id,
                                value,
                                onChange,
                                disabled = false,
                                placeholder = "",
                                error = "",
                                helperText = "",
                                options = [],
                                containerStyle,
                                labelStyle,
                                dropdownStyle,
                                inputStyle,
                                borderColor,
                                prefixOptions = [],
                                className = "",
                                ...props
                            }) => {
    const renderPrefix = () => {
        if (prefixType === "none") return null;

        const showIcon = prefixType === "gender";
        const icon = showIcon ? genderIconMap[prefixValue] || null : null;

        return (
            <div className="relative">
                <div className={`
          flex items-center min-w-[80px] h-full
          bg-gray-100/50 dark:bg-gray-800/50
          border-r border-gray-200/50 dark:border-gray-700/50
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
                    {showIcon && (
                        <div className="flex items-center pl-3">
                            {icon}
                        </div>
                    )}

                    <select
                        value={prefixValue}
                        onChange={(e) => onPrefixChange(e.target.value)}
                        disabled={disabled}
                        className={`
              w-full h-full pl-3 pr-8 py-2
              bg-transparent text-gray-900 dark:text-gray-100
              appearance-none focus:outline-none
              ${showIcon ? 'pl-2' : 'pl-3'}
            `}
                    >
                        <option value="" disabled>Select</option>
                        {prefixOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {prefixType === "countryCode"
                                    ? `${option.flag} ${option.code}`
                                    : option.label}
                            </option>
                        ))}
                    </select>

                    <ChevronDown
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                </div>
            </div>
        );
    };

    return (
        <div className={`relative w-full ${containerStyle}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={id}
                    className={`
            block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5
            ${labelStyle}
          `}
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className={`
        glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50
        overflow-hidden transition-all duration-200
        ${error ? 'border-red-500/50' : 'hover:border-purple-500/50'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}>
                <div className="flex items-center h-[42px]">
                    {/* Prefix Section */}
                    {renderPrefix()}

                    {/* Input/Select Section */}
                    <div className="flex-1">
                        {type === 'select' ? (
                            <div className="relative w-full h-full">
                                <select
                                    id={id}
                                    name={id}
                                    value={value}
                                    onChange={onChange}
                                    disabled={disabled}
                                    className={`
                    w-full h-full pl-4 pr-10 
                    bg-transparent text-gray-900 dark:text-gray-100
                    appearance-none focus:outline-none
                    disabled:bg-gray-50 dark:disabled:bg-gray-800/50
                    ${inputStyle}
                  `}
                                >
                                    <option value="" disabled>{placeholder}</option>
                                    {options.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
                            </div>
                        ) : (
                            <input
                                type={type}
                                id={id}
                                name={id}
                                value={value}
                                onChange={onChange}
                                disabled={disabled || prefixType === "gender"}
                                placeholder={placeholder}
                                className={`
                  w-full h-full px-4
                  bg-transparent text-gray-900 dark:text-gray-100
                  placeholder-gray-400 focus:outline-none
                  disabled:bg-gray-50 dark:disabled:bg-gray-800/50
                  ${inputStyle}
                `}
                                {...props}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-1.5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Helper Text */}
            {helperText && (
                <div className="mt-1.5 text-sm text-gray-500">
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default PrefixedInputField;