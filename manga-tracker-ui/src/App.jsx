import { useEffect, useState } from "react";

const API_URL = "https://localhost:5022/api/manga";

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Reading");
  const [rating, setRating] = useState(8);

  const [noteMangaId, setNoteMangaId] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [noteText, setNoteText] = useState("");

  const loadManga = async () => {
    try {
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);
      if (minRating) params.append("minRating", minRating);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_URL}${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError("Не удалось достучаться до API. Проверь порт и запущен ли бэк в VS.");
    }
  };

  useEffect(() => {
    loadManga();
  }, [search, statusFilter, minRating]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        status,
        rating: Number(rating),
      }),
    });

    setTitle("");
    setAuthor("");
    setRating(8);
    loadManga();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadManga();
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteMangaId || !noteText.trim()) return;

    await fetch(`${API_URL}/${noteMangaId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterNumber: Number(chapterNumber),
        text: noteText.trim(),
      }),
    });

    setNoteText("");
    loadManga();
  };

  return (
    <div style={{ maxWidth: 820, margin: "30px auto", fontFamily: "sans-serif" }}>
      <h1>📚 Manga Tracker</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
        </select>
        <input type="number" min={1} max={10} value={rating} onChange={(e) => setRating(e.target.value)} />
        <button type="submit">➕ Добавить</button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="🔍 Поиск по названию/автору..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
        </select>
        <input
          type="number"
          min={1}
          max={10}
          placeholder="Мин. рейтинг"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        />
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((m) => (
          <li
            key={m.id}
            style={{
              border: "1px solid #444",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>#{m.id} {m.title}</strong> — {m.author} | <em>{m.status}</em> | ⭐ {m.rating}/10 | 📝 Заметок: {m.notesCount}
            </div>
            <button onClick={() => handleDelete(m.id)}>🗑️ Удалить</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddNote} style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
        <input
          type="number"
          placeholder="ID тайтла"
          value={noteMangaId}
          onChange={(e) => setNoteMangaId(e.target.value)}
          required
        />
        <input
          type="number"
          min={1}
          placeholder="Глава"
          value={chapterNumber}
          onChange={(e) => setChapterNumber(e.target.value)}
          required
        />
        <input
          placeholder="Заметка по главе"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
        />
        <button type="submit">📝 Добавить заметку</button>
      </form>
    </div>
  );
}