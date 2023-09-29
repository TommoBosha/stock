import axios from "axios";
import React, { useState } from "react";

export default function Currency({ fetchCurrency }) {
    const [currency, setCurrency] = useState("");
    const [date, setDate] = useState("");

    async function saveCurrency(e) {
        e.preventDefault();
        const data = {
            date: new Date(date),
            currency,
        };

        await axios.post("/api/currency", data);
        setCurrency("");
        setDate("");
        fetchCurrency();
    }

    return (
        <div>
            <form className="flex flex-col" onSubmit={saveCurrency}>
                <div className="flex flex-row gap-1">
                    <div className="flex flex-col">
                        <label>Дата</label>
                        <input
                            type="date"
                            name="date"
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>Курс</label>
                        <input
                            type="text"
                            name="currency"
                            placeholder="Курс"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary py-1 h-10 mt-5">
                        Зберегти
                    </button>
                </div>


            </form>
        </div>
    );
}