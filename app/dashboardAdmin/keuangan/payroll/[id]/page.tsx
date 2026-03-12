"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PayrollDetail from "@/app/components/PayrollDetail";

export type PayrollDetailType = {
  id: number;
  employee_name: string;
  department_name: string;
  periode_mulai: string;
  periode_akhir: string;
  [key: string]: any;
};

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/payroll/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error || "Gagal mengambil data payroll");
        }
        return res.json();
      })
      .then(json => {
        setPayroll(json.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setPayroll(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-12 text-center text-red-400">{error}</div>;
  if (!payroll) return <div className="p-12 text-center text-red-400">Data payroll tidak ditemukan.</div>;

  return (
    <div>
      <PayrollDetail payroll={payroll} />
    </div>
  );
}
