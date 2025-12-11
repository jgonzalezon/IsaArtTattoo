import { useEffect, useMemo, useState } from "react";
import StoreLayout from "../components/StoreLayout";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getProducts,
    createProduct,
    createProductWithImage,
    updateProduct,
    deleteProduct,
    uploadProductImage,
} from "../api/adminCatalog";
import type { AdminCategory, AdminProduct } from "../api/adminCatalog";

export default function AdminCatalogPage() {
    const [activeTab, setActiveTab] = useState<"categories" | "products">("categories");
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const [categoryForm, setCategoryForm] = useState({ name: "", description: "", displayOrder: 0 });
    const [productForm, setProductForm] = useState({
        name: "",
        shortDescription: "",
        price: 0,
        stock: 0,
        isActive: true,
        categoryId: 0,
        imageFile: null as File | null,
        imageAlt: "",
        imageDisplayOrder: 0,
    });
    const [uploadState, setUploadState] = useState<
        Record<number, { file: File | null; altText: string; displayOrder: number }>
    >({});

    const loadData = async () => {
        try {
            const [cat, prod] = await Promise.all([getCategories(), getProducts()]);
            setCategories(cat);
            setProducts(prod);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el catálogo");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)),
        [categories],
    );

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.name) return;
        try {
            await createCategory(categoryForm);
            setCategoryForm({ name: "", description: "", displayOrder: 0 });
            setFeedback("Categoría creada");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo crear la categoría");
        }
    };

    const handleUpdateCategory = async (category: AdminCategory) => {
        try {
            await updateCategory(category.id, category);
            setFeedback("Categoría actualizada");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar la categoría");
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productForm.name || !productForm.categoryId) {
            setError("Completa los campos obligatorios");
            return;
        }
        try {
            if (productForm.imageFile) {
                await createProductWithImage({
                    name: productForm.name,
                    shortDescription: productForm.shortDescription,
                    price: productForm.price,
                    categoryId: productForm.categoryId,
                    stock: productForm.stock,
                    isActive: productForm.isActive,
                    file: productForm.imageFile,
                    altText: productForm.imageAlt,
                    displayOrder: productForm.imageDisplayOrder,
                });
            } else {
                await createProduct(productForm);
            }
            setProductForm({
                name: "",
                shortDescription: "",
                price: 0,
                stock: 0,
                isActive: true,
                categoryId: 0,
                imageFile: null,
                imageAlt: "",
                imageDisplayOrder: 0,
            });
            setFeedback("Producto creado");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo crear el producto");
        }
    };

    const handleUpdateProduct = async (product: AdminProduct) => {
        try {
            await updateProduct(product.id, product);
            setFeedback("Producto actualizado");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar el producto");
        }
    };

    const handleUploadImage = async (productId: number) => {
        const current = uploadState[productId];
        if (!current?.file) {
            setError("Selecciona una imagen para subir");
            return;
        }
        try {
            await uploadProductImage(productId, {
                file: current.file,
                altText: current.altText,
                displayOrder: current.displayOrder,
            });
            setFeedback("Imagen subida correctamente");
            setUploadState((prev) => ({
                ...prev,
                [productId]: { file: null, altText: "", displayOrder: 0 },
            }));
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo subir la imagen");
        }
    };

    const filteredProducts = useMemo(
        () =>
            products.filter((p) =>
                filterCategory ? p.categoryName === filterCategory : true,
            ),
        [products, filterCategory],
    );

    return (
        <StoreLayout
            title="Administración de catálogo"
            description="Gestiona productos, categorías y stock desde un solo lugar."
            tone="light"
        >
            <div className="space-y-4 text-neutral-900">
                <div className="flex flex-wrap items-center gap-2">
                    {([
                        { id: "categories", label: "Categorías" },
                        { id: "products", label: "Productos" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                activeTab === tab.id
                                    ? "border border-blue-200 bg-blue-50 text-blue-800 shadow-sm"
                                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}
                {feedback && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {feedback}
                    </div>
                )}

                {activeTab === "categories" ? (
                    <div className="space-y-6">
                        <form
                            onSubmit={handleCreateCategory}
                            className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-3"
                        >
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Nombre</span>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, name: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Descripción</span>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, description: e.target.value }))}
                                    placeholder="Breve descripción"
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Orden</span>
                                <input
                                    type="number"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={categoryForm.displayOrder}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, displayOrder: Number(e.target.value) }))}
                                />
                            </label>
                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
                                >
                                    Crear categoría
                                </button>
                            </div>
                        </form>

                        <div className="overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
                            <table className="min-w-full text-sm text-neutral-800">
                                <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
                                    <tr>
                                        <th className="px-4 py-2">Nombre</th>
                                        <th className="px-4 py-2">Descripción</th>
                                        <th className="px-4 py-2">Orden</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCategories.map((cat) => (
                                        <tr key={cat.id} className="border-t border-neutral-100">
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={cat.name}
                                                    onChange={(e) =>
                                                        setCategories((prev) =>
                                                            prev.map((c) =>
                                                                c.id === cat.id ? { ...c, name: e.target.value } : c,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={cat.description ?? ""}
                                                    onChange={(e) =>
                                                        setCategories((prev) =>
                                                            prev.map((c) =>
                                                                c.id === cat.id ? { ...c, description: e.target.value } : c,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={cat.displayOrder}
                                                    onChange={(e) =>
                                                        setCategories((prev) =>
                                                            prev.map((c) =>
                                                                c.id === cat.id ? { ...c, displayOrder: Number(e.target.value) } : c,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
                                                        onClick={() => handleUpdateCategory(cat)}
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
                                                        onClick={() => deleteCategory(cat.id).then(loadData).catch(() => setError("No se pudo eliminar"))}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <form
                            onSubmit={handleCreateProduct}
                            className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-6"
                        >
                            <label className="grid gap-2 text-sm text-neutral-800 md:col-span-2">
                                <span>Nombre</span>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800 md:col-span-2">
                                <span>Descripción corta</span>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={productForm.shortDescription}
                                    onChange={(e) => setProductForm((p) => ({ ...p, shortDescription: e.target.value }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Precio</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm((p) => ({ ...p, price: Number(e.target.value) }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Stock</span>
                                <input
                                    type="number"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Categoría</span>
                                <select
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                    value={productForm.categoryId}
                                    onChange={(e) => setProductForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                                    required
                                >
                                    <option value={0}>Selecciona una categoría</option>
                                    {sortedCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-white text-neutral-900">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800">
                                <span>Activo</span>
                                <select
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                    value={productForm.isActive ? "yes" : "no"}
                                    onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.value === "yes" }))}
                                >
                                    <option value="yes" className="bg-white text-neutral-900">
                                        Sí
                                    </option>
                                    <option value="no" className="bg-white text-neutral-900">
                                        No
                                    </option>
                                </select>
                            </label>
                            <label className="grid gap-2 text-sm text-neutral-800 md:col-span-2">
                                <span>Imagen</span>
                                <div className="grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                        onChange={(e) =>
                                            setProductForm((p) => ({
                                                ...p,
                                                imageFile: e.target.files?.[0] ?? null,
                                            }))
                                        }
                                    />
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <input
                                            type="text"
                                            placeholder="Texto alternativo"
                                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                            value={productForm.imageAlt}
                                            onChange={(e) => setProductForm((p) => ({ ...p, imageAlt: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                            value={productForm.imageDisplayOrder}
                                            onChange={(e) =>
                                                setProductForm((p) => ({
                                                    ...p,
                                                    imageDisplayOrder: Number(e.target.value),
                                                }))
                                            }
                                            placeholder="Orden"
                                        />
                                    </div>
                                </div>
                            </label>
                            <div className="md:col-span-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
                                >
                                    Crear producto
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm text-neutral-800">
                                Filtrar por categoría:
                                <select
                                    className="ml-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">Todas</option>
                                    {sortedCategories.map((cat) => (
                                        <option key={cat.id} value={cat.name ?? ""} className="bg-white text-neutral-900">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
                            <table className="min-w-full text-sm text-neutral-800">
                                <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
                                    <tr>
                                        <th className="px-4 py-2">Nombre</th>
                                        <th className="px-4 py-2">Categoría</th>
                                        <th className="px-4 py-2">Precio</th>
                                        <th className="px-4 py-2">Stock</th>
                                        <th className="px-4 py-2">Activo</th>
                                        <th className="px-4 py-2">Imagen</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((prod) => (
                                        <tr key={prod.id} className="border-t border-neutral-100">
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={prod.name}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) => (p.id === prod.id ? { ...p, name: e.target.value } : p)),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                                    value={sortedCategories.find((c) => c.name === prod.categoryName)?.id ?? 0}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) =>
                                                                p.id === prod.id
                                                                    ? {
                                                                          ...p,
                                                                          categoryName:
                                                                              sortedCategories.find((c) => c.id === Number(e.target.value))?.name ??
                                                                              "",
                                                                      }
                                                                    : p,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value={0} className="bg-white text-neutral-900">
                                                        Sin categoría
                                                    </option>
                                                    {sortedCategories.map((cat) => (
                                                        <option key={cat.id} value={cat.id} className="bg-white text-neutral-900">
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={prod.price}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) => (p.id === prod.id ? { ...p, price: Number(e.target.value) } : p)),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-20 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={prod.stock}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) => (p.id === prod.id ? { ...p, stock: Number(e.target.value) } : p)),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                                    value={prod.isActive ? "yes" : "no"}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) =>
                                                                p.id === prod.id
                                                                    ? {
                                                                          ...p,
                                                                          isActive: e.target.value === "yes",
                                                                      }
                                                                    : p,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value="yes" className="bg-white text-neutral-900">
                                                        Sí
                                                    </option>
                                                    <option value="no" className="bg-white text-neutral-900">
                                                        No
                                                    </option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                                        onChange={(e) =>
                                                            setUploadState((prev) => ({
                                                                ...prev,
                                                                [prod.id]: {
                                                                    file: e.target.files?.[0] ?? null,
                                                                    altText: prev[prod.id]?.altText ?? "",
                                                                    displayOrder: prev[prod.id]?.displayOrder ?? 0,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Alt"
                                                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                                        value={uploadState[prod.id]?.altText ?? ""}
                                                        onChange={(e) =>
                                                            setUploadState((prev) => ({
                                                                ...prev,
                                                                [prod.id]: {
                                                                    file: prev[prod.id]?.file ?? null,
                                                                    altText: e.target.value,
                                                                    displayOrder: prev[prod.id]?.displayOrder ?? 0,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none"
                                                            value={uploadState[prod.id]?.displayOrder ?? 0}
                                                            onChange={(e) =>
                                                                setUploadState((prev) => ({
                                                                    ...prev,
                                                                    [prod.id]: {
                                                                        file: prev[prod.id]?.file ?? null,
                                                                        altText: prev[prod.id]?.altText ?? "",
                                                                        displayOrder: Number(e.target.value),
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                        <button
                                                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
                                                            onClick={() => handleUploadImage(prod.id)}
                                                        >
                                                            Subir
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
                                                        onClick={() => handleUpdateProduct(prod)}
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
                                                        onClick={() => deleteProduct(prod.id).then(loadData).catch(() => setError("No se pudo eliminar el producto"))}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
