import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, Heart, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useWishlist } from "../context/WishlistContext";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/new-arrivals", label: "New" },
  { to: "/best-sellers", label: "Best Sellers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { ids } = useWishlist();

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <header
      data-testid="site-navbar"
      className="fixed top-0 w-full z-50 bg-ivory/90 backdrop-blur-md border-b border-hairline"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="mobile-menu-trigger"
                className="h-9 w-9 flex items-center justify-center text-ink"
                aria-label="Open menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-ivory border-r border-hairline w-72">
              <div className="flex flex-col gap-4 pt-6">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-logo"
                  className="font-heading text-2xl text-rust"
                >
                  StyleAura
                </Link>
                <form onSubmit={submitSearch} className="mt-2 flex items-center border border-hairlineStrong px-3">
                  <Search size={14} className="text-smoke" strokeWidth={1.5} />
                  <input
                    data-testid="mobile-search-input"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search styles"
                    className="w-full bg-transparent text-sm py-2 px-2 outline-none placeholder:text-smoke"
                  />
                </form>
                <nav className="flex flex-col mt-2">
                  {NAV_ITEMS.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={({ isActive }) =>
                        `py-3 text-sm uppercase tracking-[0.18em] border-b border-hairline ${
                          isActive ? "text-rust" : "text-ink"
                        }`
                      }
                    >
                      {n.label}
                    </NavLink>
                  ))}
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="py-3 text-sm uppercase tracking-[0.18em] border-b border-hairline text-ink"
                  >
                    Wishlist {ids.length > 0 && <span className="text-rust">({ids.length})</span>}
                  </Link>
                  <Link
                    to="/admin/login"
                    onClick={() => setOpen(false)}
                    data-testid="mobile-nav-admin"
                    className="py-3 text-sm uppercase tracking-[0.18em] text-smoke"
                  >
                    Admin
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link
          to="/"
          data-testid="nav-logo"
          className="font-heading text-2xl lg:text-3xl font-medium tracking-tight text-rust"
        >
          StyleAura
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_ITEMS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `text-xs uppercase tracking-[0.22em] transition-colors ${
                  isActive ? "text-rust" : "text-ink hover:text-rust"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden lg:flex items-center border border-hairline focus-within:border-rust px-3 transition-colors">
            <Search size={14} className="text-smoke" strokeWidth={1.5} />
            <input
              data-testid="nav-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-32 bg-transparent text-xs py-2 px-2 outline-none placeholder:text-smoke"
            />
          </form>
          <Link
            to="/wishlist"
            data-testid="nav-wishlist"
            aria-label="Wishlist"
            className="relative h-9 w-9 flex items-center justify-center text-ink hover:text-rust transition-colors"
          >
            <Heart size={18} strokeWidth={1.5} />
            {ids.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] leading-4 bg-rust text-ivory text-center rounded-full">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/admin/login"
            data-testid="nav-admin"
            aria-label="Admin"
            className="hidden md:flex h-9 w-9 items-center justify-center text-ink hover:text-rust transition-colors"
          >
            <User size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
