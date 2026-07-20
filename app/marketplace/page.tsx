"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products, categories } from "@/lib/db";
import { Product, FilterState, SortOption } from "@/lib/types";
import { Search, Filter, Grid, List } from "lucide-react";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [filters, setFilters] = React.useState<FilterState>({
    categories: initialCategory ? [initialCategory] : [],
    priceMin: 0,
    priceMax: 300,
    minRating: 0,
    licenses: [],
    search: initialSearch,
    sort: "relevance",
  });

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter and sort products
  let filteredProducts: Product[] = [...products].filter(p => p.status === "approved");

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.seller?.username.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    const catIds = filters.categories.map(slug => {
      const cat = categories.find(c => c.slug === slug);
      return cat?.id;
    }).filter(Boolean);
    filteredProducts = filteredProducts.filter(p => catIds.includes(p.category_id));
  }

  // Price
  filteredProducts = filteredProducts.filter(p => 
    p.price >= filters.priceMin && p.price <= filters.priceMax
  );

  // Rating
  if (filters.minRating > 0) {
    filteredProducts = filteredProducts.filter(p => p.rating_avg >= filters.minRating);
  }

  // License filter
  if (filters.licenses.length > 0) {
    filteredProducts = filteredProducts.filter(p => filters.licenses.includes(p.license));
  }

  // Sort
  switch (filters.sort) {
    case "newest":
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "bestselling":
      filteredProducts.sort((a, b) => b.sales_count - a.sales_count);
      break;
    case "highest-rated":
      filteredProducts.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    default:
      break;
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (slug: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter(c => c !== slug)
        : [...prev.categories, slug]
    }));
  };

  const toggleLicense = (lic: string) => {
    setFilters(prev => ({
      ...prev,
      licenses: prev.licenses.includes(lic)
        ? prev.licenses.filter(l => l !== lic)
        : [...prev.licenses, lic]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceMin: 0,
      priceMax: 300,
      minRating: 0,
      licenses: [],
      search: "",
      sort: "relevance",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl tracking-tighter font-semibold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover {filteredProducts.length} premium digital assets</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none border-r"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-20 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Search</div>
                {(filters.search || filters.categories.length > 0) && (
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="text-sm font-semibold mb-3">Categories</div>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      filters.categories.includes(cat.slug) 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {products.filter(p => p.category_id === cat.id && p.status === "approved").length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="text-sm font-semibold mb-3">Price</div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter("priceMin", parseInt(e.target.value) || 0)}
                    className="text-sm"
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter("priceMax", parseInt(e.target.value) || 300)}
                    className="text-sm"
                    placeholder="Max"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter("priceMax", parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="text-sm font-semibold mb-3">Minimum rating</div>
              <div className="flex gap-1.5">
                {[4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateFilter("minRating", filters.minRating === r ? 0 : r)}
                    className={`filter-chip ${filters.minRating === r ? "active" : ""}`}
                  >
                    {r}+
                  </button>
                ))}
              </div>
            </div>

            {/* Licenses */}
            <div>
              <div className="text-sm font-semibold mb-3">License</div>
              <div className="flex flex-wrap gap-2">
                {["MIT", "Commercial", "GPL"].map((lic) => (
                  <button
                    key={lic}
                    onClick={() => toggleLicense(lic)}
                    className={`filter-chip ${filters.licenses.includes(lic) ? "active" : ""}`}
                  >
                    {lic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} results
            </div>

            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
              className="bg-background border border-border text-sm px-3 py-1.5 rounded-md focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest first</option>
              <option value="bestselling">Best selling</option>
              <option value="highest-rated">Highest rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-2xl">
              <p className="text-muted-foreground">No products match your filters.</p>
              <button onClick={clearFilters} className="mt-2 text-sm underline">Clear filters</button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <a href={`/product/${product.slug}`} key={product.id} className="flex gap-5 border border-border p-4 rounded-xl hover:bg-muted/40 group">
                  {product.preview_url && (
                    <img src={product.preview_url} alt="" className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="font-semibold text-lg tracking-tight group-hover:text-accent">{product.title}</div>
                      <div className="font-semibold text-right font-mono shrink-0">{product.price} {product.currency}</div>
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground mt-1">{product.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">{product.seller?.username}</span>
                      <span className="text-emerald-600">★ {product.rating_avg}</span>
                      <span>{product.sales_count} sales</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20">Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
