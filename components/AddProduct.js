/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import Spinner from "./Spinner";

const AddProduct = ({ fetchCompany, _id }) => {
    const [name, setName] = useState("");
    const [components, setComponents] = useState([{ _id: "", name: "", quantity: "" }]);
    const [agent, setAgent] = useState("");
    const [assemblyPrice, setAssemblyPrice] = useState("");
    const [images, setImages] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [availableComponents, setAvailableComponents] = useState([]);

    const router = useRouter();
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        axios.get('/api/components').then(result => {
            setAvailableComponents(result.data.map(comp => comp.name));
        });
    }, []);

    async function saveProduct(e) {
        e.preventDefault();
        const data = {
            name,
            components,
            agent,
            assemblyPrice,
            images,
        };

        if (name.trim() === "") {
            console.error();
            return;
        }

        try {
            if (_id) {
                await axios.put("/api/products", { ...data, _id });
            } else {
                await axios.post("/api/products", data);
            }

            clearForm();
            modalRef.current.close();
            fetchCompany();
        } catch (error) {
            console.error('Помилка при додаванні продукту:', error);
        }
    }

    async function uploadImage(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append("file", file);
            }
            try {
                const res = await axios.post("/api/upload", data);
                const reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onloadend = () => {
                    setImages(reader.result);
                };
            } catch (error) {
                console.error('Помилка завантаження файлів:', error);
            } finally {
                setIsUploading(false);
            }
        }
    }

    function addComponent() {
        setComponents(prevComponents => [...prevComponents, { _id: "", name: "", quantity: "" }]);
    }

    function removeComponent(index) {
        setComponents(prevComponents => prevComponents.filter((_, i) => i !== index));
    }

    function updateComponent(index, key, value) {
        setComponents(prevComponents => {
            const newComponents = [...prevComponents];
            newComponents[index][key] = value;
            return newComponents;
        });
    }

    function clearForm() {
        setName("");
        setComponents([{ _id: "", name: "", quantity: "" }]);
        setAgent("");
        setAssemblyPrice("");
        setImages("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.addEventListener('close', clearForm);
        }
        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener('close', clearForm);
            }
        };
    }, []);

    return (
        <div className="py-[8px]">
            <button
                className="btn bg-accent"
                onClick={() => {
                    clearForm();
                    modalRef.current.showModal();
                }}
            >
                Додати виріб
            </button>
            <dialog ref={modalRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6 bg-white shadow-xl rounded-md">
                    <h3 className="font-bold text-lg mb-4">Додати компанію</h3>
                    <form onSubmit={saveProduct}>
                        <label>Назва продукту</label>
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
                                    onChange={(e) => updateComponent(index, "quantity", +e.target.value)}
                                />

                                <div className="flex flex-row gap-4 py-4">
                                    <button className="btn-default" type="button" onClick={() => removeComponent(index)}>Видалити</button>
                                    <button className="btn-default" type="button" onClick={addComponent}>Додати компонент</button>
                                </div>
                            </div>
                        ))}

                        <label>Посередник</label>
                        <input
                            type="text"
                            value={agent}
                            onChange={(e) => setAgent(e.target.value)}
                        />

                        <label>Ціна зборки</label>
                        <input
                            type="text"
                            value={assemblyPrice}
                            onChange={(e) => setAssemblyPrice(+e.target.value)}
                        />

                        <label>Фото товару</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={uploadImage}
                            accept="image/*"
                        />

                        {isUploading && <Spinner />}

                        <button className="btn-default" type="submit">Зберегти</button>

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
}

export default AddProduct;