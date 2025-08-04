import { memo } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const AnimatedCounter = ({ end, duration = 2, className = '', isOnce = false }) => {
    const { ref, inView } = useInView({
        triggerOnce: isOnce,
        threshold: 0.5
    });

    return (
        <span ref={ref} className={`count-text ${className}`}>
            {inView ? <CountUp start={0} end={end} duration={duration} /> : 0}
        </span>
    );
};

export default memo(AnimatedCounter);