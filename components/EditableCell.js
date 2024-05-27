import React, { useState, useEffect } from 'react';

const EditableCell = ({ initialValue, type, isEditing, onSave }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = () => {
        onSave(value);
    };

    return (
        <div>
            {isEditing ? (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
            ) : (
                <span>{value}</span>
            )}
        </div>
    );
};

export default EditableCell;