// apiService.js
const API_URL = "http://localhost:3000/api/peliculas";

export async function getAll() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function create(pelicula) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pelicula),
  });
  return res.json();
}

export async function update(id, pelicula) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pelicula),
  });
  return res.json();
}

export async function remove(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
