"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 

type Department = { id: number; name: string };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fetch("/api/department")
      .then((res) => res.json())
      .then((json) =>
        setDepartments(Array.isArray(json) ? json : json.data || []),
      );
    setIsMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !form.name ||
      !form.username ||
      !form.password ||
      !form.email ||
      !form.departmentId
    ) {
      setError("Semua field wajib diisi!");
      setLoading(false);
      return;
    }
    if (form.password.length < 5) {
      setError("Password minimal 6 karakter!");
      setLoading(false);
      return;
    }

    const departmentIdInt = Number(form.departmentId);
    if (isNaN(departmentIdInt) || departmentIdInt < 1) {
      setError("Pilih department dengan benar!");
      setLoading(false);
      return;
    }

    const body = {
      ...form,
      departmentId: departmentIdInt,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (res.ok) {
      router.push("/");
    } else {
      setError((data as any).error || "Registrasi gagal");
    }
    setLoading(false);
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-[#DCF2C0] p-12 text-center">
        <div className="max-w-md">
          <Image
            src="/lablogin.svg" 
            alt="Ilustrasi Exam Mastery"
            width={450}
            height={450}
            priority
          />
          <h1 className="mt-8 text-3xl font-bold text-gray-900">
            Delta Indonesia Labolatory
          </h1>
          <p className="mt-4 text-gray-600">
            A Bridge To environmental Sustainability
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8 md:p-12">
        <div className="w-full max-w-md">
          <Image
            src="/templates/delta.png"
            alt="Delta Logo"
            width={200}
            height={40}
            className="mb-10 mx-auto" 
          />

          {error && (
            <p className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleRegister} autoComplete="off" className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Nama Lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Username unik"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  minLength={5}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Departemen
              </label>
              <div className="relative mt-1">
                <select
                  id="department"
                  required
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  disabled={loading}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 pr-8"
                >
                  <option value="" disabled>
                    Pilih Departemen
                  </option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Register"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/" 
              className="font-medium text-green-600 hover:text-[#8BC942]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}