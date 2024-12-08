import React from 'react';

const Pagination = ({ invoicesPerPage, totalInvoices, paginate, currentPage }) => {
    const totalPages = Math.ceil(totalInvoices / invoicesPerPage) || 1; 

   
    if (totalPages <= 1) {
        return null;
    }

   
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    
    const getVisiblePages = () => {
        if (totalPages <= 5) {
          
            return pageNumbers;
        }

        if (currentPage <= 3) {
           
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
           
            return [1, 2, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

       
        return [
            1,
            2,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages,
        ];
    };

    const visiblePages = getVisiblePages();

    return (
        <div className='flex justify-center mt-4'>
            <div className="join justify-center items-center">
                {visiblePages.map((number, index) => (
                    <button
                        key={index}
                        onClick={() => typeof number === 'number' && paginate(number)}
                        className={`join-item btn btn-square ${currentPage === number ? 'btn-active ' : ''} ${number === '...' ? 'btn-disabled' : ''}`}
                        disabled={number === '...'}
                    >
                        {typeof number === 'number' ? number : '...'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Pagination;
