import React from "react";
import DailyInsights from "./DailyInsights";
import SearchClientWorker from "./SearchClientWorker";
import Shortcuts from "./Shortcuts";
import BirthDays from "./birthdays";
import NewRosters from "./NewRosters";
import AvailableWorkerToday from "./AvailableWorkerToday";
import ShiftCharts from "./ShiftCharts";
import ShiftInsights from "./shifts_insights";
import WelcomeText from "./WelcomeText";
import TopPayers from "./TopPayers";

function DashboardMain() {

    return (
        <div className="min-h-screen gradient-background">

            {/* Main Content */}
            <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                <WelcomeText/>
                <DailyInsights/>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <NewRosters/>
                    <Shortcuts/>
                </div>
                <SearchClientWorker/>
                <TopPayers/>
                <AvailableWorkerToday/>
                <ShiftCharts/>
                <ShiftInsights/>
                <BirthDays/>

            </main>
        </div>
    );
}

export default DashboardMain;
