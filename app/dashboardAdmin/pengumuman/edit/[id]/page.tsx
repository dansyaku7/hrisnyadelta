"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AnnouncementForm from "../../../../components/AnnouncementForm";

export default function EditPengumumanPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/announcements/${params.id}`);
      const { data } = await res.json();
      setInitialData({
        title: data.title,
        content: data.content,
        expiredAt: data.expiredAt ? data.expiredAt.slice(0, 10) : "",
      });
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <AnnouncementForm mode="edit" initialData={initialData} />
  );
}
