import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {postData} from "@/utility/api_utility";

// Async thunk to mark a notification as read
export const markAsReadAsync = createAsyncThunk(
    "notifications/markAsRead",
    async (id, {rejectWithValue}) => {
        try {
            await postData(`/api/markNotificationAsRead`, {notificationID: id});
            return id; // Return the notification ID to update the state
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunk to ignore a notification
export const ignoreNotificationAsync = createAsyncThunk(
    "notifications/ignoreNotification",
    async (id, {rejectWithValue}) => {
        try {
            await postData(`/api/markNotificationAsIgnored`, {notificationID: id});
            return id; // Return the notification ID to remove from the state
        } catch (error) {
            console.error("Error ignoring notification:", error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        error: null,
        loading: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
    extraReducers: (builder) => {
        // Mark as Read
        builder
            .addCase(markAsReadAsync.fulfilled, (state, action) => {
                const notification = state.notifications.find((n) => n.id === action.payload);
                if (notification) {
                    notification.read = true;
                }
            })
            .addCase(markAsReadAsync.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Ignore Notification
        builder
            .addCase(ignoreNotificationAsync.fulfilled, (state, action) => {
                state.notifications = state.notifications.filter((n) => n.id !== action.payload);
            })
            .addCase(ignoreNotificationAsync.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {addNotification, clearNotifications} = notificationSlice.actions;

export default notificationSlice.reducer;