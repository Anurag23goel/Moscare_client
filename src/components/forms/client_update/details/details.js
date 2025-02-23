"use client";

import { useCallback, useState, useEffect } from 'react';
import { Building2, Settings, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Personal from './Personal';
import Work from './Work';
import Account from './Account';
import VWorker from './VWorker';
import { v4 as uuidv4 } from 'uuid';

export default function Details({
                                    setDetailsEdit,
                                    setSelectedComponent,
                                    onTabChange,
                                    onSaveReady,
                                    isButtonClicked,
                                    setIsButtonClicked,
                                    ClientID
                                }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('s') || "Personal";
    const [selectedTab, setSelectedTab] = useState(initialTab);
    const [validationMessages, setValidationMessages] = useState([]);
    const [prevC, setPrevC] = useState(searchParams.get('c'));

    const tabs = [
        { id: 'Personal', label: 'Personal', icon: Users },
        { id: 'Work', label: 'Work', icon: Building2 },
        { id: 'Account', label: 'Account', icon: Settings },
        // { id: 'VWorker', label: 'VWorker', icon: FileText },
    ];

    const addValidationMessage = useCallback((content, type = 'info') => {
        const id = uuidv4();
        setValidationMessages(prev => [...prev, { id, type, content }]);
        setTimeout(() => {
            setValidationMessages(prev => prev.filter(msg => msg.id !== id));
        }, 4000);
    }, []);

    const handleCloseMessage = useCallback((id) => {
        setValidationMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        onTabChange?.(tab);

        // Update URL with new 's' param, keeping existing 'c' if present
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('s', tab);
        // Include ClientID in the path
        router.replace(`/client/profile/update/${ClientID}?${currentParams.toString()}`, { scroll: false });
    };

    // Effect to reset 's' when 'c' changes
    useEffect(() => {
        const currentC = searchParams.get('c');
        if (currentC !== prevC) {
            setSelectedTab("Personal");
            setPrevC(currentC);

            // Remove 's' from URL if 'c' changes
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('s');
            router.replace(`/client/profile/update/${ClientID}?${newParams.toString()}`, { scroll: false });
        }
    }, [searchParams, prevC, router, ClientID]);

    // Sync selectedTab with URL 's' param on initial load or URL change
    useEffect(() => {
        const urlTab = searchParams.get('s');
        if (urlTab && tabs.some(tab => tab.id === urlTab) && urlTab !== selectedTab) {
            setSelectedTab(urlTab);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen">
            {/* Validation Messages */}
            {validationMessages.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {validationMessages.map(({ id, type, content }) => (
                        <div
                            key={id}
                            className={`p-4 rounded-xl glass dark:glass-dark border shadow-lg animate-slide-right ${
                                type === 'success'
                                    ? 'border-green-200/50 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                    : type === 'error'
                                        ? 'border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                                        : 'border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                            }`}
                        >
                            {content}
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="glass dark:glass-dark rounded-b-2xl rounded-t-2xl border border-gray-200/50 dark:border-gray-700/50 p-2 flex gap-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => handleTabChange(id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                            selectedTab === id
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        {selectedTab === id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl -z-10" />
                        )}
                        <Icon className={`h-4 w-4 ${selectedTab === id ? 'text-white' : ''}`} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass mt-12 dark:glass-dark rounded-b-2xl border-x border-b border-gray-200/50 dark:border-gray-700/50 p-6">
                {selectedTab === "Personal" && (
                    <Personal
                        addValidationMessage={addValidationMessage}
                        setSelectedComponent={setSelectedComponent}
                        setDetailsEdit={setDetailsEdit}
                        onSaveReady={onSaveReady}
                        isButtonClicked={isButtonClicked}
                        setIsButtonClicked={setIsButtonClicked}
                    />
                )}
                {selectedTab === "Work" && (
                    <Work
                        addValidationMessage={addValidationMessage}
                        onTabChange={onTabChange}
                        onSaveReady={onSaveReady}
                        isButtonClicked={isButtonClicked}
                        setIsButtonClicked={setIsButtonClicked}
                    />
                )}
                {selectedTab === "Account" && (
                    <Account
                        addValidationMessage={addValidationMessage}
                        onTabChange={onTabChange}
                        onSaveReady={onSaveReady}
                        isButtonClicked={isButtonClicked}
                        setIsButtonClicked={setIsButtonClicked}
                    />
                )}
                {selectedTab === "VWorker" && (
                    <VWorker
                        addValidationMessage={addValidationMessage}
                        onTabChange={onTabChange}
                        onSaveReady={onSaveReady}
                        isButtonClicked={isButtonClicked}
                        setIsButtonClicked={setIsButtonClicked}
                    />
                )}
            </div>
        </div>
    );
}