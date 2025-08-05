import { useEffect, useState, useRef } from "react";
import "./update.scss";
import { NewsApi } from "services";
import { useNavigate, useParams } from "react-router-dom";
import { noImage } from "assets";
import { FaArrowLeft } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SuccessToast } from "components/notifi";
import { pick } from "lodash";

const NewsUpdatePage = () => {
    const { id } = useParams();
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
        const initEditor = () => {
            if (window.CKEDITOR && document.getElementById("content") && !textEditorRef.current) {
                textEditorRef.current = window.CKEDITOR.replace("content");
    
                textEditorRef.current.on('instanceReady', function () {
                    textEditorRef.current.setData(formData.content);
                });
            }
        };
    
        initEditor();
    
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

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await NewsApi.getByIdAndAdmin(id);

                if (response?.code === 2105) {
                    setFormData(
                        pick(
                            response?.result,
                            ["title", "summary", "image", "content", "type"]
                        )
                    );

                    setPreview(response?.result?.image);
                    
                    setTimeout(() => {
                        if (textEditorRef.current) {
                            textEditorRef.current.setData(response?.result?.content);
                        }
                    }, 200)
                } else {
                    navigate("/manage/error/404");
                }
            } catch (error) {
                console.error("Failed to fetch news: ", error);
                navigate("/manage/error/404");
            }
        }

        fetchNews();
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault();

        const content = textEditorRef.current.getData();
        const updatedFormData = { ...formData, content };

        if (content === "") {
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
            const response = await NewsApi.update(id, updatedFormData);

            if (response?.code === 2103) {
                SuccessToast("Cập nhật tin tức thành công.");
            } else {
                ErrorToast(response.message || "Cập nhật tin tức không thành công.");
            }
        } catch (error) {
            console.error("Failed to update news: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="news-update-page px-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="card shadow col-md-7 col-xl-6">
                        <div className="card-body">
                            <h3 className="text-center mb-4 fw-bold">Cập nhật tin tức</h3>
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
                                    <button type="submit" className="btn btn-submit fw-bold">Cập nhật</button>
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

export default NewsUpdatePage;