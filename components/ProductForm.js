/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
    _id,
    title: existingTitle,
    description: existingDescriptoin,
    price: existingPrice,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties,
    productIndex: existingProductIndex,
    tag: existingTag,
    countInStock: existingCountInStock,
}) {
    const [title, setTitle] = useState(existingTitle || "");
    const [productIndex, setProductIndex] = useState(existingProductIndex || '');
    const [description, setDescription] = useState(existingDescriptoin || "");
    const [category, setCategory] = useState(assignedCategory || '');
    const [tag, setTag] = useState(existingTag || '');
    const [countInStock, setCountInStock] = useState(existingCountInStock || '');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const [price, setPrice] = useState(existingPrice || 0);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploding, setIsUploading] = useState(false);
    const [images, setImages] = useState(existingImages || []);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, [])

    async function saveProduct(e) {
        e.preventDefault();
        const data = {
            title,
            description,
            price,
            images,
            category,
            properties: productProperties,
            productIndex,
            tag,
            countInStock,
        };

        if (_id) {
            //update
            await axios.put("/api/products", { ...data, _id });
        } else {
            //create
            await axios.post("/api/products", data);
        }
        setGoToProducts(true);
    }
    if (goToProducts) {
        router.push("/products");
    }

    async function uploadImages(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append("file", file);
            }
            try {
                const res = await axios.post("/api/upload", data);
                setImages((oldImages) => {
                    return [...oldImages, ...res.data.links];
                });
            } catch (error) {
                console.error('Помилка завантаження файлів:', error);
            } finally {
                setIsUploading(false);
            }
        }
    }
    function updateImagesOrder(images) {
        setImages(images);
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({ _id }) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        while (catInfo?.parent?._id) {
            const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
        }
    }

    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = { ...prev };
            newProductProps[propName] = value;
            return newProductProps;
        });
    }

    function removeImage(imageUrl) {
        setImages((oldImages) => oldImages.filter((image) => image !== imageUrl));
    }
    return (
        <form onSubmit={saveProduct}>
            <label> Назва товара</label>
            <input
                type="text"
                placeholder="Назва товара"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <label> Код товара</label>
            <input
                type="text"
                placeholder="Код товара"
                value={productIndex}
                onChange={(e) => setProductIndex(e.target.value)}
            />

            <label>Тег</label>
            <select
                onChange={(e) => setTag(e.target.value)}
                value={tag}
            >
                <option value="">Без тегу</option>
                <option value="NEW">NEW</option>
                <option value="Top">Top</option>
                <option value="Video">Відео</option>
            </select>

            <label> Кількість товара</label>
            <input
                type="text"
                placeholder="Кількість товара"
                value={countInStock}
                onChange={(e) => setCountInStock(+e.target.value)}
            />

            <label>Категорія</label>
            <select
                onChange={e => setCategory(e.target.value)}
                value={category}>
                <option value="">
                    Без категорії
                </option>
                {categories.length > 0 && categories.map(c => (
                    <option
                        value={c._id}
                        key={c._id}>
                        {c.name}
                    </option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div key={p.value} className="flex gap-1">
                    <div>{p.name}</div>
                    <select
                        value={productProperties[p.name]}
                        onChange={e => setProductProp(p.name, e.target.value)}>
                        {
                            p.values.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))
                        }
                    </select>
                </div>
            ))
            }

            <label>Зображення</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable
                    list={images}
                    setList={updateImagesOrder}
                    className="flex flex-wrap gap-1"
                >
                    {!!images?.length && images.map(link => (
                        <div key={link} className="h-24 relative">
                            <img src={link} alt="" className="rounded-lg" />
                            <button
                                onClick={() => removeImage(link)}
                                className="absolute top-1 right-1  text-black rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>

                            </button>
                        </div>
                    ))}
                </ReactSortable>
                {isUploding && (
                    <div className="h-24 flex items-center">
                        <Spinner />
                    </div>
                )}
                <label className="w-24 h-24 text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 flex-col cursor-pointer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                        />
                    </svg>
                    <div>Завантажити</div>
                    <input type="file" name="file" onChange={uploadImages} className="hidden" multiple />
                </label>

            </div>

            <label>Опис товара</label>
            <textarea
                placeholder="Опис товара"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <label>Ціна в $</label>
            <input
                type="text"
                placeholder="Ціна"
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
            />

            <button
                type="submit"
                className="btn-promary rounded-sm bg-blue-900 text-white px-4 py-1  shadow-sm"
            >
                Зберегти
            </button>
        </form >
    );
}
