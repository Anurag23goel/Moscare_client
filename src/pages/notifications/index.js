import React, {useEffect, useState} from "react";
import {deleteData, fetchData, postData} from "@/utility/api_utility";
import Cookies from "js-cookie";

const Notifications = () => {
    const [allNotifications, setAllNotifications] = useState([]);

    const userId = Cookies.get("User_ID");

    // Fetch notifications from the backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetchData(`/api/getNotificationData/${userId}`);
                console.log("Notifications fetched:", response.data.data);
                setAllNotifications(response.data.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []); // Fetch notifications on component mount

    // Mark notification as read
    const markAsReadNotification = async (id) => {
        try {
            await postData(`/api/markNotificationAsRead`, {notificationID: id});
            setAllNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id
                        ? {...notification, read_status: true}
                        : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Delete a single notification
    const deleteNotification = async (id) => {
        try {
            await deleteData(`/api/deleteNotification`, {notificationID: id});
            setAllNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification.id !== id)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    // Delete all notifications
    const deleteAllNotifications = async () => {
        try {
            await deleteData(`/api/deleteAllNotifications`, {userID: userId});
            setAllNotifications([]); // Clear all notifications from state
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center gap-4 p-6">
            <h1 className="text-xl font-bold text-gray-700 mb-6 text-center">
                Notifications
            </h1>
            <div className="flex justify-center items-center mb-6">
                <button
                    onClick={deleteAllNotifications}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-300 hover:text-gray-800 transition-colors text-sm"
                >
                    Delete All Notifications
                </button>
            </div>
            {allNotifications.length > 0 ? (
                <div className="w-90% flex items-center justify-center gap-10">
                    {allNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex flex-col justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            {/* Content */}
                            <div className="mb-4">
                                <p
                                    className={`text-sm font-medium mb-2 ${
                                        notification.read_status ? "text-gray-500" : "text-gray-800"
                                    }`}
                                >
                                    {notification.body}
                                </p>
                                <p className="text-xs text-gray-400" title="Notification time">
                                    {new Date(notification.created_at).toLocaleString()}
                                </p>
                            </div>
                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                {!notification.read_status && (
                                    <button
                                        onClick={() => markAsReadNotification(notification.id)}
                                        className="bg-green-500 text-white px-2 py-1 rounded-md text-xs shadow-sm hover:bg-green-600 transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded-md text-xs shadow-sm hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 mt-12">
                    No notifications available.
                </p>
            )}
        </div>


    );
};

export default Notifications;