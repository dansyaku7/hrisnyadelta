"use client";
import EditProfileAdmin from "@/app/components/EditProfileAdmin";
import { useEffect, useState } from "react";

type ProfileData = {
  name: string;
  NIK: string;
  email: string;
  username: string;
  phone: string;
  birthdate: string;
  norek: string;
  atasNama: string;
  department: string;
  address: string;
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Gagal mengambil data profile.");
          setLoading(false);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError("Tidak bisa terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>Gagal mengambil data profile.</div>;

  return <EditProfileAdmin />;
}
