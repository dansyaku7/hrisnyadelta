"use client";
import { useEffect, useState } from "react";
import ShiftForm, { Shift } from "@/app/components/ShiftForm";
import { useParams } from "next/navigation";

export default function EditShiftPage() {
  const params = useParams();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/shift/${params.id}`);
        const data = await res.json();
        const raw = data.data;
        setShift({
          id: raw.id,
          name: raw.name,
          startTime: raw.startTime ?? raw.start_time ?? "",
          endTime: raw.endTime ?? raw.end_time ?? "",
          breakStart: raw.breakStart ?? raw.break_start ?? "",
          breakEnd: raw.breakEnd ?? raw.break_end ?? "",
          days: raw.days ? String(raw.days).split(",") : [],
        });
      } catch {
        setShift(null);
      }
      setLoading(false);
    }
    if (params.id) load();
  }, [params.id]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading...</div>
    );
  if (!shift)
    return (
      <div className="p-8 text-center text-red-500">
        Shift tidak ditemukan.
      </div>
    );

  return <ShiftForm mode="edit" initialData={shift} />;
}
