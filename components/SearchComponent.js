import Link from 'next/link';
import React, { useState } from 'react';

function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/search?query=${query}`);
            if (!response.ok) throw new Error('Помилка отримання даних');
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <label className="input input-bordered flex items-center gap-2 w-[350px]">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Введіть запит для пошуку..."
                        className="grow border-[0] "
                    />
                    <button type="submit" disabled={isLoading}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
                    </button>

                </label>

            </form>
            {isLoading && <p>Завантаження...</p>}
            {error && <p>Помилка: {error}</p>}
            {results && (
                <div>
                    <h3 className='mt-4'>Результати пошуку:</h3>
                    <div>
                        {results.clients && results.clients.length > 0 && (
                            <div className="overflow-x-auto">
                                <h4 className="font-bold">Клієнти:</h4>
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>

                                            <th>Ім&apos;я</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.clients.map(client => (

                                            <tr key={client._id}>

                                                <td>{client.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {results.companies && results.companies.length > 0 && (
                            <div className="overflow-x-auto">
                                <h4 className="font-bold">Компанії:</h4>
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>

                                            <th>Ім&apos;я</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.companies.map(company => (
                                            <tr key={company._id}>

                                                <td>
                                                    <Link href={`/companies/` + company._id}>
                                                        <span className="font-bold text-primary" >{company.name}</span>
                                                    </Link>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {results.components && results.components.length > 0 && (
                            <div className="overflow-x-auto">
                                <h4 className="font-bold">Комплектуючі:</h4>
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>

                                            <th>Назва</th>
                                            <th>Кількість</th>
                                            <th>Ціна</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {results.components.map(component => (
                                            <tr key={component._id}>

                                                <td>{component.name}</td>
                                                <td>{component.quantity}</td>
                                                <td>{component.unitPrice} грн.</td>
                                            </tr>

                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {results.products && results.products.length > 0 && (
                            <div className="overflow-x-auto">
                                <h4 className="font-bold">Комплектуючі:</h4>
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>

                                            <th>Назва</th>

                                            <th>Ціна</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.products.map(product => (
                                            <tr key={product._id}>

                                                <td>{product.name}</td>
                                                <td>{product.assemblyPrice} грн.</td>
                                            </tr>



                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchComponent;