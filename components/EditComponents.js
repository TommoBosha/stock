import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditComponents = ({ components, onUpdate }) => {
    const [editedComponents, setEditedComponents] = useState(components);
    const [availableComponents, setAvailableComponents] = useState([]);

    useEffect(() => {
        axios.get('/api/components')
            .then(result => {
                setAvailableComponents(result.data.map(comp => comp.name));
            })
            .catch(error => {
                console.error('Помилка при отриманні комплектуючих:', error);
            });
    }, []);

    const handleComponentNameChange = (index, newName) => {
        const updatedComponents = [...editedComponents];
        updatedComponents[index].name = newName;
        setEditedComponents(updatedComponents);
    };

    const handleComponentQuantityChange = (index, newQuantity) => {
        const updatedComponents = [...editedComponents];
        updatedComponents[index].quantity = newQuantity;
        setEditedComponents(updatedComponents);
    };


    return (
        <div>
            {editedComponents.map((component, index) => (
                <div key={index}>
                    <input
                        type="text"
                        value={component.name}
                        onChange={(e) => handleComponentNameChange(index, e.target.value)}
                        list={`componentsList${index}`}
                    />
                    <datalist id={`componentsList${index}`}>
                        {availableComponents.map((comp, idx) => (
                            <option key={idx} value={comp} />
                        ))}
                    </datalist>
                    <input
                        type="text"
                        value={component.quantity}
                        onChange={(e) => handleComponentQuantityChange(index, e.target.value)}
                    />
                </div>
            ))}

        </div>
    );
};

export default EditComponents;

