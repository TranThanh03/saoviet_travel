import { ErrorToast, SuccessToast } from "components/notifi";
import { useState, memo, forwardRef, useEffect } from "react";
import "./step2.scss";

const Step2 = forwardRef(({ formData, setFormData, imgPreview, setImgPreview }, ref) => {
    const [uploading, setUploading] = useState(false);
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 4;

    const sendCloudinary = async (file) => {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", file);
        formDataCloudinary.append("upload_preset", "website-saoviet");
        formDataCloudinary.append("folder", "saoviet");

        try {
            const response = await fetch(process.env.REACT_APP_UPLOAD_IMAGES_URL, {
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
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, maxFiles);

        if ((formData.image.length + imgPreview.image.length + files.length) > maxFiles) {
            ErrorToast("Tối đa chỉ được chọn 4 ảnh.");
            return;
        }

        const validFiles = [];
        const newPreviewURLs = [];

        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                ErrorToast("Chỉ chấp nhận file JPG, PNG, GIF, WEBP.");
            } else if (file.size > maxSize) {
                ErrorToast(`${file.name} vượt quá dung lượng cho phép (5MB).`);
            } else {
                validFiles.push(file);
                newPreviewURLs.push(URL.createObjectURL(file));
            }
        }

        if (validFiles.length > 0) {
            setImgPreview((prev) => ({
                image: [...prev.image, ...validFiles],
                previewURLs: [...prev.previewURLs, ...newPreviewURLs]
            }));
        }
    };

    const handleDeletePreview = (index) => {
        const updatedImages = [...imgPreview.image];
        const updatedPreviews = [...imgPreview.previewURLs];

        URL.revokeObjectURL(updatedPreviews[index]);

        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setImgPreview({
            image: updatedImages,
            previewURLs: updatedPreviews
        });
    };

    const handleDeleteImage = (index) => {
        const updatedImages = [...formData.image];
        updatedImages.splice(index, 1);

        setFormData({
            ...formData,
            image: updatedImages
        });
    };

    const handleSaveImages = async () => {
        if (imgPreview.image.length === 0) {
            ErrorToast("Vui lòng chọn ảnh.");
            return;
        }

        setUploading(true);
        SuccessToast("Đang tải hình ảnh lên Cloudinary...")

        try {
            const uploaders = imgPreview.image.map((file) => sendCloudinary(file));
            const urls = await Promise.all(uploaders);

            const successUrls = urls.filter(Boolean);

            if (successUrls.length > 0) {
                setFormData((prevData) => ({
                    ...prevData,
                    image: [...prevData.image, ...successUrls],
                }));

                const remainingPreviews = imgPreview.image.filter((_, idx) => !urls[idx] || !successUrls.includes(urls[idx]));
                const remainingPreviewURLs = imgPreview.previewURLs.filter((_, idx) => !urls[idx] || !successUrls.includes(urls[idx]));

                imgPreview.previewURLs.forEach((url, idx) => {
                    if (urls[idx] && successUrls.includes(urls[idx])) {
                        URL.revokeObjectURL(url);
                    }
                });

                setImgPreview({
                    image: remainingPreviews,
                    previewURLs: remainingPreviewURLs
                });
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            ErrorToast("Có lỗi xảy ra khi lưu ảnh.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const primaryBtns = document.querySelectorAll('.footer-buttons .btn-primary');
        
        primaryBtns.forEach(btn => {
            if (uploading) {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'true');
            } else {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
            }
        });
    }, [uploading]);

    return (
        <div className="step-2">
            <div className="form-group">
                <h2 className="StepTitle fw-bold">Chọn hình ảnh:</h2>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="form-control rounded-1"
                />
                <p className="msg-error"><i>Upload tối đa 4 file ảnh.</i></p>
            </div>

            <div className="row my-4 upload-custom">
                {imgPreview.previewURLs.map((url, idx) => (
                    <div className="col-md-3 mb-2" key={idx}>
                        <img src={url} alt="Preview" className="img-thumbnail" />
                        <button onClick={() => handleDeletePreview(idx)}>Xóa</button>
                    </div>
                ))}
            </div>

            <p className="fw-bold color-green">Ảnh upload thành công:</p>
            <div className="row mt-2 upload-custom">
                {formData.image.map((url, idx) => (
                    <div className="col-md-3 mb-2" key={idx}>
                        <img src={url} alt="Image success" className="img-thumbnail" />
                        <button onClick={() => handleDeleteImage(idx)}>Xóa</button>
                    </div>
                ))}
            </div>

            <div className="mt-3 btn-control">
                <button className="btn btn-primary" onClick={handleSaveImages}>Upload Cloudinary</button>
            </div>
        </div>
    );
});

export default memo(Step2);