import { memo, forwardRef, useRef, useEffect } from 'react';
import "./step1.scss";

const Step1 = forwardRef(({ formData, setFormData }, ref) => {
    const textEditorRef = useRef(null);
   
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
    
                ref.current.on('change', () => {
                    const descriptionValue = ref.current.getData();
                    
                    setFormData((prevData) => ({
                        ...prevData,
                        description: descriptionValue,
                    }));
                });
            }
        };
    
        initEditor("description", textEditorRef);
    
        return () => {
            destroyEditors();
        };
    }, []);
    

    useEffect(() => {
        if (formData.description && textEditorRef.current) {
            textEditorRef.current.setData(formData.description);
        }
    }, []);

    return (
        <div className="form-info-tour step-1">
            <div className="form-group row justify-content-center">
                <div className="col-md-7 col-sm-7">
                    <div className="form-group">
                        <label>Tên:</label>
                        <input className="form-control" name="name" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Điểm đến:</label>
                        <input className="form-control" name="destination" value={formData.destination} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Khu vực:</label>
                        <select className="form-control" name="area" value={formData.area} onChange={handleChange}>
                            <option value="b">Miền Bắc</option>
                            <option value="t">Miền Trung</option>
                            <option value="n">Miền Nam</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Số ngày:</label>
                        <input className="form-control" type="number" min={1} name="quantityDay" value={formData.quantityDay} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Mô tả:</label>
                        <textarea id="description" name="description" rows="5" className="form-control" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default memo(Step1);