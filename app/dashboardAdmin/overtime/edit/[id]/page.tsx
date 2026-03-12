"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditOvertimeForm from "@/app/components/EditOvertimeForm";

export default function EditOvertimePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/overtime/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data overtime");
        return res.json();
      })
      .then(json => {
        if (!json.data) throw new Error("Data overtime tidak ditemukan");
        setInitialData(json.data); // sudah SQL, tidak perlu mapping _id ke id
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Terjadi kesalahan");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <EditOvertimeForm
      mode="edit"
      initialData={initialData}
      onSuccess={() => router.push("/dashboardAdmin/overtime")}
      onCancel={() => router.push("/dashboardAdmin/overtime")}
    />
  );
}
