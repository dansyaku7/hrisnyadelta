"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DepartmentForm from "@/app/components/DepartmentForm";

export default function EditDepartmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/department/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading...</div>;
  if (!data) return <div className="p-12 text-center text-red-500">Departemen tidak ditemukan</div>;

  return (
    <div>
      <DepartmentForm
        mode="edit"
        initialData={data}
        onSuccess={() => router.push("/dashboardAdmin/pegawai")}
        onCancel={() => router.push("/dashboardAdmin/pegawai")}
      />
    </div>
  );
}
