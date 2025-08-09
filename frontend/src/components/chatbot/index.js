import { memo, useEffect, useRef, useState } from 'react';
import './style.scss';
import { FaPaperPlane } from 'react-icons/fa';
import { ChatbotApi } from 'services';
import { Link } from 'react-router-dom';
import { noImage } from 'assets';
import formatCurrency from 'utils/formatCurrency.js';
import formatDatetime from 'utils/formatDatetime.js';
import { ErrorToast } from 'components/notifi';
import { ToastContainer } from 'react-toastify';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: null,
            content: null,
            senderType: null,
            createdTime: null
        }
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState(null);
    const messagesEndRef = useRef(null);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, [isOpen, messages]);

    useEffect(() => {
        const fetchGenerateCode = async () => {
            try {
                setIsLoading(true);
                const codeValue = localStorage.getItem("code");
        
                if (codeValue !== null) {
                    setCode(codeValue);
                    return;
                }
        
                const response = await ChatbotApi.generateCode();
        
                if (response?.code === 2201 && response?.result) {
                    localStorage.setItem("code", response.result);
                    setCode(response.result);
                } else {
                    console.warn("Unexpected response from generate code:", response);
                }
            } catch (error) {
                console.error("Failed to fetch generate code:", error);
            } finally {
                setIsLoading(false);
            }
        };        

        if (isOpen) {
            fetchGenerateCode();
        }
    }, [isOpen])

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setIsLoading(true);
                const response = await ChatbotApi.getMessages(code);

                if (response?.code === 2202) {
                    setMessages(response?.result);
                    setMessages(prev => [
                        ...prev,
                        { senderType: 'chatbot', content: 'Xin chào! Tôi là trợ lý ảo của Sao Việt, bạn cần hỗ trợ gì?' }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch messages: ", error);
                setMessages(prev => [
                    ...prev,
                    { senderType: 'chatbot', content: 'Xin chào! Tôi là trợ lý ảo của Sao Việt, bạn cần hỗ trợ gì?' }
                ]);
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && code && !hasFetched) {
            fetchMessages();
            setHasFetched(true);
        }
    }, [isOpen, code])

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!input.trim()) return;

        setMessages([...messages, { senderType: 'customer', content: input.trim() }]);
        setInput('');

        try {
            setIsLoading(true);
            const response = await ChatbotApi.ask(messages[0]?.id, input.trim());

            if (response?.code === 2200) {
                if (response?.result) {
                    setMessages(prev => [
                        ...prev,
                        { senderType: 'chatbot', content: response?.result }
                    ]);
                } else {
                    setMessages(prev => [
                        ...prev,
                        { senderType: 'chatbot', content: response?.message }
                    ]);
                }
            } else if (response?.code === 1064 || response?.code === 1065) {
                setMessages(prev => [
                    ...prev,
                    { senderType: 'chatbot', content: response?.message }
                ]);
            } else {
                ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Failed to fetch ask chatbot: ", error);
            ErrorToast("Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {!isOpen && (
                <div className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                    <i className="fa-solid fa-robot fa-shake"></i>
                </div>
            )}

            {isOpen && (
                <div className="chatbot-container shadow">
                    <div className="chatbot-header bg-primary text-white d-flex justify-content-between align-items-center p-2 fw-bold">
                        <span>💬 Chat với Sao Việt</span>
                        <span className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✖</span>
                    </div>

                    <div className="chatbot-body p-2">
                        {messages.length > 0 && messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.senderType || "chatbot"}`}>
                                {((msg.content !== null && msg.content !== "") || (Array.isArray(msg.content) && msg.content.length > 0)) && (
                                    <>
                                        <div className="message-text" style={{ backgroundColor: Array.isArray(msg.content) ? "transparent" : "" }}>
                                            {Array.isArray(msg.content) && msg.content.length > 0 ? (
                                                <div className="tour-grid-wrap">
                                                    <div className="row">
                                                        {msg.content.map((item) => (
                                                            <div key={item.id} className="tour-card-custom col-sm-6 col-md-12">
                                                                <Link to={`/tour/detail/${item.id}`}>
                                                                    <div className="destination-item tour-grid style-three bgc-lighter block_tours equal-block-fix shadow-sm">
                                                                        <div className="image">
                                                                            <img src={item.image || noImage} alt="tour-image" />
                                                                        </div>

                                                                        <div className="content equal-content-fix">
                                                                            <div className="destination-header">
                                                                                <span className="location">
                                                                                    <i className="fal fa-map-marker-alt me-2"></i>{item.destination}
                                                                                </span>
                                                                            </div>
                                                                            <h6 className="fw-bold mb-2">{item.name}</h6>
                                                                            <ul className="blog-meta">
                                                                                <li><i className="far fa-clock me-2"></i>{item.quantityDay} ngày {item.quantityDay-1} đêm</li>
                                                                                <li><i className="far fa-user me-2"></i>{item.people}</li>
                                                                            </ul>
                                                                            <ul className="blog-meta">
                                                                                <li>
                                                                                    <i className="fa-solid fa-plane-departure me-2"></i>
                                                                                    {item.startDate ? formatDatetime(item.startDate) : ''}
                                                                                </li>
                                                                            </ul>
                                                                            <ul className="blog-meta">
                                                                                <li>
                                                                                    <i className="fas fa-plane-arrival me-2"></i>
                                                                                    {item.endDate ? formatDatetime(item.endDate) : ''}
                                                                                </li>
                                                                            </ul>
                                                                            <div className="destination-footer">
                                                                                <span className="price">
                                                                                    <span className="color-red" style={{ fontSize: "16px"}}>{item.adultPrice ? formatCurrency(item.adultPrice) : 0}</span> / người
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ): (
                                                msg.content
                                            )}
                                        </div>
                                        <div className="message-time">
                                            {msg.createdTime ? formatDatetime(msg.createdTime) : ''}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message chatbot">
                                <div className="message-text">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input d-flex border-top p-2"
                        onSubmit={(e) => {
                            handleSend(e);
                        }}
                    >
                        <input type="text" className="form-control me-2" placeholder="Nhập tin nhắn..."  value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />

                        <button type="submit" className="btn btn-primary d-flex align-items-center">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default memo(Chatbot);