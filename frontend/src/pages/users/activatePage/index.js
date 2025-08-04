import Loading from 'components/loading';
import { memo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomerApi } from 'services';

const ActivatePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActivate = async () => {
            try {
                const response = await CustomerApi.activate(id);

                if (response?.code === 1307) {
                    navigate("/auth/login");
                }
                else {
                    navigate("/error/404");
                }
            }
            catch (error) {
                console.error("Failed to fetch data:", error);
                navigate("/error/404");
            }
        };

        fetchActivate();
    }, [id, navigate]);

    return (
        <Loading />
    );
};

export default memo(ActivatePage);