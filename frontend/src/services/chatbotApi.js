import axiosInstance from "utils/axiosInstance";

const ChatbotApi = {
    generateCode: () => {
        return axiosInstance.get("/api/v1/chatbot/generate-code");
    },
    getMessages: (code) => {
        return axiosInstance.get(`/api/v1/chatbot/${code}`);
    },
    ask: (id, data) => {
        return axiosInstance.post(`/api/v1/chatbot/${id}`, data);
    },
};

export default ChatbotApi;