import {io} from "socket.io-client";

let socket = null; // Singleton instance

export const getSocket = () => {

    const baseApiUrl = process.env.NEXT_PUBLIC_MOSCARE;

    if (!socket) {
        socket = io(baseApiUrl, {});

        // Optional: Debugging logs
        socket.on("connect", () => {
            console.log(`Connected to server: ${socket.id}`);
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected from server`);
        });
    }
    return socket;
};