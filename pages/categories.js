import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState("");
    const [parentCategory, setParentCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchCategorie();
    }, []);

    function fetchCategorie() {
        axios.get("/api/categories/").then((result) => {
            setCategories(result.data);
        });
    }

    async function saveCategory(e) {
        e.preventDefault();
        const data = {
            name,
            parentCategory,
            properties: properties.map(p => ({
                name: p.name,
                values: p.values.split(','),
            })),
        };
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put("/api/categories", data);
            setEditedCategory(null);
        } else {
            await axios.post("/api/categories", data);

        }
        setName("");
        setParentCategory('');
        setProperties([]);
        fetchCategorie();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(category.properties.map(({ name, values }) => ({
            name,
            values: values.join(',')
        })));
    }

    function deleteCategory(category) {
        swal
            .fire({
                title: "Ви впевнені",
                text: `Ви хочете видалити ${category.name}?`,
                showCancelButton: true,
                cancelButtonText: "Скасувати",
                confirmButtonText: "Так, видалити!",
                confirmButtonColor: "#d55",
                reverseButtons: true,
            })
            .then(async (result) => {
                if (result.isConfirmed) {
                    const { _id } = category;
                    await axios.delete("/api/categories?_id=" + _id);
                    fetchCategorie();
                }
            });
    }

    function addProperty() {
        setProperties((prev) => {
            return [...prev, { name: "", value: "" }];
        });
    }

    function handlePropertyNameChange(index, property, newName) {
        setProperties((prev) => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        });
    }

    function handlePropertyValuesChange(index, property, newValues) {
        setProperties((prev) => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties((prev) => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    }
    return (
        <Layout>
            <h1>Категорії</h1>
            <label>
                {editedCategory
                    ? `Редагування категоріі ${editedCategory.name}`
                    : "Нова категорія"}
            </label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder={"Ім'я категорії"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <select
                        onChange={(e) => setParentCategory(e.target.value)}
                        value={parentCategory}
                    >
                        <option key={0} value="">
                            Без батьківської категорії
                        </option>
                        {categories.length > 0 &&
                            categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block">Властивості</label>
                    <button
                        type="button"
                        onClick={addProperty}
                        className="btn-default text-sm mb-2"
                    >
                        Додати нову властивість
                    </button>
                    {properties.length > 0 &&
                        properties.map((property, index) => (
                            <div key={index} className="flex gap-1 mb-2">
                                <input
                                    type="text"
                                    className="mb-0"
                                    value={property.name}
                                    onChange={(e) =>
                                        handlePropertyNameChange(index, property, e.target.value)
                                    }
                                    placeholder="Властивість (наприклад: колір)"
                                />
                                <input
                                    type="text"
                                    className="mb-0"
                                    value={property.values}
                                    onChange={(e) =>
                                        handlePropertyValuesChange(index, property, e.target.value)
                                    }
                                    placeholder="значення, розділені комами"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeProperty(index)}
                                    className="btn-default"
                                >
                                    Видалити
                                </button>
                            </div>
                        ))}
                </div>
                <div className="flex gap-1">
                    {editedCategory && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditedCategory(null);
                                setName('');
                                setParentCategory('');
                                setProperties([]);
                            }}
                            className="btn-default"
                        >
                            Відмінити
                        </button>
                    )}

                    <button type="submit" className="btn-primary py-1">
                        Зберегти
                    </button>
                </div>
            </form>

            {!editedCategory && (
                <table className="basic mt-4">
                    <thead>
                        <tr>
                            <td>Категорії</td>
                            <td>Батьківська категорія</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 &&
                            categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category?.parent?.name}</td>
                                    <td>
                                        <button
                                            className="btn-primary mr-1"
                                            onClick={() => editCategory(category)}
                                        >
                                            Змінити
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category)}
                                            className="btn-primary"
                                        >
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
