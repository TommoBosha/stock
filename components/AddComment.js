import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddComment = ({ orderId, comment, fetchOrders }) => {
    const [currentComment, setCurrentComment] = useState(comment || '');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setCurrentComment(comment || '');
    }, [comment]);

    const handleSaveComment = async () => {
        if (!orderId) {
            alert('ID замовлення не визначено.');
            return;
        }

        await axios.put(`/api/orders`, { orderId, comment: currentComment })
            .then(() => {
                fetchOrders();
                setIsEditing(false);
            })
            .catch(error => console.error('Помилка при оновленні замовлення:', error));
    };

    return (
        <div>
            {isEditing ? (
                <div>
                    <textarea
                        className="textarea textarea-bordered"
                        placeholder="Enter comment here..."
                        value={currentComment}
                        onChange={e => setCurrentComment(e.target.value)}
                    ></textarea>
                    <button className="btn" onClick={handleSaveComment}>Зберегти коментар</button>
                    <button className="btn" onClick={() => setIsEditing(false)}>Скасувати</button>
                </div>
            ) : (
                <div>
                    <p>{comment || 'Немає коментаря'}</p>
                    <button className="btn" onClick={() => setIsEditing(true)}>Редагувати коментар</button>
                </div>
            )}
        </div>
    );
};

export default AddComment;