import React from "react";
import {Building,} from "lucide-react";

function TopPayers() {

    const topPayers = [

        {
            name: "Payer B",
            revenue: 10800,
            trend: "+5.1%",
            color: "from-fuchsia-300 to-pink-400",
        },
        {
            name: "Payer C",
            revenue: 9600,
            trend: "+4.3%",
            color: "from-rose-300 to-red-400",
        },
        {
            name: "Payer D",
            revenue: 8200,
            trend: "+3.7%",
            color: "from-orange-300 to-amber-400",
        },
        {
            name: "Payer A",
            revenue: 12400,
            trend: "+8.2%",
            color: "from-violet-300 to-purple-400",
        },
        {
            name: "Payer E",
            revenue: 7400,
            trend: "+2.9%",
            color: "from-emerald-300 to-green-400",
        },
    ];


    return (

        <div className="grid grid-cols-1 mb-8 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {topPayers.map((payer, index) => (
                <div
                    key={index}
                    className="glass shadow dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                    {/* <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-black/0 dark:to-black/0 pointer-events-none"></div> */}
                    <div
                        className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${payer.color}`}
                    />
                    <div className="flex items-center justify-between mb-4">
                        <Building className="h-6 w-6 text-gray-400"/>
                        <div className="flex items-center space-x-1 text-green-500">
                            {/* <TrendingUp className="h-4 w-4" /> */}
                            <span className="text-sm font-medium">Revenue</span>
                        </div>
                    </div>
                    <h3
                        className={`text-lg font-semibold bg-gradient-to-br ${payer.color} bg-clip-text text-transparent mb-2`}
                    >
                        {payer.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        ${payer.revenue.toLocaleString()}
                    </p>
                    <div
                        className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/0 to-white/10 dark:from-white/0 dark:to-white/5 rounded-full blur-2xl pointer-events-none"/>
                </div>
            ))}
        </div>
    );
}

export default TopPayers;