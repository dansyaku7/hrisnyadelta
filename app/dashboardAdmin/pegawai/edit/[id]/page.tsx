"use client";
import { useEffect, useState } from "react";
import EditPegawaiForm, { EditPegawaiData } from "@/app/components/EditPegawaiForm";
import { useParams } from "next/navigation";

export default function EditPegawaiPage() {
  const params = useParams();
  const [data, setData] = useState<EditPegawaiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/employee/${params.id}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Data pegawai tidak ditemukan.</div>;

  return <EditPegawaiForm initialData={data} />;
}
