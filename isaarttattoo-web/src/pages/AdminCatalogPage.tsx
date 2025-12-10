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
    const [filterCategory, setFilterCategory] = useState<number | "">("");
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
            const { imageFile, imageAlt, imageDisplayOrder, ...productData } = productForm;
            const normalizedCategoryId = productData.categoryId || undefined;
            if (productForm.imageFile) {
                await createProductWithImage({
                    name: productForm.name,
                    shortDescription: productForm.shortDescription,
                    price: productForm.price,
                    categoryId: normalizedCategoryId,
                    stock: productForm.stock,
                    isActive: productForm.isActive,
                    file: productForm.imageFile,
                    altText: imageAlt,
                    displayOrder: imageDisplayOrder,
                });
            } else {
                await createProduct({
                    ...productData,
                    categoryId: normalizedCategoryId,
                });
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
            const { categoryName, ...payload } = product;
            await updateProduct(product.id, payload);
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
                filterCategory === "" ? true : p.categoryId === filterCategory,
            ),
        [products, filterCategory],
    );

    return (
        <StoreLayout
            title="Administración de catálogo"
            description="Gestiona productos, categorías y stock desde un solo lugar."
        >
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    {([
                        { id: "categories", label: "Categorías" },
                        { id: "products", label: "Productos" },
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-4 py-2 text-sm ${
                                activeTab === tab.id
                                    ? "bg-white text-slate-900"
                                    : "border border-white/10 text-white hover:bg-white/10"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}
                {feedback && (
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {feedback}
                    </div>
                )}

                {activeTab === "categories" ? (
                    <div className="space-y-6">
                        <form
                            onSubmit={handleCreateCategory}
                            className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3"
                        >
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Nombre</span>
                                <input
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, name: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Descripción</span>
                                <input
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, description: e.target.value }))}
                                    placeholder="Breve descripción"
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Orden</span>
                                <input
                                    type="number"
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={categoryForm.displayOrder}
                                    onChange={(e) => setCategoryForm((c) => ({ ...c, displayOrder: Number(e.target.value) }))}
                                />
                            </label>
                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900"
                                >
                                    Crear categoría
                                </button>
                            </div>
                        </form>

                        <div className="overflow-auto rounded-2xl border border-white/10 bg-white/5">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-900/70">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Nombre</th>
                                        <th className="px-4 py-2 text-left">Descripción</th>
                                        <th className="px-4 py-2 text-left">Orden</th>
                                        <th className="px-4 py-2 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCategories.map((cat) => (
                                        <tr key={cat.id} className="border-t border-white/5">
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
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
                                                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
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
                                                    className="w-24 rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
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
                                                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                                                        onClick={() => handleUpdateCategory(cat)}
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
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
                            className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-6"
                        >
                            <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                                <span>Nombre</span>
                                <input
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                                <span>Descripción corta</span>
                                <input
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={productForm.shortDescription}
                                    onChange={(e) => setProductForm((p) => ({ ...p, shortDescription: e.target.value }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Precio</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm((p) => ({ ...p, price: Number(e.target.value) }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Stock</span>
                                <input
                                    type="number"
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                                />
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Categoría</span>
                                <select
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
                                    value={productForm.categoryId}
                                    onChange={(e) => setProductForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                                    required
                                >
                                    <option value={0}>Selecciona una categoría</option>
                                    {sortedCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={productForm.isActive}
                                    onChange={(e) => setProductForm((p) => ({ ...p, isActive: e.target.checked }))}
                                />
                                Activo
                            </label>
                            <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                                <span>Imagen (opcional)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
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
                                        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
                                        value={productForm.imageAlt}
                                        onChange={(e) => setProductForm((p) => ({ ...p, imageAlt: e.target.value }))}
                                    />
                                    <input
                                        type="number"
                                        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
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
                            </label>
                            <div className="md:col-span-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900"
                                >
                                    Crear producto
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm text-slate-200">
                                Filtrar por categoría:
                                <select
                                    className="ml-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                                    value={filterCategory}
                                    onChange={(e) =>
                                        setFilterCategory(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                >
                                    <option value="">Todas</option>
                                    {sortedCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="overflow-auto rounded-2xl border border-white/10 bg-white/5">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-900/70">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Nombre</th>
                                        <th className="px-4 py-2 text-left">Categoría</th>
                                        <th className="px-4 py-2 text-left">Precio</th>
                                        <th className="px-4 py-2 text-left">Stock</th>
                                        <th className="px-4 py-2 text-left">Activo</th>
                                        <th className="px-4 py-2 text-left">Imagen</th>
                                        <th className="px-4 py-2 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((prod) => (
                                        <tr key={prod.id} className="border-t border-white/5">
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
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
                                                    className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white"
                                                    value={prod.categoryId ?? 0}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) =>
                                                                p.id === prod.id
                                                                    ? {
                                                                          ...p,
                                                                          categoryId: Number(e.target.value) || null,
                                                                          categoryName:
                                                                              sortedCategories.find((c) => c.id === Number(e.target.value))?.name ??
                                                                              "",
                                                                      }
                                                                    : p,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value={0}>Sin categoría</option>
                                                    {sortedCategories.map((cat) => (
                                                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-24 rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
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
                                                    className="w-20 rounded-lg border border-white/10 bg-slate-950 px-2 py-1"
                                                    value={prod.stock}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) => (p.id === prod.id ? { ...p, stock: Number(e.target.value) } : p)),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={prod.isActive}
                                                    onChange={(e) =>
                                                        setProducts((prev) =>
                                                            prev.map((p) => (p.id === prod.id ? { ...p, isActive: e.target.checked } : p)),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="text-xs text-slate-200"
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
                                                        className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
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
                                                            className="w-20 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
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
                                                            className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-cyan-400"
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
                                                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                                                        onClick={() => handleUpdateProduct(prod)}
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
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
