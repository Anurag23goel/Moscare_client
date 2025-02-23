"use client";

import React, {useRef, useState} from 'react';
import {AlertCircle, CheckCircle, ChevronDown, Upload} from 'lucide-react';

const InputField = ({
                        label,
                        type,
                        id,
                        value,
                        onChange,
                        min,
                        name,
                        max,
                        resizable = true,
                        required = false,
                        options = [],
                        sx = {},
                        style = {},
                        disabled = false,
                        placeholder,
                        startIcon,
                        iconStyle,
                        error,
                        ...props
                    }) => {
    const fileInputRef = useRef(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploaded(true);
            onChange({target: {id, value: file}});
        } else {
            setIsUploaded(false);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="form-group w-full">
            {/* Label */}
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                    {label
                        ?.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                        .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase())
                    }
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Wrapper */}
            <div className={`
        relative group transition-all duration-200
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}
        ${error ? 'ring-2 ring-red-500/20' : isFocused ? 'ring-2 ring-purple-500/20' : ''}
      `}>
                {/* File Input */}
                {type === 'file' ? (
                    <div className="flex items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={disabled}
                            {...props}
                        />
                        <button
                            onClick={handleFileClick}
                            disabled={disabled}
                            className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                ${isUploaded
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90'
                            }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            {isUploaded ? (
                                <>
                                    <CheckCircle className="h-4 w-4"/>
                                    <span>Uploaded</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4"/>
                                    <span>Upload</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className={`
            glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50
            overflow-hidden transition-all duration-200
            ${error ? 'border-red-500/50' : isFocused ? 'border-purple-500/50' : ''}
            ${disabled ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:border-purple-500/50'}
          `}>
                        <div className="flex items-center min-h-[42px]">
                            {/* Start Icon */}
                            {startIcon && (
                                <div
                                    className="flex items-center px-3 border-r border-gray-200/50 dark:border-gray-700/50">
                                    {startIcon}
                                </div>
                            )}

                            {/* Select Input */}
                            {type === 'select' ? (
                                <div className="relative flex-1">
                                    <select
                                        id={id}
                                        value={value}
                                        onChange={onChange}
                                        disabled={disabled}
                                        className={`
                      w-full h-full px-4 py-2 bg-transparent
                      text-gray-900 dark:text-gray-100 placeholder-gray-400
                      focus:outline-none appearance-none
                    `}
                                        {...props}
                                    >
                                        <option value="" disabled>Select</option>
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
                                /* Regular Input */
                                <input
                                    type={type}
                                    id={id}
                                    value={value}
                                    onChange={onChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={placeholder || id ? `Enter ${id?.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/(?:^|\s)\S/g, (match) => match?.toUpperCase())}` : "Enter Something..."}
                                    disabled={disabled}
                                    required={required}
                                    className={`
                    w-full px-4 py-2 bg-transparent
                    text-gray-900 dark:text-gray-100 placeholder-gray-400
                    focus:outline-none
                  `}
                                    style={{...sx}}
                                    {...props}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4"/>
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputField;