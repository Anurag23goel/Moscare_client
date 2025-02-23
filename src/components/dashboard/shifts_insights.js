import React, {useState} from "react";
import {Clock, Plus, RefreshCw, Search, Timer, Users,} from 'lucide-react';

function ShiftsInsights() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Sample data structure
    const unallocatedShifts = [
        {date: '2024-03-20', startTime: '09:00', rosterId: 'R-1234', client: 'John Smith', type: 'Regular'},
        {date: '2024-03-21', startTime: '14:00', rosterId: 'R-1235', client: 'Sarah Johnson', type: 'Emergency'},
        {date: '2024-03-22', startTime: '10:30', rosterId: 'R-1236', client: 'David Wilson', type: 'Regular'},
    ];

    const runningShifts = [
        {
            startTime: '08:00',
            finishTime: '16:00',
            carer: 'Emma Wilson',
            client: 'Michael Brown',
            isLate: false,
            appStartTime: '07:55',
            appFinishTime: '',
            issueNote: '',
        },
        {
            startTime: '09:00',
            finishTime: '17:00',
            carer: 'James Smith',
            client: 'Alice Cooper',
            isLate: true,
            appStartTime: '09:15',
            appFinishTime: '',
            issueNote: 'Traffic delay',
        },
    ];

    const clientHours = [
        {client: 'Robert Harris', rosteredHours: 24, completedHours: 20},
        {client: 'Emily White', rosteredHours: 32, completedHours: 28},
        {client: 'Thomas Brown', rosteredHours: 40, completedHours: 35},
    ];


    return (<>
            <div
                className="glass mb-8 shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Clock className="h-6 w-6 text-purple-500"/>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Unallocated Shifts
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search shifts..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 glass dark:glass-dark"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                            <Plus className="h-4 w-4"/>
                            Add Shift
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Date Of Service</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Start Time</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Roster Id</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Client</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Type</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {unallocatedShifts.map((shift, index) => (
                            <tr key={index}
                                className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-3 px-4">{shift.date}</td>
                                <td className="py-3 px-4">{shift.startTime}</td>
                                <td className="py-3 px-4">{shift.rosterId}</td>
                                <td className="py-3 px-4">{shift.client}</td>
                                <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                    shift.type === 'Emergency'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {shift.type}
                </span>
                                </td>
                                <td className="py-3 px-4">
                                    <button className="text-purple-600 hover:text-purple-700 font-medium">
                                        Allocate
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div
                className="glass mb-8 shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <Timer className="h-6 w-6 text-pink-500"/>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Running Shifts
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Auto-refresh in: 4:59</span>
                        <button
                            // onClick={handleRefresh}
                            className="p-2 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}/>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Start Time</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Finish Time</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Carer</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Client</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Status</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">APP Start</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">APP Finish</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Notes</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {runningShifts.map((shift, index) => (
                            <tr key={index}
                                className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-3 px-4">{shift.startTime}</td>
                                <td className="py-3 px-4">{shift.finishTime}</td>
                                <td className="py-3 px-4">{shift.carer}</td>
                                <td className="py-3 px-4">{shift.client}</td>
                                <td className="py-3 px-4">
                <span
                    className={`px-3 py-1 rounded-full text-sm ${shift.isLate ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                  {shift.isLate ? 'Late' : 'On Time'}
                </span>
                                </td>
                                <td className="py-3 px-4">{shift.appStartTime}</td>
                                <td className="py-3 px-4">{shift.appFinishTime || '-'}</td>
                                <td className="py-3 px-4">{shift.issueNote || '-'}</td>
                                <td className="py-3 px-4">
                                    <button className="text-purple-600 hover:text-purple-700 font-medium">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Hours */}
            <div
                className="glass  mb-8 shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                <div className="flex items-center gap-2 mb-6">
                    <Users className="h-6 w-6 text-blue-500"/>
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Client Hours
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Client</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Rostered Hours</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Completed Hours</th>
                            <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Progress</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clientHours.map((record, index) => (
                            <tr key={index}
                                className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="py-3 px-4">{record.client}</td>
                                <td className="py-3 px-4">{record.rosteredHours}</td>
                                <td className="py-3 px-4">{record.completedHours}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2.5 rounded-full"
                                                style={{width: `${(record.completedHours / record.rosteredHours) * 100}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {Math.round((record.completedHours / record.rosteredHours) * 100)}%
                  </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default ShiftsInsights;