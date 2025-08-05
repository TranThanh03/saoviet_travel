import { createContext, memo, useEffect, useState } from 'react';
import Header from '../header';
import Footer from '../footer';
import { useLocation } from 'react-router-dom';
import Chatbot from 'components/chatbot';
import { AuthApi } from 'services';

export const AuthContext = createContext(null);

const MasterLayout = ({ children, ...props }) => {
    const location = useLocation();
    const path = location.pathname;
    const isValidPath = !path.includes("/auth") && !path.includes("/error") && !path.includes("/customers/activate");
    const [authenticated, setAuthenticated] = useState(false);
    
    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const response = await AuthApi.introspect();
                
                if (response?.code === 9998) {
                    setAuthenticated(response?.result);
                }
            } catch (error) {}
        };

        fetchAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ authenticated }}>
            <div className="page-saoviet" {...props}>
                <link rel="stylesheet" href="/user/css/style.css" />
                <link rel="stylesheet" href="/user/css/fontawesome-5.14.0.min.css" />
                <link rel="stylesheet" href="/user/css/slick.min.css" />
                <link rel="stylesheet" href="/user/css/flaticon.min.css" />
                
                {isValidPath && <Header />}
                {children}
                {isValidPath && <Chatbot />}
                {isValidPath && <Footer />}
            </div>
        </AuthContext.Provider>
    );
};

export default memo(MasterLayout);