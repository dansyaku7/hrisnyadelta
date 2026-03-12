"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,Typography } from "@mui/material"
import { FiEdit, FiUpload, FiTrash2, FiXCircle } from "react-icons/fi"

type Announcement = {
  id: number
  title: string
  content: string
  created_by?: string
  created_at?: string
  expired_at?: string
  status: "draft" | "published"
  published_by?: string | null
  published_at?: string | null
  updated_at?: string | null
  updated_by_name?: string
  priority?: string
  target:number[] | null;
}

type Department = {
  id: number;
  name: string;
};

const formatDate = (dateStr?: string | null) =>
  dateStr ? new Date(dateStr).toLocaleDateString("id-ID") : "-"

const countdown = (expiredAt: string | undefined) => {
  if (!expiredAt) return "-"
  const now = new Date()
  const expired = new Date(expiredAt)
  const diff = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Kadaluarsa"
  if (diff === 0) return "Hari ini"
  return `${diff} hari lagi`
}

export default function DaftarPengumuman() {
  const [draftData, setDraftData] = useState<Announcement[]>([])
  const [publishedData, setPublishedData] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [pageDraft, setPageDraft] = useState(0)
  const [rowsPerPageDraft, setRowsPerPageDraft] = useState(5)
  const [pagePub, setPagePub] = useState(0)
  const [rowsPerPagePub, setRowsPerPagePub] = useState(5)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/announcements")
      const { data } = await res.json()
      const now = new Date()
      setDraftData(data.filter((a: Announcement) => a.status === "draft"))
      setPublishedData(
        data.filter(
          (a: Announcement) =>
            a.status === "published" && a.expired_at && new Date(a.expired_at) > now
        )
      )
      const resDept = await fetch("/api/department");
      const jsonDept = await resDept.json();
      setDepartments(jsonDept || []);
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getDepartmentNamesByIds(ids: number[], departments: {id: number, name: string}[]): string {
  if (!Array.isArray(ids) || ids.length === 0) return "Semua";
  const names = ids
    .map(id => departments.find(dep => dep.id === id)?.name)
    .filter(Boolean) as string[];
  return names.length > 0 ? names.join(", ") : "Semua";
}

  const handleEdit = (id: number) => {
    window.location.href = `/dashboardAdmin/pengumuman/edit/${id}`
  }
  const handlePublish = async (id: number) => {
    if (!window.confirm("Yakin ingin publish pengumuman ini?")) return
    const userRes = await fetch("/api/me")
    const user = await userRes.json()
    await fetch(`/api/announcements/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishedBy: user.name }),
    })
    fetchData()
  }
  const handleUnpublish = async (id: number) => {
    if (!window.confirm("Kembalikan ke draft?")) return
    await fetch(`/api/announcements/${id}/unpublish`, { method: "PATCH" })
    fetchData()
  }
  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return
    await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    fetchData()
  }

  // Pagination slice
  const pagedDraft = draftData.slice(pageDraft * rowsPerPageDraft, pageDraft * rowsPerPageDraft + rowsPerPageDraft)
  const pagedPublished = publishedData.slice(pagePub * rowsPerPagePub, pagePub * rowsPerPagePub + rowsPerPagePub)

  // Header style
  const headerCellStyle = { color: "white", fontWeight: "bold" as const }
  const headerRowSx = { backgroundColor: "#20653a" }

  return (
    <>
    {/* Judul dan tambah */}
      <Typography
        fontWeight="bold"
        fontSize={32}
        sx={{
          mt: 4,
          color: "white",
          letterSpacing: 0.5,
          background: "#20653a",
          borderRadius: 3,
          px: 4,
          py: 2,
          display: "inline-block"
        }}
      >
        Pengumuman
      </Typography>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
      {/* Tabel Draft */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 4}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>Draft</div>
          <Link href="/dashboardAdmin/pengumuman/tambah">
            <Button variant="contained" color="success" size="small" sx={{ borderRadius: 2 }}>
              + Tambah Pengumuman
            </Button>
          </Link>
        </div>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>Judul</TableCell>
                <TableCell sx={headerCellStyle}>Dibuat oleh</TableCell>
                <TableCell sx={headerCellStyle}>Tanggal Buat</TableCell>
                <TableCell sx={headerCellStyle}>Kadaluarsa</TableCell>
                <TableCell sx={headerCellStyle}>Target</TableCell>
                <TableCell sx={headerCellStyle}>Prioritas</TableCell>
                <TableCell sx={headerCellStyle} align="left">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Memuat data...</TableCell>
                </TableRow>
              ) : pagedDraft.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Tidak ada draft.</TableCell>
                </TableRow>
              ) : pagedDraft.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div style={{ fontWeight: "bold" }}>{row.title}</div>
                  </TableCell>
                  <TableCell>{row.created_by}</TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                  <TableCell>{formatDate(row.expired_at)}</TableCell>
                  <TableCell>
                    {row.target === null || (Array.isArray(row.target) && row.target.length === 0)
                      ? "Semua"
                      : Array.isArray(row.target)
                        ? getDepartmentNamesByIds(row.target, departments)
                        : "-"}
                  </TableCell>
                  <TableCell>
                    {row.priority ? (
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        fontSize: 12,
                        color:
                          row.priority === "tinggi" ? "#b91c1c"
                            : row.priority === "sedang" ? "#b45309"
                              : "#166534",
                        background:
                          row.priority === "tinggi" ? "#fee2e2"
                            : row.priority === "sedang" ? "#fef08a"
                              : "#dcfce7"
                      }}>{row.priority}</span>
                    ) : <span style={{ color: "#aaa" }}>-</span>}
                  </TableCell>
                  <TableCell align="left">
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="small" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleEdit(row.id)}>
                        <FiEdit />
                      </Button>
                      <Button size="small" color="success" sx={{ minWidth: 0, p: "4px" }} onClick={() => handlePublish(row.id)}>
                        <FiUpload />
                      </Button>
                      <Button size="small" color="error" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleDelete(row.id)}>
                        <FiTrash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={draftData.length}
            rowsPerPage={rowsPerPageDraft}
            page={pageDraft}
            onPageChange={(_, newPage) => setPageDraft(newPage)}
            onRowsPerPageChange={e => { setRowsPerPageDraft(parseInt(e.target.value)); setPageDraft(0) }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>

      {/* Tabel Published */}
      <Paper sx={{ p: 2 , borderRadius: 4}}>
        <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>Published</div>
        <TableContainer sx={{ borderRadius: 2 , boxShadow: 4}}>
          <Table>
            <TableHead>
              <TableRow sx={headerRowSx}>
                <TableCell sx={headerCellStyle}>Judul</TableCell>
                <TableCell sx={headerCellStyle}>Terbit oleh</TableCell>
                <TableCell sx={headerCellStyle}>Tanggal Terbit</TableCell>
                <TableCell sx={headerCellStyle}>Kadaluarsa</TableCell>
                <TableCell sx={headerCellStyle}>Target</TableCell>
                <TableCell sx={headerCellStyle}>Prioritas</TableCell>
                <TableCell sx={headerCellStyle} align="left">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Memuat data...</TableCell>
                </TableRow>
              ) : pagedPublished.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Belum ada pengumuman published.</TableCell>
                </TableRow>
              ) : pagedPublished.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div style={{ fontWeight: "bold" }}>{row.title}</div>
                  </TableCell>
                  <TableCell>{row.published_by || "-"}</TableCell>
                  <TableCell>{formatDate(row.published_at)}</TableCell>
                  <TableCell>
                    <div>{formatDate(row.expired_at)}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{countdown(row.expired_at)}</div>
                  </TableCell>
                  <TableCell>
                    {row.target === null || (Array.isArray(row.target) && row.target.length === 0)
                      ? "Semua"
                      : Array.isArray(row.target)
                        ? getDepartmentNamesByIds(row.target, departments)
                        : "-"}
                  </TableCell>
                  <TableCell>
                    {row.priority ? (
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        fontSize: 12,
                        color:
                          row.priority === "tinggi" ? "#b91c1c"
                            : row.priority === "sedang" ? "#b45309"
                              : "#166534",
                        background:
                          row.priority === "tinggi" ? "#fee2e2"
                            : row.priority === "sedang" ? "#fef08a"
                              : "#dcfce7"
                      }}>{row.priority}</span>
                    ) : <span style={{ color: "#aaa" }}>-</span>}
                  </TableCell>
                  <TableCell align="left">
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="small" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleEdit(row.id)}>
                        <FiEdit />
                      </Button>
                      <Button size="small" color="warning" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleUnpublish(row.id)}>
                        <FiXCircle />
                      </Button>
                      <Button size="small" color="error" sx={{ minWidth: 0, p: "4px" }} onClick={() => handleDelete(row.id)}>
                        <FiTrash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={publishedData.length}
            rowsPerPage={rowsPerPagePub}
            page={pagePub}
            onPageChange={(_, newPage) => setPagePub(newPage)}
            onRowsPerPageChange={e => { setRowsPerPagePub(parseInt(e.target.value)); setPagePub(0) }}
            labelRowsPerPage="Baris per halaman"
          />
        </TableContainer>
      </Paper>
    </div>
    </>
  )
}
