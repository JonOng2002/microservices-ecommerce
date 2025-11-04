"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { OrderType, ProductsType } from "@repo/types";
// Auth removed
import { useEffect, useState } from "react";

const CardList = ({ title }: { title: string }) => {
  // Auth removed - no token needed
  const [products, setProducts] = useState<ProductsType>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (title === "Popular Products") {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?limit=5&popular=true`
          );
          if (res.ok) {
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
          } else {
            console.warn(`Failed to fetch products: ${res.status} ${res.statusText}`);
            setProducts([]);
          }
        } else {
          // Auth removed - no token needed for orders
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?limit=5`
          );
          if (res.ok) {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          } else {
            console.warn(`Failed to fetch orders: ${res.status} ${res.statusText}`);
            setOrders([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data for CardList:", error);
        // Set empty arrays on error so component still renders
        if (title === "Popular Products") {
          setProducts([]);
        } else {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [title]);

  if (loading) {
    return (
      <div className="">
        <h1 className="text-lg font-medium mb-6">{title}</h1>
        <div className="text-center py-4">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const hasData = title === "Popular Products" ? products.length > 0 : orders.length > 0;

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      {!hasData ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {title === "Popular Products" 
              ? "No products available" 
              : "No orders found"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {title === "Popular Products"
            ? products.map((item) => (
                <Card
                  key={item.id}
                  className="flex-row items-center justify-between gap-4 p-4"
                >
                  <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                    <Image
                      src={
                        Object.values(item.images as Record<string, string>)[0] ||
                        ""
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-0">
                    <CardTitle className="text-sm font-medium">
                      {item.name}
                    </CardTitle>
                  </CardContent>
                  <CardFooter className="p-0">${item.price}K</CardFooter>
                </Card>
              ))
            : orders.map((item) => (
                <Card
                  key={item._id}
                  className="flex-row items-center justify-between gap-4 p-4"
                >
                  <CardContent className="flex-1 p-0">
                    <CardTitle className="text-sm font-medium">
                      {item.email}
                    </CardTitle>
                    <Badge variant="secondary">{item.status}</Badge>
                  </CardContent>
                  <CardFooter className="p-0">${item.amount / 100}</CardFooter>
                </Card>
              ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
