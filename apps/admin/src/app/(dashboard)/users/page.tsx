"use client";

import { type User } from "@clerk/nextjs/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";

const getData = async (): Promise<{ data: User[]; totalCount: number }> => {
  try {
    // Auth removed - no token needed
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return { data: [], totalCount: 0 };
  }
};

const UsersPage = () => {
  const [users, setUsers] = useState<{ data: User[]; totalCount: number }>({ data: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData()
      .then((result) => {
        setUsers(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="">
        <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">All Users</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={users.data} />
    </div>
  );
};

export default UsersPage;
