import React, { useState } from "react";
import "./insert.scss";
import { useNavigate } from "react-router-dom";
import Step1 from "components/admin/tour/insert/Step1.js";
import Step2 from "components/admin/tour/insert/Step2.js";
import Step3 from "components/admin/tour/insert/Step3.js";
import StepZilla from 'react-stepzilla';
import { ToastContainer } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const TourInsertPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        area: 'b',
        quantityDay: 1,
        description: '',
        image: [],
        itinerary: []
    });
    const [imgPreview, setImgPreview] = useState({
        image: [],
        previewURLs: [] 
    });
    const navigate = useNavigate();

    const steps = [
        { name: 'Nhập thông tin', component: <Step1 formData={formData} setFormData={setFormData} /> },
        { name: 'Thêm hình ảnh', component: <Step2 formData={formData} setFormData={setFormData} imgPreview={imgPreview} setImgPreview={setImgPreview}/> },
        { name: 'Nhập lộ trình', component: <Step3 formData={formData} setFormData={setFormData} setImgPreview={setImgPreview}/> },
    ];

    return (
        <>
            <div className="tour-insert-page">
                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        <div className="x_panel">
                            <div className="x_title">
                                <button type="button" className="btn btn-back position-absolute"
                                    onClick={() => {
                                        navigate("/manage/tours/index");
                                    }}
                                >
                                    <FaArrowLeft size={18} color="black" />
                                </button>
                                <div className="d-flex justify-content-center">
                                    <h2 className="fw-bold text-center">Thêm Tour</h2>
                                </div>
                                <div className="clearfix mt-2"></div>
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

export default TourInsertPage;