import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Spinner from "./Spinner";

const AddProduct = ({ fetchProducts }) => {
    const [technologies, setTechnologies] = useState([]);
    const [selectedTechnology, setSelectedTechnology] = useState("");
    const [assemblyPrice, setAssemblyPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [manufacturingTime, setManufacturingTime] = useState("");
    const [image, setImage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
  
        axios
            .get("/api/technological") 
            .then((response) => {
                setTechnologies(response.data);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке технологических карт:", error);
            });
    }, []);

    const handleSave = async () => {
        if (!selectedTechnology || !assemblyPrice || !salePrice) {
            alert("Пожалуйста, заполните обязательные поля!");
            return;
        }
    
        const productData = {
            technology: selectedTechnology,
            assemblyPrice: parseFloat(assemblyPrice),
            salePrice: parseFloat(salePrice),
            manufacturingTime,
            images: image,
        };
    
        console.log("Отправляемые данные:", productData);
    
        setIsSubmitting(true);
    
        try {
            
            const response = await axios.post("/api/products", productData);
    
           
            console.log("Ответ сервера:", response.data);
            await fetchProducts();
            resetForm();
            modalRef.current.close();
           
        } catch (error) {
         
            if (error.response) {
                console.error("Серверная ошибка:", error.response.data);
                alert(`Ошибка: ${error.response.data.error || "Неизвестная ошибка сервера"}`);
            } else if (error.request) {
               
                console.error("Нет ответа от сервера:", error.request);
                alert("Ошибка сети: нет ответа от сервера.");
            } else {
                
                console.error("Ошибка при настройке запроса:", error.message);
                alert(`Ошибка: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e) => {
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
                    setImage(reader.result);
                };
            } catch (error) {
                console.error('Помилка завантаження файлів:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const resetForm = () => {
        setSelectedTechnology("");
        setAssemblyPrice("");
        setSalePrice("");
        setManufacturingTime("");
        setImage("");
    };

    return (
        <div>
            <button
                className="btn btn-accent"
                onClick={() => modalRef.current.showModal()}
            >
                Додати виріб
            </button>

            <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg">Додати виріб</h3>

                    
                    <label>Технологічна карта:</label>
                    <select
                        className="select select-bordered w-full"
                        value={selectedTechnology}
                        onChange={(e) => setSelectedTechnology(e.target.value)}
                        required
                    >
                        <option value="">Виберіть технологічну карту</option>
                        {technologies.map((tech) => (
                            <option key={tech._id} value={tech._id}>
                                {tech.name}
                            </option>
                        ))}
                    </select>

                   
                    <label>Ціна зборки:</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={assemblyPrice}
                        onChange={(e) => setAssemblyPrice(e.target.value)}
                        required
                    />

                   
                    <label>Ціна реалізації:</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        required
                    />

                    
                    <label>Термін виготовлення:</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={manufacturingTime}
                        onChange={(e) => setManufacturingTime(e.target.value)}
                    />

                    
                    <label>Фото:</label>
                    <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={handleImageUpload}
                    />

{isUploading && <Spinner />}

                   
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Збереження..." : "Зберегти"}
                        </button>
                        <button
                            className="btn"
                            type="button"
                            onClick={() => modalRef.current.close()}
                        >
                            Відміна
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default AddProduct;

