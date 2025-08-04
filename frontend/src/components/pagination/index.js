import { memo } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pagesToShow = 3;
    let startPage = Math.max(0, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + pagesToShow - 1);

    if (endPage - startPage + 1 < pagesToShow) {
        startPage = Math.max(0, endPage - pagesToShow + 1);
    }

    const displayedPages = [];
    for (let i = startPage; i <= endPage; i++) {
        displayedPages.push(i);
    }

    return (
        <div className="d-flex justify-content-center pt-4 pb-5">
            <ul className="d-flex align-items-center gap-2 list-unstyled mb-0">
                <li>
                    <button
                        disabled={currentPage === 0}
                        onClick={() => onPageChange(currentPage - 1)}
                        className={`btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center ${
                            currentPage === 0 ? 'disabled' : ''
                        }`}
                        style={{ width: '40px', height: '40px' }}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </li>

                {displayedPages.map((page) => (
                    <li key={page}>
                        <button
                            onClick={() => onPageChange(page)}
                            className={`btn ${
                                page === currentPage
                                    ? 'btn-warning text-white'
                                    : 'btn-outline-secondary'
                            } rounded-circle d-flex align-items-center justify-content-center`}
                            style={{ width: '40px', height: '40px' }}
                        >
                            {page + 1}
                        </button>
                    </li>
                ))}

                <li>
                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => onPageChange(currentPage + 1)}
                        className={`btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center ${
                            currentPage >= totalPages - 1 ? 'disabled' : ''
                        }`}
                        style={{ width: '40px', height: '40px' }}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default memo(Pagination);