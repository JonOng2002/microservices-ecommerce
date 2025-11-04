"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

const TestPage = () => {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      getToken().then((token) => {
        console.log(token);
      });
    }
  }, [isLoaded, getToken]);

  // const resProduct = await fetch("http://localhost:8000/test", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // const dataProduct = await resProduct.json();


  // const resOrder = await fetch("http://localhost:8001/test", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // const dataOrder = await resOrder.json();


  // const resPayment = await fetch("http://localhost:8002/test", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // const dataPayment = await resPayment.json();

  return <div className="">TestPage</div>;
};

export default TestPage;
