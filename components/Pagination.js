import React from 'react';

const Pagination = ({ invoicesPerPage, totalInvoices, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalInvoices / invoicesPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className='flex justify-center mt-4'>
            <div className="join justify-center items-center">
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`join-item btn btn-square ${currentPage === number ? 'btn-active ' : ''}`} >
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Pagination;