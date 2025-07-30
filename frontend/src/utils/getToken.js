import Cookies from "js-cookie";

const getToken = (isAdmin) => {
    if(isAdmin) {
        return Cookies.get("token-admin");
    }
    
    return Cookies.get("token");
};

export default getToken;