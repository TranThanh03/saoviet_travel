import { memo, useEffect, useState } from "react";

const Countdown = ({ expiredTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    const calc = () => new Date(expiredTime).getTime() - Date.now();

    useEffect(() => {
        setTimeLeft(calc());

        const timer = setInterval(() => {
            const t = calc();
            setTimeLeft(t);
            
            if (t <= 0) {
                clearInterval(timer);
                onExpire && onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiredTime]);

    if (timeLeft <= 0) {
        return null;
    }

    const minutes = String(Math.floor(timeLeft / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");

    return <span>{minutes}:{seconds}</span>;
};

export default memo(Countdown);
