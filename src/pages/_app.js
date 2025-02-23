import "@/styles/style.module.css";
import "@/styles/output.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/ui/global.css";
import { createContext, useEffect, useMemo, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import Store from "../redux/Store";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketContext } from "@/contexts/SocketContext";
import toast, { Toaster } from "react-hot-toast";
import { getSocket } from "@/utility/socketConnection";
import { addNotification } from "@/redux/notifications/NotificationSlice";
import Cookies from "js-cookie";
import DashMenu from "@/components/navbar/navbar";

export const ValidationContext = createContext();

const NotificationHandler = ({ socket }) => {
  const dispatch = useDispatch();
  const userId = Cookies.get("User_ID");
  const [validationMessages, setValidationMessages] = useState([]);

  useEffect(() => {
    socket.emit("register", userId);

    const handleNotification = (data) => {
      const notifications = Array.isArray(data) ? data : [data];
      notifications.forEach((notification) => {
        if (notification.body) {
          dispatch(
            addNotification({
              id: notification.id || Date.now(),
              title: notification.title || "Notification",
              body: notification.body,
              read: false,
              createdAt: notification.created_at,
            })
          );
          toast.success(notification.body);
        } else {
          console.warn("Invalid notification structure:", notification);
        }
      });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      socket.disconnect();
    };
  }, [socket, userId, dispatch]);

  return null;
};

export default function App({ Component, pageProps }) {
  const [validationMessages, setValidationMessages] = useState([]);
  const socket = getSocket();

  const validationContextValue = useMemo(
    () => ({
      addValidationMessage: (content, type = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setValidationMessages((prev) => [...prev, { id, type, content }]);

        setTimeout(() => {
          setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, 4000);
      },
      validationMessages,
      handleCloseMessage: (id) => {
        setValidationMessages((prev) => prev.filter((msg) => msg.id !== id));
      },
    }),
    [validationMessages]
  );

  return (
    <Provider store={Store}>
      <AuthProvider>
        <SocketContext.Provider value={socket}>
          <ValidationContext.Provider value={validationContextValue}>
            {Cookies.get("User_ID") && <DashMenu />}
            <NotificationHandler socket={socket} />
            <Component {...pageProps} />
          </ValidationContext.Provider>
        </SocketContext.Provider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              border: "1px solid #713200",
              padding: "16px",
              color: "#713200",
            },
            success: {
              style: {
                background: "green",
                color: "white",
              },
            },
          }}
        />
      </AuthProvider>
    </Provider>
  );
}
