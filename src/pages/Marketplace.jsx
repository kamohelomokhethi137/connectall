import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CardSkeletonGrid } from "../components/Skeleton";
import { fetchProducts } from "../lib/marketplace";
import { resolveMediaUrl } from "../lib/api";

export default function Marketplace() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Couldn't load the marketplace.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-navy pt-32 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-display font-semibold text-3xl text-white">
            Marketplace
          </h1>
          <p className="text-white/55 mt-2">
            Discover products and services from ConnectAll Technologies.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        {products === null && !error && <CardSkeletonGrid count={6} />}

        {error && (
          <div className="text-center py-16">
            <p className="text-ink-soft">{error}</p>
            <button
              onClick={load}
              className="mt-4 text-sm font-semibold text-teal-dark hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {products && products.length === 0 && (
          <p className="text-center text-ink-soft py-16">
            No products published yet.
          </p>
        )}

        {products && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/marketplace/${p.id}`}
                className="bg-white rounded-2xl border border-ink/5 overflow-hidden hover:shadow-lg hover:shadow-navy-dark/5 transition-shadow group"
              >
                <div className="h-44 overflow-hidden bg-paper">
                  <img
                    src={resolveMediaUrl(p.image_url)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-ink">{p.name}</h3>
                  <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-sm font-semibold text-teal-dark">
                      R{Number(p.price).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <FiHeart size={13} aria-hidden="true" />
                      {p.like_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
