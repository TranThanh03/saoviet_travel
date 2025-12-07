import { toastBus } from "./toastBus";

export const SuccessToast = (content) => {
    toastBus.emit("show", { type: "success", content });
};

export const ErrorToast = (content) => {
    toastBus.emit("show", { type: "error", content });
};
