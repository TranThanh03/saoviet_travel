import { useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const PasswordInput = ({ value, onChange, name, id, placeholder, label = '' }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <>
            {label === '' ? (
                <div className="position-relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg fs-6 pe-5"
                        placeholder={placeholder}
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                    />

                    <span
                        onClick={togglePassword}
                        className="position-absolute top-50 end-0 translate-middle-y mx-3"
                        style={{ cursor: 'pointer' }}
                    >
                        {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </span>
                </div>
            ) : (
                <>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control pe-5"
                        placeholder={placeholder}
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                    />
                    <label htmlFor={id}>{label}</label>

                    <span
                        onClick={togglePassword}
                        className="position-absolute float-right end-0 translate-middle-y mx-3"
                        style={{ cursor: 'pointer', top: '35px' }}
                    >
                        {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </span>
                </>
            )}
            
                        
        </>
    );
};

export default PasswordInput;