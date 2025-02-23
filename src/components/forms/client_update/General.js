import React, {useCallback, useState} from "react";
import {AlertTriangle, Calendar, CheckCircle2, DollarSign, FileCheck, Info, Users, X,} from 'lucide-react';
import Profile from "@/components/forms/client_update/general/Profile";
import Agreements from "@/components/forms/client_update/general/Agreements";
import Billing from "./reports/Billing";
import RosterPage from "../client_update/general/Rosters";
import {v4 as uuidv4} from 'uuid';

const General = ({
                     setGeneralEdit,
                     setSelectedComponent,
                     onTabChange,
                     onSaveReady,
                     isButtonClicked,
                     setIsButtonClicked
                 }) => {
    // const {colors, loading} = useContext(ColorContext);
    // if (loading) <div> Loading... </div>;

    const [selectedTabGen, setSelectedTabGen] = useState("Profile");
    // const [alert, setAlert] = useState(false);
    // const [status, setStatus] = useState(null)
    const [validationMessages, setValidationMessages] = useState([]);


    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, {id, type, content}]);
        // Auto-remove the message after 4 seconds
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    // if (loading) return <div>Loading...</div>;

    const handleTabChange = (tab) => {
        setSelectedTabGen(tab);
        onTabChange(tab); // Notify parent about active tab
    };

    const tabs = [
        {id: 'Profile', icon: Users},
        {id: 'Agreements', icon: FileCheck},
        {id: 'Rosters', icon: Calendar},
        {id: 'Billing', icon: DollarSign},
    ];
    console.log("Parent isButtonClicked:", isButtonClicked);


    return (
        <div className="">

            {/* Validation Messages */}
            {validationMessages.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {validationMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`
                flex items-center justify-between p-4 rounded-xl
                glass dark:glass-dark border shadow-lg
                transform transition-all duration-200 hover:scale-102
                ${msg.type === 'error'
                                ? 'border-red-300 bg-red-50/50 text-red-800'
                                : msg.type === 'success'
                                    ? 'border-green-300 bg-green-50/50 text-green-800'
                                    : 'border-blue-300 bg-blue-50/50 text-blue-800'
                            }
              `}
                        >
                            <div className="flex items-center gap-2">
                                {msg.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500"/>}
                                {msg.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500"/>}
                                {msg.type === 'info' && <Info className="h-5 w-5 text-blue-500"/>}
                                <span className="font-medium">{msg.content}</span>
                            </div>
                            <button
                                onClick={() => handleCloseMessage(msg.id)}
                                className="ml-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X className="h-4 w-4"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 mb-6">
                    <div className="flex items-center gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl
                  font-medium transition-all duration-200
                  ${selectedTabGen === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                }
                `}
                            >
                                <tab.icon className="h-4 w-4"/>
                                <span>{tab.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div
                    className="glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    <div className=""/>

                    {selectedTabGen === "Profile" && (
                        <Profile
                            setSelectedComponent={setSelectedComponent}
                            setGeneralEdit={setGeneralEdit}
                            addValidationMessage={addValidationMessage}
                            onSaveReady={onSaveReady}
                            isButtonClicked={isButtonClicked}
                            setIsButtonClicked={setIsButtonClicked}
                        />
                    )}
                    {selectedTabGen === "Agreements" && (
                        <Agreements
                            onTabChange={onTabChange}
                            onSaveReady={onSaveReady}
                            isButtonClicked={isButtonClicked}
                            setIsButtonClicked={setIsButtonClicked}
                        />
                    )}
                    {selectedTabGen === "Rosters" && (
                        <RosterPage
                            onTabChange={onTabChange}
                            onSaveReady={onSaveReady}
                            isButtonClicked={isButtonClicked}
                            setIsButtonClicked={setIsButtonClicked}
                        />
                    )}
                    {selectedTabGen === "Billing" && (
                        <Billing
                            onTabChange={onTabChange}
                            onSaveReady={onSaveReady}
                            isButtonClicked={isButtonClicked}
                            setIsButtonClicked={setIsButtonClicked}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default General;
