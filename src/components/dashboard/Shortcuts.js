import {useContext, useEffect, useState} from "react";
import {Modal,} from "@mui/material";
import {Plus, X,} from "lucide-react";

import ColorContext from "@/contexts/ColorContext";

const availablePaths = [
    {name: "Client Profile", path: "/client/profile"},
    {name: "Worker Profile", path: "/worker/profile"},
    {name: "Path 3", path: "/path3"},
    {name: "Path 4", path: "/path4"},
    {name: "Path 5", path: "/path5"},
    {name: "Path 6", path: "/path6"},
    {name: "Path 7", path: "/path7"},
    {name: "Path 8", path: "/path8"},
    {name: "Path 9", path: "/path9"},
    {name: "Path 10", path: "/path10"},
];

const gradients = [
    {gradient: "from-blue-400 via-blue-500 to-indigo-600"},
    {gradient: "from-purple-400 via-purple-500 to-pink-600"},
    {gradient: "from-pink-400 via-pink-500 to-rose-600"},
    {gradient: "from-green-400 via-green-500 to-emerald-600"},
    {gradient: "from-amber-400 via-amber-500 to-orange-600"},
    {gradient: "from-cyan-400 via-cyan-500 to-blue-600"},
];

export default function Shortcuts() {
    const [shortcuts, setShortcuts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPaths, setSelectedPaths] = useState([]);
    // const {colors} = useContext(ColorContext);

    // Initialize saved shortcuts from localStorage
    useEffect(() => {
        const savedShortcuts =
            JSON.parse(localStorage.getItem("adminShortcuts")) || [];
        setShortcuts(savedShortcuts);
    }, []);

    // Save updated shortcuts
    const saveShortcuts = (updatedShortcuts) => {
        setShortcuts(updatedShortcuts);
        localStorage.setItem("adminShortcuts", JSON.stringify(updatedShortcuts));
    };

    // Add selected shortcuts to the list
    const addSelectedShortcuts = () => {
        const updatedShortcuts = [...shortcuts];
        selectedPaths.forEach((path) => {
            if (!updatedShortcuts.find((shortcut) => shortcut.path === path.path)) {
                updatedShortcuts.push(path);
            }
        });
        saveShortcuts(updatedShortcuts);
        setModalOpen(false);
        setSelectedPaths([]);
    };

    // Toggle selection for paths
    const togglePathSelection = (path) => {
        setSelectedPaths((prev) => {
            if (prev.find((p) => p.path === path.path)) {
                return prev.filter((p) => p.path !== path.path);
            } else {
                return [...prev, path];
            }
        });
    };

    // Remove a shortcut from the list
    const removeShortcut = (path) => {
        const updatedShortcuts = shortcuts.filter(
            (shortcut) => shortcut.path !== path.path
        );
        saveShortcuts(updatedShortcuts);
    };

    // Filter paths that are not already shortcuts
    const filteredPaths = availablePaths.filter(
        (path) => !shortcuts.find((shortcut) => shortcut.path === path.path)
    );

    return (
        <div
            className="glass shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
            {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Shortcuts
                </h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4 mr-2"/>
                    Add Shortcut
                </button>
            </div>
            {shortcuts.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-24">
                    {/* Abstract Shapes */}

                    <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        No shortcuts found
                    </p>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Click the "Add Shortcut" button to get started.
                    </p>
                </div>
                // <div className="flex items-center justify-center w-full h-60">
                //   <p className="text-gray-500 dark:text-gray-400">
                //       No shortcuts added yet. Click the "Add Shortcut" button to get started.
                //     </p>

                // </div>
            )}


            <div className="grid grid-cols-3 gap-3">

                {shortcuts.map((shortcut, index) => {
                    const randomGradientIndex = Math.floor(
                        Math.random() * gradients.length
                    );
                    return (
                        <div
                            key={shortcut.path}
                            className="relative group h-24 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"/>
                            <div
                                className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${gradients[randomGradientIndex].gradient}`}
                            />
                            <button
                                onClick={() => removeShortcut(shortcut)}
                                className="absolute top-1 right-1 opacity-80 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="h-3 w-3 text-gray-400 hover:text-red-500"/>
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className={`text-lg font-bold bg-gradient-to-br ${gradients[randomGradientIndex].gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform`}
                >
                  {shortcut.name}
                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Adding Shortcuts */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div
                    className="relative bg-white glass w-80 p-4 mx-auto bg-white/30 backdrop-blur-md glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg top-1/2 -translate-y-1/2">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none rounded-2xl"/>

                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Select Shortcuts
                        </h2>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-500"/>
                        </button>
                    </div>

                    {/* Modal Shortcuts Grid */}
                    <div className="grid grid-cols-1 gap-2 mb-4">
                        {filteredPaths.map((path) => (
                            <label
                                key={path.path}
                                className="flex items-center p-2 rounded-lg glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPaths.find((p) => p.path === path.path)}
                                    onChange={() => togglePathSelection(path)}
                                    className="sr-only"
                                    hidden
                                />
                                <div
                                    className={`w-4 h-4 rounded-md border ${
                                        selectedPaths.find((p) => p.path === path.path)
                                            ? "bg-gradient-to-r from-purple-500 to-pink-600 border-transparent"
                                            : "border-gray-300 dark:border-gray-600"
                                    } mr-3`}
                                >
                                    {selectedPaths.find((p) => p.path === path.path) && (
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {path.name}
                </span>
                            </label>
                        ))}
                    </div>

                    {/* Modal Action Buttons */}
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={addSelectedShortcuts}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <Plus className="h-3 w-3"/>
                            Add Selected
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
