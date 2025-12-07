import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import RouterCustom from './router.js';
import './styles/style.scss';
import Loading from 'components/loading/index.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ToastProvider from 'components/notifi/ToastProvider.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

const App = () => {
    useEffect(() => {
        AOS.init({ 
            duration: 1500,
            once: false,
            mirror: true,
            easing: 'ease',
        });

        AOS.refresh();
    }, []);

    return (
        <>
            <RouterCustom />
            <Loading />
            <ToastProvider />
        </>
    )
};

root.render(<App />);
