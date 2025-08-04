import { memo, forwardRef, useRef, useEffect } from "react";
import "./step3.scss";
import { ErrorToast, SuccessToast } from "@components/notifi";
import { TourApi } from "services";

const Step3 = forwardRef(({ formData, setFormData, setImgPreview }, ref) => {
    const textEditorRefs = useRef([]);

    const destroyEditors = () => {
        textEditorRefs.current.forEach((editor, i) => {
            if (editor) {
                editor.destroy();
                textEditorRefs.current[i] = null;
            }
        });
    };

    const handleItineraryChange = (index, field, value) => {
        const updated = [...formData.itinerary];
        updated[index][field] = value;

        setFormData({ ...formData, itinerary: updated });
    };

    useEffect(() => {
        const days = parseInt(formData.quantityDay) || 0;
    
        const newItinerary = Array.from({ length: days }, (_, i) => {
            return formData.itinerary[i] || {
                title: "",
                description: "",
                dayNumber: i + 1
            };
        });
    
        if (JSON.stringify(newItinerary) !== JSON.stringify(formData.itinerary)) {
            setFormData({ ...formData, itinerary: newItinerary });
        }
    
        for (let i = 0; i < days; i++) {
            const editorId = `description-${i}`;
            if (window.CKEDITOR && document.getElementById(editorId)) {
                if (textEditorRefs.current[i]) {
                    textEditorRefs.current[i].destroy();
                    textEditorRefs.current[i] = null;
                }
    
                textEditorRefs.current[i] = window.CKEDITOR.replace(editorId);
    
                if (formData.itinerary[i]?.description) {
                    textEditorRefs.current[i].setData(formData.itinerary[i].description);
                }
    
                textEditorRefs.current[i].on("change", () => {
                    const descriptionValue = textEditorRefs.current[i].getData();
                    handleItineraryChange(i, "description", descriptionValue);
                });
            }
        }
    
        return () => {
            destroyEditors();
        };
    }, [formData.quantityDay]);    

    const renderItineraries = () => {
        const days = parseInt(formData.quantityDay) || 0;

        const itinerary = [...Array(days)].map((_, i) => {
            if (!formData.itinerary[i]) {
                formData.itinerary[i] = { title: "", description: "", dayNumber: i + 1 };
            }

            return (
                <div key={i} className="form-group">
                    <h5 className="fw-bold">Ngày {i + 1}:</h5>
                    <input
                        type="text"
                        className="form-control mb-2 rounded-1"
                        placeholder="Tiêu đề"
                        value={formData.itinerary[i].title}
                        onChange={(e) => handleItineraryChange(i, "title", e.target.value)}
                    />

                    <textarea
                        rows="5"
                        id={`description-${i}`}
                        className="form-control"
                        placeholder="Mô tả"
                    ></textarea>
                </div>
            );
        });

        return itinerary;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.destination || !formData.area || !formData.description || formData.image.length === 0 || formData.itinerary.length === 0) {
            ErrorToast("Vui lòng nhập đầy đủ thông tin.")
            return;
        }
        else if(formData.quantityDay < 1) {
            ErrorToast("Số ngày không hợp lệ.")
            return;
        }

        try {
            const response = await TourApi.create(formData);

            if (response?.code === 1500) {
                SuccessToast("Thêm tour mới thành công.")

                setFormData({
                    name: '',
                    destination: '',
                    area: 'b',
                    quantityDay: '',
                    description: '',
                    image: [],
                    itinerary: []
                });

                setImgPreview({
                    image: [],
                    previewURLs: []
                });
            } else {
                ErrorToast(response.message || "Thêm tour không thành công.");
            }
        } catch (error) {
            console.error("Failed to create tour: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="step-3">
            {renderItineraries()}

            <div className="btn-control">
                <button type="button" className="btn btn-submit" onClick={handleSubmit}>
                    Thêm
                </button>
            </div>
        </div>
    );
});

export default memo(Step3);