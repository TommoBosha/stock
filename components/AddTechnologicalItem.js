import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AddTechnologicalItem = ({ fetchItems }) => {
    const [name, setName] = useState('');
    const [components, setComponents] = useState([{ name: '', quantity: '' }]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const modalRef = useRef(null);

    useEffect(() => {
        async function fetchComponents() {
            const res = await axios.get('/api/components');
            setAvailableComponents(res.data.map(comp => comp.name));
        }
        fetchComponents();
    }, []);

    const saveItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/technological', { name, components });
            fetchItems();
            clearForm();
            modalRef.current.close();
        } catch (error) {
            console.error('Помилка при збереженні виробу:', error);
        }
    };

    const addComponent = () => {
        setComponents([...components, { name: '', quantity: '' }]);
    };

    const removeComponent = (index) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const updateComponent = (index, key, value) => {
        const newComponents = [...components];
        newComponents[index][key] = value;
        setComponents(newComponents);
    };

    const clearForm = () => {
        setName('');
        setComponents([{ name: '', quantity: '' }]);
    };

    return (
        <div>
            <button
                className="btn bg-accent"
                onClick={() => modalRef.current.showModal()}
            >
                Додати виріб
            </button>
            <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6 bg-white shadow-xl rounded-md">
                    <h3 className="font-bold text-lg mb-4">Додати виріб</h3>
                    <form onSubmit={saveItem}>
                        <label>Назва виробу</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <h2>Комплектуючі</h2>
                        {components.map((component, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    placeholder="Введіть назву компонента"
                                    value={component.name}
                                    onChange={(e) => updateComponent(index, "name", e.target.value)}
                                    list={`componentsList${index}`}
                                />
                                <datalist id={`componentsList${index}`}>
                                    {availableComponents.map((comp, idx) => (
                                        <option key={idx} value={comp} />
                                    ))}
                                </datalist>

                                <input
                                    type="text"
                                    placeholder="Кількість"
                                    value={component.quantity}
                                    onChange={(e) => updateComponent(index, "quantity", e.target.value)}
                                />

                                <div className="flex flex-row gap-4 py-4">
                                    <button
                                        className="btn-default"
                                        type="button"
                                        onClick={() => removeComponent(index)}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="btn-default" type="button" onClick={addComponent}>
                            Додати компонент
                        </button>

                        <button className="btn-default" type="submit">
                            Зберегти
                        </button>

                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => modalRef.current.close()}
                        >
                            ✕
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddTechnologicalItem;