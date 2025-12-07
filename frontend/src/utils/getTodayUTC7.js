const getTodayUTC7 = () => {
    const now = new Date();
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return utc7;
};

export default getTodayUTC7;