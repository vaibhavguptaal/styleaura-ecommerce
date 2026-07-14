import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { CATEGORIES, SIZE_OPTIONS } from "../data/categories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";

const EMPTY = {
  name: "", category: "Kurtis", price: 0, discount_price: "", description: "",
  fabric: "", sizes: [], colors: [], stock_status: "in_stock",
  is_best_seller: false, is_new_arrival: false,
  delivery_note: "Ships within 3-5 business days across India.",
  care_instructions: "Hand wash cold. Do not bleach. Dry in shade.",
};

function ProductForm({ initial, onSubmit, onClose }) {
  const [f, setF] = useState({ ...EMPTY, ...(initial || {}), discount_price: initial?.discount_price ?? "" });
  const [colorsText, setColorsText] = useState((initial?.colors || []).join(", "));
  const [imagesText, setImagesText] = useState((initial?.image_urls || []).join("\n"));
  const [busy, setBusy] = useState(false);

  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleSize = (s) => {
    setF((state) => {
      const has = state.sizes.includes(s);
      return { ...state, sizes: has ? state.sizes.filter(x => x !== s) : [...state.sizes, s] };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...f,
        price: Number(f.price) || 0,
        discount_price: f.discount_price === "" || f.discount_price == null ? null : Number(f.discount_price),
        stock_quantity: Number(f.stock_quantity) || 0,
        thumbnail_url: (f.thumbnail_url || "").trim() || null,
        image_urls: imagesText.split(/[\n,]/).map(u => u.trim()).filter(Boolean),
        colors: colorsText.split(",").map(c => c.trim()).filter(Boolean),
        sku: (f.sku || "").trim() || null,
      };
      await onSubmit(payload);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Name</label>
        <input data-testid="admin-form-name" value={f.name} onChange={(e) => upd("name", e.target.value)} required
               className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Category</label>
          <Select value={f.category} onValueChange={(v) => upd("category", v)}>
            <SelectTrigger data-testid="admin-form-category" className="w-full text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Stock</label>
          <Select value={f.stock_status} onValueChange={(v) => upd("stock_status", v)}>
            <SelectTrigger data-testid="admin-form-stock" className="w-full text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Price (₹)</label>
          <input data-testid="admin-form-price" type="number" value={f.price} onChange={(e) => upd("price", e.target.value)}
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Discount Price</label>
          <input data-testid="admin-form-discount" type="number" value={f.discount_price} onChange={(e) => upd("discount_price", e.target.value)}
                 placeholder="Optional"
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Description</label>
        <textarea data-testid="admin-form-description" value={f.description} onChange={(e) => upd("description", e.target.value)} rows={3}
                  className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Fabric</label>
          <input data-testid="admin-form-fabric" value={f.fabric} onChange={(e) => upd("fabric", e.target.value)}
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">SKU</label>
          <input data-testid="admin-form-sku" value={f.sku || ""} onChange={(e) => upd("sku", e.target.value)}
                 placeholder="SA-KUR-001"
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Stock Quantity</label>
        <input data-testid="admin-form-stock-qty" type="number" min="0"
               value={f.stock_quantity} onChange={(e) => upd("stock_quantity", e.target.value)}
               className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Thumbnail Image URL</label>
        <input data-testid="admin-form-thumbnail" value={f.thumbnail_url || ""}
               onChange={(e) => upd("thumbnail_url", e.target.value)}
               placeholder="https://..."
               className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Additional Image URLs (one per line)</label>
        <textarea data-testid="admin-form-images" value={imagesText} onChange={(e) => setImagesText(e.target.value)}
                  rows={3}
                  placeholder="https://... (one per line)"
                  className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust resize-none" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Sizes</label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button type="button" key={s}
              data-testid={`admin-form-size-${s.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => toggleSize(s)}
              className={`h-8 min-w-[36px] px-2 text-xs border ${f.sizes.includes(s) ? "bg-rust text-ivory border-rust" : "border-hairlineStrong"}`}
            >{s}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Colors (comma separated)</label>
        <input data-testid="admin-form-colors" value={colorsText} onChange={(e) => setColorsText(e.target.value)}
               placeholder="Blush, Ivory, Sage"
               className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Delivery Note</label>
          <input value={f.delivery_note} onChange={(e) => upd("delivery_note", e.target.value)}
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.18em] mb-1 block">Care</label>
          <input value={f.care_instructions} onChange={(e) => upd("care_instructions", e.target.value)}
                 className="w-full border border-hairlineStrong px-3 py-2 text-sm outline-none focus:border-rust" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <span className="text-xs uppercase tracking-[0.18em]">New Arrival</span>
        <Switch data-testid="admin-form-new-arrival" checked={f.is_new_arrival} onCheckedChange={(v) => upd("is_new_arrival", v)} />
      </div>
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <span className="text-xs uppercase tracking-[0.18em]">Best Seller</span>
        <Switch data-testid="admin-form-best-seller" checked={f.is_best_seller} onCheckedChange={(v) => upd("is_best_seller", v)} />
      </div>
      <div className="flex gap-3 pt-4 border-t border-hairline">
        <button type="button" onClick={onClose} className="flex-1 py-3 border border-hairlineStrong text-xs uppercase tracking-[0.2em]">Cancel</button>
        <button type="submit" disabled={busy} data-testid="admin-form-save"
                className="flex-1 py-3 bg-rust hover:bg-rustDark text-ivory text-xs uppercase tracking-[0.2em] disabled:opacity-60">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("products");
  const [enquiries, setEnquiries] = useState([]);

  const load = () => api.get("/products?sort=new&page_size=60").then((r) => setProducts(r.data.items || []));
  const loadEnquiries = () => api.get("/enquiries?page_size=100").then((r) => setEnquiries(r.data.items || [])).catch(() => {});
  const updateEnquiryStatus = async (id, status) => {
    try { await api.patch(`/enquiries/${id}`, { status }); toast.success("Enquiry updated"); loadEnquiries(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  useEffect(() => {
    if (user && user.role === "admin") { load(); loadEnquiries(); }
  }, [user]);

  if (loading) return <div className="py-24 text-center text-smoke">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  const create = async (payload) => {
    try {
      await api.post("/products", payload);
      toast.success("Product added");
      setOpenNew(false);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };
  const update = async (payload) => {
    try {
      await api.put(`/products/${editing.id}`, payload);
      toast.success("Product updated");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Admin</div>
          <h1 className="font-heading text-4xl text-ink">Product Studio</h1>
          <p className="text-sm text-smoke mt-1">Signed in as {user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="border border-hairlineStrong px-4 py-2 text-xs uppercase tracking-[0.2em]">Visit site</Link>
          <button data-testid="admin-logout" onClick={logout}
                  className="inline-flex items-center gap-2 border border-hairlineStrong px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-rust hover:text-rust">
            <LogOut size={14} strokeWidth={1.5} /> Logout
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-hairline mb-6">
        {["products", "enquiries"].map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}
                  className={`px-5 py-3 text-xs uppercase tracking-[0.22em] border-b-2 -mb-px transition-colors ${
                    tab === t ? "text-rust border-rust" : "text-smoke border-transparent hover:text-ink"
                  }`}>
            {t === "products" ? `Products (${products.length})` : `Enquiries (${enquiries.length})`}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <>
          <div className="flex justify-end mb-4">
            <Dialog open={openNew} onOpenChange={setOpenNew}>
              <DialogTrigger asChild>
                <button data-testid="admin-new-product" className="inline-flex items-center gap-2 bg-rust hover:bg-rustDark text-ivory px-5 py-3 text-xs uppercase tracking-[0.22em]">
                  <Plus size={14} strokeWidth={1.6} /> New Product
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-ivory">
                <DialogHeader><DialogTitle className="font-heading text-2xl">Add Product</DialogTitle></DialogHeader>
                <ProductForm onSubmit={create} onClose={() => setOpenNew(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-hairline overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-linen text-xs uppercase tracking-[0.18em] text-smoke">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Flags</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-smoke">No products yet.</td></tr>
                )}
                {products.map((p) => (
                  <tr key={p.id} data-testid={`admin-row-${p.id}`} className="border-t border-hairline">
                    <td className="px-4 py-3 text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-smoke">{p.category}</td>
                    <td className="px-4 py-3 text-smoke">
                      ₹{p.discount_price ?? p.price}
                      {p.discount_price && <span className="ml-2 line-through text-xs">₹{p.price}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-smoke">
                      {p.is_new_arrival && <span className="mr-2 text-ink">NEW</span>}
                      {p.is_best_seller && <span className="text-rust">BEST</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button data-testid={`admin-edit-${p.id}`} onClick={() => setEditing(p)}
                                className="p-2 border border-hairlineStrong hover:border-rust hover:text-rust">
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button data-testid={`admin-delete-${p.id}`} onClick={() => remove(p)}
                                className="p-2 border border-hairlineStrong hover:border-red-500 hover:text-red-500">
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
            <DialogContent className="max-w-2xl bg-ivory">
              <DialogHeader><DialogTitle className="font-heading text-2xl">Edit Product</DialogTitle></DialogHeader>
              {editing && <ProductForm initial={editing} onSubmit={update} onClose={() => setEditing(null)} />}
            </DialogContent>
          </Dialog>
        </>
      )}

      {tab === "enquiries" && (
        <div className="border border-hairline overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-linen text-xs uppercase tracking-[0.18em] text-smoke">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Size</th>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-smoke">No enquiries yet.</td></tr>
              )}
              {enquiries.map((q) => (
                <tr key={q.id} className="border-t border-hairline align-top">
                  <td className="px-4 py-3 text-ink">{q.name}</td>
                  <td className="px-4 py-3 text-smoke">{q.phone}</td>
                  <td className="px-4 py-3 text-smoke">{q.product_name || "—"}</td>
                  <td className="px-4 py-3 text-smoke">{q.size || "—"}</td>
                  <td className="px-4 py-3 text-smoke max-w-sm">{q.message || "—"}</td>
                  <td className="px-4 py-3">
                    <select data-testid={`enquiry-status-${q.id}`} value={q.status || "new"}
                            onChange={(e) => updateEnquiryStatus(q.id, e.target.value)}
                            className="border border-hairlineStrong bg-ivory px-2 py-1 text-xs">
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-smoke">{q.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
