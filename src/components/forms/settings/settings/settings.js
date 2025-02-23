import React, {useContext, useState} from 'react';
import {Tab, Tabs} from '@mui/material';
import styles from '../../../../styles/settings.module.css'; // Import your custom CSS
import DataExport from './tabs/dataExport';
import CompanyInfo from "@/components/forms/settings/settings/tabs/companyInfo";
import Finance from "@/components/forms/settings/settings/tabs/finance";
import Rostering from "@/components/forms/settings/settings/tabs/rostering";
import ColorContext from '@/contexts/ColorContext';

// Tab list with components
const tabList = [
    {name: 'Company Info', component: CompanyInfo},
    // { name: 'General', component: General },
    {name: 'Rostering', component: Rostering},
    // { name: 'Portals', component: Portals },
    // { name: 'Mobile App', component: MobileApp  },
    {name: 'Data Export', component: DataExport},
    {name: 'Finance', component: Finance},
    // { name: 'Minimum Data Set', component: MinimumDataSet },
    // { name: 'Custom Layout', component: CustomLayout },
    // Add other tabs as necessary
];

function Settings() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    //const {colors} = useContext(ColorContext)


    const handleSave = async () => {
        // const tabName = tabList[activeTab].name; // Get the name of the active tab
        // console.log(`Save triggered from: ${tabName}`);

        // Call specific API or perform actions based on the active tab
        // switch (tabName) {
        //     case 'Company Info':
        //         console.log("API call for Company Info");
        //         // Add your API call or logic for Company Info
        //         break;

        //     case 'Data Export':
        //         console.log("API call for Data Export");
        //         // Add your API call or logic for Data Export
        //         break;

        //     case 'General':
        //         console.log("API call for General settings");
        //         // Add your API call or logic for General settings
        //         break;

        //     default:
        //         console.log(`No specific API logic defined for tab: ${tabName}`);
        // }
        if (activeTab === 0) {
            console.log("API call for Company Info");

        } else if (activeTab === 2) {
            console.log("API call for Rostering");
        }
    };

    return (
        <div style={{padding: "0",}} className="fontFamilyMetro">
            {/* Tab Navigation */}
            <Tabs
                sx={{
                    width: "100%",
                    color: "#fff",
                    display: "flex",
                    backgroundColor: `${"blue"}`,
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                    borderLeft: "1px solid",
                    borderTop: "1px solid",
                    borderRight: "1px solid",
                    padding: "8px",
                    "& .MuiTabs-flexContainer": {
                        justifyContent: "flex-start",
                    },
                    "& .MuiTabs-indicator": {
                        display: `none`,
                    },
                }}
                value={activeTab}
                onChange={handleTabChange}
                className={styles.tabs}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                TabIndicatorProps={{
                    style: {backgroundColor: '#1976D2'}, // Custom tab indicator color
                }}
            >
                {tabList.map((tab, index) => (
                    <Tab key={tab.name} label={tab.name} sx={{
                        "&.Mui-selected": {
                            color: "#000 !important",
                            backgroundColor: "#fff !important",
                            borderRadius: "25px",
                            transition: "all 0.3s ease",
                        },
                    }}
                         style={{color: "#fff", padding: "8px 16px", minHeight: "unset", transition: "all 0.3s ease"}}/>
                ))}
            </Tabs>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 0 && <CompanyInfo onSave={handleSave}/>}
                {activeTab === 1 && <Rostering onSave={handleSave}/>}
                {activeTab === 2 && <DataExport onSave={handleSave}/>}
                {activeTab === 3 && <Finance onSave={handleSave}/>}
                {/* {activeTab === 6 && <Finance onSave={handleSave} />} */}
            </div>
        </div>
    );
}

export default Settings;

