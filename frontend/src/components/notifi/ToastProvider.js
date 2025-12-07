import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastBus } from "./toastBus";

export default function ToastProvider() {
    useEffect(() => {
        const handler = ({ type, content }) => {
            toast[type](content, {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
            });
        };

        toastBus.on("show", handler);
        return () => toastBus.off("show", handler);
    }, []);

    return (
        <ToastContainer />
    );
}
