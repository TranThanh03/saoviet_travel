import { memo, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { noImage } from 'assets';
import { sanitizeHtml } from 'utils/sanitizeHtml.js';
import './detail.scss';
import { NewsApi } from 'services';
import formatDatetime from 'utils/formatDatetime.js';

const NewsDetailPage = () => {
    const { id } = useParams();
    const [news, setNews] = useState({});
    const [listNews, setListNews] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await NewsApi.getById(id);

                if (response?.code === 2102) {
                    setNews(response?.result);

                    if (response?.result?.type === "Nổi bật") {
                        fetchOutstandingList();
                    } else if (response?.result?.type === "Thường") {
                        fetchTopNewList();
                    }
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

    const fetchOutstandingList = async () => {
        try {
            const response = await NewsApi.getOutstandingList(id);

            if (response?.code === 2108) {
                setListNews(response?.result);
            }
        } catch (error) {
            console.error("Failed to fetch list news: ", error);
            navigate("/manage/error/404");
        }
    }

    const fetchTopNewList = async () => {
        try {
            const response = await NewsApi.getTopNewList(id);

            if (response?.code === 2109) {
                setListNews(response?.result);
            }
        } catch (error) {
            console.error("Failed to fetch list news: ", error);
            navigate("/manage/error/404");
        }
    };

    return (
        <div className='news-detail-page'>
            <article className="news-detail">
                <h1>{news.title || ''}</h1>
                
                <div className="article-meta">
                    <span>{`Mã: ${news.code}`}</span>
                    <span>{`Ngày đăng: ${news.timeStamp ? formatDatetime(news.timeStamp) : ''}`}</span>
                    <span><i class="fa-regular fa-eye me-1"></i>{news.viewCount || 0}</span>
                </div>
                
                <img src={news.image || noImage} alt="Ảnh" className="featured-image" /> 
                
                <div className="article-content">
                    <p>{news.summary || ''}</p>
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content || '') }}></p>
                </div>
                
                <div className="share-buttons">
                    <h3>Chia sẻ bài viết</h3>
                    <Link to="#" className="share-button facebook">Facebook</Link>
                    <Link to="#" className="share-button twitter">Twitter</Link>
                    <Link to="#" className="share-button linkedin">LinkedIn</Link>
                </div>
            </article>
            
            {listNews.length > 0 && (
                <aside className="sidebar">
                        <section className="popular-posts">
                            <h3>{news.type === "Nổi bật" ? 'Tin tức nổi bật' : 'Tin tức mới nhất'}</h3>
                            
                            <ul>
                                {listNews.map((item, index) => (
                                    <li key={index}>
                                        <Link to={`/news/detail/${item.id}`}>
                                            <img src={ item.image || noImage } alt="Ảnh" />
                                            <div className="popular-post-info">
                                                <h4>{item.title || ''}</h4>
                                                <span className="post-date">{item.timeStamp ? formatDatetime(item.timeStamp) : ''}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                </aside>
            )}
        </div>
    )
}

export default memo(NewsDetailPage);