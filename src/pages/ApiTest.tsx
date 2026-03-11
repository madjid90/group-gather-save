import { useState } from "react";

const URLS = [
  "https://api.selectra.com/comparator",
  "https://api.selectra.com/comparator/offers",
  "https://api.selectra.com/comparator/offres",
  "https://api.selectra.com/comparator/energy",
  "https://api.selectra.com/swagger.json",
  "https://api.selectra.com/openapi.json",
];

type Result = { url: string; status: number | null; body: string; loading: boolean };

export default function ApiTest() {
  const [token, setToken] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setResults(URLS.map((url) => ({ url, status: null, body: "", loading: true })));

    const promises = URLS.map(async (url, i) => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let body: string;
        try {
          const json = await res.json();
          body = JSON.stringify(json, null, 2);
        } catch {
          body = await res.text().catch(() => "(empty)");
        }
        setResults((prev) => {
          const next = [...prev];
          next[i] = { url, status: res.status, body, loading: false };
          return next;
        });
      } catch (err: any) {
        setResults((prev) => {
          const next = [...prev];
          next[i] = { url, status: null, body: `Network error: ${err.message}`, loading: false };
          return next;
        });
      }
    });

    await Promise.all(promises);
    setTesting(false);
  };

  return (
    <div style={{ padding: 24, fontFamily: "monospace", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>API Selectra – Test</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Bearer token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }}
        />
        <button
          onClick={handleTest}
          disabled={testing || !token}
          style={{ padding: "8px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
        >
          {testing ? "Testing…" : "Tester"}
        </button>
      </div>

      {results.map((r) => (
        <div
          key={r.url}
          style={{
            marginBottom: 16,
            padding: 12,
            border: `2px solid ${r.loading ? "#ccc" : r.status === 200 ? "#22c55e" : "#ef4444"}`,
            borderRadius: 8,
            background: r.loading ? "#f9f9f9" : r.status === 200 ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{r.url}</div>
          <div style={{ marginBottom: 4 }}>
            Status: {r.loading ? "⏳" : r.status ?? "ERR"}
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, maxHeight: 300, overflow: "auto" }}>
            {r.loading ? "Loading…" : r.body}
          </pre>
        </div>
      ))}
    </div>
  );
}
