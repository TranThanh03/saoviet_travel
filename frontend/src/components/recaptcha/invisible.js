import ReCAPTCHA from "react-google-recaptcha";
import { useRef, forwardRef, useImperativeHandle } from "react";

const RecaptchaInv = forwardRef((props, ref) => {
    const recaptchaRef = useRef();

    useImperativeHandle(ref, () => ({
        async executeAsync() {
            try {
                if (recaptchaRef.current) {
                    const token = await recaptchaRef.current.executeAsync();
                    recaptchaRef.current.reset();
                    return token;
                }
                return null;
            } catch (error) {
                console.error("reCAPTCHA error:", error);
                return null;
            }
        }
    }));

    return (
        <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_INV_SITE_KEY}
            size="invisible"
            badge="bottomright"
            hl="en"
        />
    );
});

export default RecaptchaInv;