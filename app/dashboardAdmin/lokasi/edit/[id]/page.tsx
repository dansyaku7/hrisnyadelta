"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LokasiForm from "@/app/components/LokasiForm";
import { Paper, Typography, CircularProgress } from "@mui/material";

export default function EditLokasiPage() {
  const router = useRouter();
  const params = useParams();
  const lokasiId = params.id;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lokasiId) return;

    setLoading(true);
    fetch(`/api/lokasi/${lokasiId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data lokasi");
        return res.json();
      })
      .then((json) => {
        // Penyesuaian untuk response API yang bisa return { data } atau langsung objek
        const data = json.data ?? json;
        if (!data) throw new Error("Data lokasi tidak ditemukan");
        setInitialData({
          id: data.id, // MySQL id
          name: data.name ?? "",
          address: data.address ?? "",
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0,
          radius: data.radius ?? 100,
          note: data.note ?? "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Terjadi kesalahan");
        setLoading(false);
      });
  }, [lokasiId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 6, borderRadius: 3, boxShadow: 3 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <LokasiForm
      mode="edit"
      initialData={initialData}
      onSuccess={() => router.push("/dashboardAdmin/lokasi")}
    />
  );
}
