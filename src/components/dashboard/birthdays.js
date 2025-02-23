import React, {useState} from "react";
import {Cake, Coffee, Gift, MessageSquare, Sparkles, Star,} from 'lucide-react';

function BirthDays() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);


    const clientBirthdays = [
        {
            firstName: 'James',
            lastName: 'Wilson',
            age: 65,
            birthday: '2024-03-20',
            image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&h=100&fit=crop&crop=faces',
            years: 3
        },
        {
            firstName: 'Mary',
            lastName: 'Brown',
            age: 72,
            birthday: '2024-03-21',
            image: 'https://i.pinimg.com/originals/60/e0/3b/60e03b25d0829ec560b3f472e84cd23a.jpg',
            years: 5
        },
    ];

    const workerBirthdays = [
        {
            firstName: 'Sarah',
            lastName: 'Johnson',
            age: 28,
            birthday: '2024-03-20',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
            years: 2
        },
        {
            firstName: 'Michael',
            lastName: 'Davis',
            age: 35,
            birthday: '2024-03-21',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
            years: 4
        },
    ];


    return (<>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Birthdays */}
                <div
                    className="glass shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Gift className="h-6 w-6 text-purple-500"/>
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Today's Client Birthdays
                            </h2>
                        </div>

                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                            <Sparkles className="h-4 w-4"/>
                            Send Wishes
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {clientBirthdays.map((birthday, index) => (
                            <div key={index}
                                 className="flex items-center gap-4 p-4 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="relative">
                                    <img
                                        src={birthday.image}
                                        alt={`${birthday.firstName} ${birthday.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div
                                        className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-1">
                                        <Cake className="h-3 w-3 text-white"/>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {birthday.firstName} {birthday.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Turning {birthday.age} • Client for {birthday.years} years
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <MessageSquare className="h-4 w-4 text-purple-600"/>
                                    </button>
                                    <button
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <Gift className="h-4 w-4 text-pink-600"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Worker Birthdays */}
                <div
                    className="glass  shadow dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none" /> */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Coffee className="h-6 w-6 text-pink-500"/>
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Today's Worker Birthdays
                            </h2>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                            <Star className="h-4 w-4"/>
                            Celebrate
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {workerBirthdays.map((birthday, index) => (
                            <div key={index}
                                 className="flex items-center gap-4 p-4 rounded-xl glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="relative">
                                    <img
                                        src={birthday.image}
                                        alt={`${birthday.firstName} ${birthday.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div
                                        className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-1">
                                        <Cake className="h-3 w-3 text-white"/>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {birthday.firstName} {birthday.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Turning {birthday.age} • Team member for {birthday.years} years
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <MessageSquare className="h-4 w-4 text-purple-600"/>
                                    </button>
                                    <button
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <Coffee className="h-4 w-4 text-pink-600"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BirthDays;