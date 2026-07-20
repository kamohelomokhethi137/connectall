import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchAdminProducts, addProduct, toggleProduct, deleteProduct } from "../lib/admin";
import { resolveMediaUrl } from "../lib/api";

export default function AdminMarketplace() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdminProducts();
      setProducts(data.products);
    } catch (err) {
      setError(err.message || "Couldn't load products.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error("Product name is required.");
        return;
      }
      setAdding(true);
      try {
        const form = new FormData();
        form.append("name", name);
        form.append("description", description);
        form.append("price", price || "0");
        if (image) form.append("image", image);
        const res = await addProduct(form);
        setProducts((prev) => [res.product, ...prev]);
        setName(""); setDescription(""); setPrice(""); setImage(null);
        if (fileRef.current) fileRef.current.value = "";
        toast.success("Product published.");
      } catch (err) {
        toast.error(err.message || "Couldn't add that product.");
      } finally {
        setAdding(false);
      }
    },
    [name, description, price, image]
  );

  const handleToggle = useCallback(async (id) => {
    try {
      const res = await toggleProduct(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.product : p)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that product.");
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that product.");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Manage Marketplace">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Marketplace">
      <div className="bg-white rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiPlus className="text-teal-dark" /> Add product
        </h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Price (R)"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
                 className="h-11 text-sm text-ink-soft file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-paper file:text-ink file:text-xs" />
          <SubmitButton loading={adding}>Publish</SubmitButton>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"
                    className="sm:col-span-2 lg:col-span-4 rounded-lg border border-ink/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" rows={2} />
        </form>
      </div>

      {!products ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-white border border-ink/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-ink/5 overflow-hidden flex flex-col">
              <img src={resolveMediaUrl(`/static/uploads/products/${p.image}`)} alt={p.name} className="w-full h-32 object-cover" />
              <div className="p-4 flex flex-col flex-1">
                <p className="font-medium text-ink text-sm">{p.name}</p>
                <p className="text-xs text-ink-soft mt-1 line-clamp-2 flex-1">{p.description}</p>
                <p className="font-display font-semibold text-ink mt-2">R{p.price.toFixed(2)}</p>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => handleToggle(p.id)}
                          className={`px-2 py-1 rounded text-xs ${p.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
                    {p.is_active ? "Live" : "Hidden"}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600" aria-label="Delete">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
