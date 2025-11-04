"use client";

import { useAuth } from "@clerk/nextjs";
import { OrderType } from "@repo/types";
import { useEffect, useState } from "react";

const fetchOrders = async (token: string | null): Promise<OrderType[]> => {
  if (!token) return [];
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/user-orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch orders:", res.status, res.statusText);
      return [];
    }

    const data: OrderType[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

const OrdersPage = () => {
  const { getToken, isLoaded } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      getToken()
        .then((token) => fetchOrders(token))
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });
    }
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div className="">
        <h1 className="text-2xl my-4 font-medium">Your Orders</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="">
        <h1 className="text-2xl my-4 font-medium">Your Orders</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">No orders found!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-2xl my-4 font-medium">Your Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order._id} className="flex items-center mb-4">
            <div className="w-1/4">
              <span className="font-medium text-sm text-gray-500">
                Order ID
              </span>
              <p>{order._id}</p>
            </div>
            <div className="w-1/12">
              <span className="font-medium text-sm text-gray-500">Total</span>
              <p>{order.amount / 100}</p>
            </div>
            <div className="w-1/12">
              <span className="font-medium text-sm text-gray-500">Status</span>
              <p>{order.status}</p>
            </div>
            <div className="w-1/8">
              <span className="font-medium text-sm text-gray-500">Date</span>
              <p>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-US")
                  : "-"}
              </p>
            </div>
            <div className="">
              <span className="font-medium text-sm text-gray-500">
                Products
              </span>
              <p>{order.products?.map(product=> product.name).join(", ") || "-"}</p>
            </div>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;