// Dashboard.js
import React, {useEffect} from "react";
import styles from "@/styles/style.module.css";
import DashboardMain from "@/components/dashboard/dashboard_main";
import {useDispatch} from "react-redux";
import {addNotification} from "@/redux/notifications/NotificationSlice";
import {fetchData} from "@/utility/api_utility";
import Cookies from "js-cookie";
import DashMenu from "@/components/navbar/backup";

const Dashboard = () => {
    const dispatch = useDispatch(); // Initialize Redux dispatch

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userID = Cookies.get("User_ID");
                ``
                const response = await fetchData(`/api/getNotificationDataUpto1Day/${userID}`);

                console.log(response.data.data);


                // Dispatch each notification to Redux
                (response.data.data || []).forEach((notification) => {
                    dispatch(
                        addNotification({
                            id: notification.id,
                            title: notification.title,
                            body: notification.body,
                            read: notification.read,
                            createdAt: notification.created_at,
                        })
                    );
                });
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, [dispatch]); // Add `dispatch` as a dependency for useEffect

    return (
        <div className={styles.root}>
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    {/* <DashMenu /> */}
                    <DashboardMain/>
                </div>
            </nav>
        </div>
    );
};

export default Dashboard;