import React, { useEffect, useState } from "react";
import "./update.scss";
import { useNavigate, useParams } from "react-router-dom";
import Step1 from "component/admin/tour/update/Step1.js";
import Step2 from "component/admin/tour/update/Step2.js";
import Step3 from "component/admin/tour/update/Step3.js";
import StepZilla from 'react-stepzilla';
import { ToastContainer } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { TourApi } from "services";
import { pick } from "lodash";
import { ErrorToast } from "component/notifi";

const TourUpdatePage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        area: '',
        quantityDay: 1,
        description: '',
        image: [],
        itinerary: []
    });
    const [imgPreview, setImgPreview] = useState({
        image: [],
        previewURLs: [] 
    });
    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const steps = [
        { name: 'Nhập thông tin', component: <Step1 formData={formData} setFormData={setFormData} /> },
        { name: 'Thêm hình ảnh', component: <Step2 formData={formData} setFormData={setFormData} imgPreview={imgPreview} setImgPreview={setImgPreview}/> },
        { name: 'Nhập lộ trình', component: <Step3 id={id} formData={formData} setFormData={setFormData} setImgPreview={setImgPreview}/> },
    ];

    useEffect(() => {
        const fetchTour = async () => {
            setIsLoading(true);

            try {
                const resCheck = await TourApi.checkNotStarted(id);
                const response = await TourApi.getById(id);

                if (response?.code === 1502) {
                    setCode(response?.result?.code);

                    setFormData(
                        pick(
                            response?.result,
                            ["name", "destination", "area", "quantityDay", "description", "image", "itinerary"]
                        )
                    );
                }

                if (resCheck?.code === 1062) {
                    ErrorToast("Tour đang có lịch trình chưa diễn ra. Không thể cập nhật!");
                }
            } catch (error) {
                console.error("Failed to fetch tour: ", error);
                navigate("/manage/error/404");
            }  finally {
                setIsLoading(false);
            }
        }

        fetchTour();
    }, [id])

    if (isLoading) {
        return (
            <div style={{ height: 1000 }}></div>
        );
    }

    return (
        <>
            <div className="tour-update-page">
                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        <div className="x_panel">
                            <div className="x_title">
                                <h2 className="fw-bold">{`Cập nhật Tour #${code}`}</h2>
                                <button type="button" className="btn btn-back float-right"
                                    onClick={() => {
                                        navigate("/manage/tours/index");
                                    }}
                                >
                                    <FaArrowLeft size={18} color="black" />
                                </button>
                                <div className="clearfix"></div>
                            </div>
                            <div className="x_content add-tours mb-3">
                                <StepZilla
                                    nextButtonText={"»"}
                                    backButtonText={"«"}
                                    steps={steps}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
};

export default TourUpdatePage;