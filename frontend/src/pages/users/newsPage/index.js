import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { noImage } from 'assets';
import './style.scss';
import { NewsApi } from 'services';

const NewsPage = () => {
    const [outstanding, setOutstanding] = useState({});
    const [topNew, setTopNew] = useState([]);

    useEffect(() => {
        const fetchOutstanding = async () => {
            try {
                const response = await NewsApi.getOutstanding();

                if (response?.code === 2106) {
                    setOutstanding(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch outstanding news: ", error);
            }
        }

        fetchOutstanding();
    }, [])

    useEffect(() => {
        const fetchTopNew = async () => {
            try {
                const response = await NewsApi.getTopNew();

                if (response?.code === 2107) {
                    setTopNew(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch top news: ", error);
            }
        }

        fetchTopNew();
    }, [])

    return (
        <div className='news-page'>
            {outstanding && (
                <section className="featured-news">
                    <h2 className="fw-bold" data-aos="fade-top" data-aos-duration="1500" data-aos-offset="50">Tin nổi bật</h2>

                    <Link to={`/news/detail/${outstanding.id}`} data-aos="fade-top" data-aos-duration="1500" data-aos-offset="50">
                        <article className="featured-article">
                            <img src={outstanding.image || noImage} alt="Ảnh" />
                            <h4 className="fw-bold">{outstanding.title || ''}</h4>
                            <p className="ellipsis">{outstanding.summary || ''}</p>
                            <span>
                                <i className="fa-regular fa-eye me-1"></i>
                                {outstanding.viewCount || 0}
                            </span>
                        </article>
                    </Link>
                </section>
            )}

            {topNew.length > 0 && (
                <section className="news-list">
                    <h2 className="fw-bold" data-aos="fade-top" data-aos-duration="1500" data-aos-offset="50">Tin tức mới nhất</h2>
                        {topNew.map((item, index) => (
                            <Link key={index} to={`/news/detail/${item.id || ''}`} data-aos="fade-top" data-aos-duration="1500" data-aos-offset="50">
                                <article key={index} className="news-item" style={{ height: "100%" }}>
                                    <img src={item.image || noImage} alt="Ảnh" />
                                    <h5 className="fw-bold">{item.title || ''}</h5>
                                    <p className="ellipsis">{item.summary || ''}</p>
                                    <span>
                                        <i className="fa-regular fa-eye me-1"></i>
                                        {item.viewCount || 0}
                                    </span>
                                </article>
                            </Link>
                        ))}
                </section>
            )}

            <section className="news-categories">
                <h2 data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">Chuyên mục</h2>
                <ul>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Điểm đến hot</Link></li>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Ẩm thực du lịch</Link></li>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Mẹo vặt cho du khách</Link></li>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Văn hóa & Lễ hội</Link></li>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Khuyến mãi tour</Link></li>
                    <li data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50"><Link to="#">Trải nghiệm du lịch</Link></li>
                </ul>
            </section>

            <section className="newsletter">
                <h2>Đăng ký nhận tin</h2>
                <p>Nhận những thông tin du lịch mới nhất và ưu đãi hấp dẫn!</p>
                    <input type="email" placeholder="Nhập email của bạn" />
                    <button type="button">Đăng ký</button>
            </section>
        </div>
    )
}

export default memo(NewsPage);