import { useState, useEffect } from "react";
import { getHistory } from "../services/api";
import { getTreatment, URGENCY_COLORS } from "../services/treatments";
import { motion } from 'framer-motion';

const DIAGNOSIS_META = {
  healthy: {
    icon: "✅",
    label: "Healthy",
    color: "#16a34a",
    bg: "#dcfce7",
    border: "#86efac",
  },
  diseased: {
    icon: "🦠",
    label: "Diseased",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fcd34d",
  },
  rotten: {
    icon: "🔴",
    label: "Rotten",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  mixed: {
    icon: "⚠️",
    label: "Mixed",
    color: "#9333ea",
    bg: "#f3e8ff",
    border: "#c4b5fd",
  },
};

const SEVERITY_META = {
  none: { label: "None", color: "#16a34a" },
  mild: { label: "Mild", color: "#65a30d" },
  moderate: { label: "Moderate", color: "#d97706" },
  severe: { label: "Severe", color: "#dc2626" },
};

function DiagnosisCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const diag = DIAGNOSIS_META[item.overall_diagnosis] || DIAGNOSIS_META.healthy;
  const sev = SEVERITY_META[item.severity] || SEVERITY_META.none;
  const treatment = getTreatment(item.recommended_treatment_id);
  const urgency = treatment ? URGENCY_COLORS[treatment.urgency] : null;

  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "#f8fafc",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "48px 20px 20px",
          background: "linear-gradient(135deg, #166534, #16a34a)",
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 4px",
          }}
        >
          Scan History
        </h1>
        <p style={{ color: "#86efac", fontSize: 13 }}>
          {total > 0
            ? `${total} diagnosis${total > 1 ? "es" : ""} recorded`
            : "No scans yet"}
        </p>
      </div>

      <div style={{ padding: "16px 16px 24px" }}>
        {/* Filter pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 20,
            scrollbarWidth: "none",
          }}
        >
          {FILTERS.map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilter(f.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
                background: filter === f.id ? "#16a34a" : "#fff",
                color: filter === f.id ? "#fff" : "#64748b",
                boxShadow:
                  filter === f.id
                    ? "0 4px 12px rgba(22,163,74,0.3)"
                    : "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 36,
                height: 36,
                border: "3px solid #e2e8f0",
                borderTop: "3px solid #16a34a",
                borderRadius: "50%",
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
              color: "#dc2626",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "60px 32px",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔬</div>
            <div
              style={{
                fontWeight: 700,
                color: "#1e293b",
                fontSize: 17,
                marginBottom: 8,
              }}
            >
              No diagnoses yet
            </div>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>
              {filter !== "all"
                ? `No ${filter} results found.`
                : "Go scan your first apple!"}
            </div>
          </motion.div>
        )}

        {/* Cards */}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, i) => (
              <motion.div
                key={item.request_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DiagnosisCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={paginationBtn(page === 1)}
            >
              ← Prev
            </button>
            <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={paginationBtn(page === totalPages)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const LIMIT = 10;

  async function load(p, f) {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(p, f === "all" ? null : f);
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setError(
        "Could not load history. Make sure the backend is running on port 3000.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page, filter);
  }, [page, filter]);

  function handleFilter(f) {
    setFilter(f);
    setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "healthy", label: "✅ Healthy" },
    { id: "diseased", label: "🦠 Diseased" },
    { id: "rotten", label: "🔴 Rotten" },
    { id: "mixed", label: "⚠️ Mixed" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #f0fdf4, #ffffff)",
        padding: "40px 20px",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1
            style={{
              color: "#064e3b",
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 8px",
            }}
          >
            📋 Diagnosis History
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15 }}>
            {total > 0
              ? `${total} scan${total > 1 ? "s" : ""} recorded`
              : "Your past scans will appear here"}
          </p>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilter(f.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s",
                background: filter === f.id ? "#065f46" : "#e5e7eb",
                color: filter === f.id ? "#fff" : "#374151",
                boxShadow:
                  filter === f.id ? "0 4px 10px rgba(6,95,70,0.25)" : "none",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #10b981",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#6b7280", fontSize: 14 }}>Loading history...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
              color: "#b91c1c",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "60px 40px",
              textAlign: "center",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔬</div>
            <div
              style={{
                fontWeight: 600,
                color: "#374151",
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              No diagnoses yet
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              {filter !== "all"
                ? `No ${filter} results found. Try a different filter.`
                : "Go to the Diagnose tab and scan your first apple!"}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item) => (
              <DiagnosisCard key={item.request_id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={paginationBtn(page === 1)}
            >
              ← Prev
            </button>
            <span style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={paginationBtn(page === totalPages)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function getConfidenceColor(conf) {
  if (conf >= 0.85) return "#16a34a";
  if (conf >= 0.65) return "#d97706";
  return "#dc2626";
}

function paginationBtn(disabled) {
  return {
    padding: "10px 20px",
    borderRadius: 12,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
    background: disabled ? "#e5e7eb" : "#065f46",
    color: disabled ? "#9ca3af" : "#fff",
    opacity: disabled ? 0.6 : 1,
  };
}
