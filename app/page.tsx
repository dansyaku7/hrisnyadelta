"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role === "admin") {
          router.push("/dashboardAdmin");
        } else if (data.role === "user") {
          router.push("/dashboardUser");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Login gagal");
      }
    } catch (e) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleLogin} className="space-y-6">
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
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Delta2025"
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Log in"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register" 
              className="font-medium text-green-600 hover:text-[#8BC942]"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}