import React, { useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { buildGenericWhatsAppLink, INSTAGRAM_HANDLE } from "../lib/whatsapp";
import { Instagram, MessageCircle, Mail } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", product_name: "", size: "", message: "" });
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please share your name and phone number.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/enquiries", form);
      toast.success("Thanks — we'll get back to you very soon.");
      setForm({ name: "", phone: "", product_name: "", size: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">Get in touch</div>
          <h1 className="font-heading text-4xl md:text-5xl text-ink mb-6">We'd love to hear from you.</h1>
          <p className="text-sm text-smoke leading-relaxed">
            Questions about a piece, sizing, delivery or a bespoke order — reach out any way you like.
            We reply personally, usually within a few hours.
          </p>

          <div className="mt-10 space-y-5">
            <a href={buildGenericWhatsAppLink()} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-4 group" data-testid="contact-whatsapp">
              <span className="h-10 w-10 rounded-full bg-wa text-white flex items-center justify-center">
                <MessageCircle size={16} strokeWidth={1.6} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-smoke">WhatsApp</div>
                <div className="text-ink group-hover:text-rust transition-colors">+91 99999 99999</div>
              </div>
            </a>
            <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-4 group" data-testid="contact-instagram">
              <span className="h-10 w-10 rounded-full border border-hairlineStrong flex items-center justify-center">
                <Instagram size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-smoke">Instagram</div>
                <div className="text-ink group-hover:text-rust transition-colors">@{INSTAGRAM_HANDLE}</div>
              </div>
            </a>
            <div className="flex items-center gap-4">
              <span className="h-10 w-10 rounded-full border border-hairlineStrong flex items-center justify-center">
                <Mail size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-smoke">Email</div>
                <div className="text-ink">hello@styleaura.com</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} data-testid="contact-form" className="bg-linen border border-hairline p-6 md:p-10 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Name</label>
            <input
              data-testid="contact-name"
              value={form.name} onChange={update("name")}
              className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Phone</label>
            <input
              data-testid="contact-phone"
              value={form.phone} onChange={update("phone")}
              className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Product Name</label>
            <input
              data-testid="contact-product"
              value={form.product_name} onChange={update("product_name")}
              placeholder="Optional"
              className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Size</label>
            <input
              data-testid="contact-size"
              value={form.size} onChange={update("size")}
              placeholder="Optional"
              className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.22em] text-ink mb-2 block">Message</label>
            <textarea
              data-testid="contact-message"
              value={form.message} onChange={update("message")}
              rows={4}
              className="w-full bg-ivory border border-hairlineStrong px-4 py-3 text-sm outline-none focus:border-rust resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            data-testid="contact-submit"
            className="w-full bg-rust hover:bg-rustDark text-ivory text-xs uppercase tracking-[0.24em] px-6 py-4 transition-colors disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
