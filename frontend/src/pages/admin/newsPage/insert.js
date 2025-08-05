import { useEffect, useState, useRef } from "react";
import "./insert.scss";
import { NewsApi } from "services";
import { useNavigate } from "react-router-dom";
import { noImage } from "assets";
import { FaArrowLeft } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SuccessToast } from "components/notifi";

const NewsInsertPage = () => {
    const textEditorRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        image: "",
        content: "",
        type: "Nổi bật"
    });

    const [preview, setPreview] = useState(noImage);
    const [selectedFile, setSelectedFile] = useState(null);

    const destroyEditors = () => {
        if (textEditorRef.current) {
            textEditorRef.current.destroy();
            textEditorRef.current = null;
        }
    };

    useEffect(() => {
        const initEditor = (id, ref) => {
            if (window.CKEDITOR && document.getElementById(id) && !ref.current) {
                ref.current = window.CKEDITOR.replace(id);
            }
        };

        initEditor("content", textEditorRef);

        return () => {
            destroyEditors();
        };
    }, []);

    const sendCloudinary = async (file) => {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", file);
        formDataCloudinary.append("upload_preset", "website-saoviet");
        formDataCloudinary.append("folder", "saoviet");

        try {
            SuccessToast("Đang tải ảnh lên Cloudinary...");

            const response = await fetch("https://api.cloudinary.com/v1_1/doie0qiiq/image/upload", {
                method: "POST",
                body: formDataCloudinary
            });
            
            const data = await response.json();

            if (data.secure_url) {
                SuccessToast("Tải ảnh lên Cloudinary thành công.");
                return data.secure_url;
            } else {
                ErrorToast("Tải ảnh lên Cloudinary thất bại.");
                return null;
            }
        } catch (error) {
            console.error("Failed to upload image: ", error);
            ErrorToast("Không thể tải ảnh lên Cloudinary.");
            return null;
        }
    }

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
            ErrorToast("Chỉ chấp nhận file JPG, PNG, GIF, WEBP.");

            fileInputRef.current.value = "";
            setPreview(noImage);
            setSelectedFile(null);

            return;
        }

        const previewURL = URL.createObjectURL(file);
        setPreview(previewURL);
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const content = textEditorRef.current.getData();
        const updatedFormData = { ...formData, content };

        if (selectedFile === null) {
            ErrorToast("Vui lòng chọn ảnh.")
            return;
        } else if (content === "") {
            ErrorToast("Nội dung không được bỏ trống.")
            return;
        }

        if (selectedFile) {
            const uploadedUrl = await sendCloudinary(selectedFile);
            if (uploadedUrl) {
                updatedFormData.image = uploadedUrl;
            }
        }

        try {
            const response = await NewsApi.create(updatedFormData);

            if (response?.code === 2100) {
                SuccessToast("Thêm tin tức thành công.");

                setFormData({
                    title: "",
                    summary: "",
                    image: "",
                    content: "",
                    type: "Nổi bật"
                });

                setPreview(noImage);
                setSelectedFile(null);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                if (textEditorRef.current) {
                    textEditorRef.current.setData("");
                }
            } else {
                ErrorToast(response.message || "Thêm tin tức không thành công.");
            }
        } catch (error) {
            console.error("Failed to create news: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="news-insert-page px-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="card shadow col-md-7 col-xl-6">
                        <div className="card-body">
                            <h3 className="text-center mb-4 fw-bold">Thêm tin tức</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tiêu đề:</label>
                                    <input name="title" type="text" required value={formData.title} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Tóm tắt:</label>
                                    <textarea name="summary" rows={5} required value={formData.summary} onChange={handleChange} className="form-control" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ảnh:</label>
                                    <div className="image-upload">
                                        <img src={preview} alt="ảnh tin tức" className="mb-2" />
                                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="form-control" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nội dung:</label>
                                    <textarea id="content" name="content" rows={5} required className="form-control" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Loại:</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                                        <option value="Nổi bật">Nổi bật</option>
                                        <option value="Thường">Thường</option>
                                    </select>
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                    <button type="button" className="btn btn-back"
                                        onClick={() => {
                                            destroyEditors();
                                            navigate("/manage/news");
                                        }}>
                                        <FaArrowLeft size={18} color="black" />
                                    </button>
                                    <button type="submit" className="btn btn-submit fw-bold">Thêm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default NewsInsertPage;