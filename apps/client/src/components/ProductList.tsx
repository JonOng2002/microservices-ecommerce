"use client";

import { ProductType } from "@repo/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const fetchData = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}): Promise<ProductType[]> => {
  try {
    const paramsObj = new URLSearchParams();
    if (category) paramsObj.append("category", category);
    if (search) paramsObj.append("search", search);
    paramsObj.append("sort", sort || "newest");
    if (params === "homepage") paramsObj.append("limit", "8");
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?${paramsObj.toString()}`
    );
    
    if (!res.ok) {
      console.error("Failed to fetch products:", res.status, res.statusText);
      return [];
    }
    
    const data: ProductType[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const ProductList = ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // Get sort and search from URL params if not provided as props
  const effectiveSort = sort || searchParams.get("sort") || undefined;
  const effectiveSearch = search || searchParams.get("search") || undefined;
  const effectiveCategory = category || searchParams.get("category") || undefined;

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchData({
        category: effectiveCategory,
        sort: effectiveSort,
        search: effectiveSearch,
        params,
      });
      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, [effectiveCategory, effectiveSort, effectiveSearch, params]);
  
  if (loading) {
    return (
      <div className="w-full">
        <Categories />
        {params === "products" && <Filter />}
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }
  
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="w-full">
        <Categories />
        {params === "products" && <Filter />}
        <div className="text-center py-8">
          <p className="text-gray-500">No products found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <Categories />
      {params === "products" && <Filter />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link
        href={effectiveCategory ? `/products/?category=${effectiveCategory}` : "/products"}
        className="flex justify-end mt-4 underline text-sm text-gray-500"
      >
        View all products
      </Link>
    </div>
  );
};

export default ProductList;
