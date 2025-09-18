import ReCAPTCHA from "react-google-recaptcha";

const RecaptchaCb = ({ setCaptchaToken }) => {
    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    return (
        <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_CB_SITE_KEY}
            onChange={handleCaptchaChange}
        />
    )
}

export default RecaptchaCb;