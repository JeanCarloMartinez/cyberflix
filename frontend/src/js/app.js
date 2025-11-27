// ./js/app.js
import { getAll, getById, create, update, remove } from "./apiService";

const frm = document.getElementById("frmPelicula");
const tbody = document.querySelector("table tbody");
const txtTitulo = document.getElementById("txtTitulo");
const txtAño = document.getElementById("txtAño");
const txtDuracion = document.getElementById("txtDuracion");
const txtDirector = document.getElementById("txtDirector");
const txtSinopsis = document.getElementById("txtSinopsis");

// NUEVAS/MODIFICADAS VARIABLES PARA GÉNEROS
// const txtGeneros = document.getElementById("txtGeneros"); // <-- Eliminado/Comentado
const generosCheckboxName = "generos_checkbox"; // Nombre que usamos en los inputs checkbox
const groupGeneros = document.getElementById("groupGeneros"); // Contenedor para el feedback visual

let onEdit = false;
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarPeliculas();
  // Inicializa la validación de Bootstrap
  initializeBootstrapValidation();
});

async function cargarPeliculas() {
  try {
    const peliculas = await getAll();
    renderPeliculas(peliculas || []);
  } catch (err) {
    console.error("Error cargando películas:", err);
    renderPeliculas([]);
  }
}

function renderPeliculas(peliculas) {
  tbody.innerHTML = "";

  if (!peliculas || peliculas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="text-center">No hay películas</td>`;
    tbody.appendChild(tr);
    return;
  }

  peliculas.forEach((p) => {
    const tr = document.createElement("tr");
    const generos = Array.isArray(p.generos)
      ? p.generos.join(", ")
      : p.generos || "-";
    tr.innerHTML = `
      <td>${escapeHtml(p.titulo)}</td>
      <td>${p.anio ?? "-"}</td>
      <td>${p.duracion ?? "-"}</td>
      <td>${escapeHtml(generos)}</td>
      <td>${escapeHtml(p.director ?? "-")}</td>
      <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(
        p.sinopsis ?? "-"
      )}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-edit" data-id="${
          p._id
        }"><i class="bi bi-pencil-fill"></i></button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${
          p._id
        }"><i class="bi bi-trash3-fill"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach events
  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      await startEdit(id);
    });
  });

  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      handleDelete(id);
    });
  });
}

frm.addEventListener("submit", async (e) => {
  // Manejo de la validación de Bootstrap
  if (!frm.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
    // No es necesario alertar, Bootstrap se encarga del feedback visual
  }

  // Si la validación de HTML falló, detenemos el código aquí
  if (!frm.checkValidity()) {
    frm.classList.add("was-validated");
    return;
  }

  e.preventDefault();

  const titulo = txtTitulo.value.trim();
  const anioVal = txtAño.value;
  const duracionVal = txtDuracion.value;
  const director = txtDirector.value.trim();
  const sinopsis = txtSinopsis.value.trim();

  // La validación simple de campos obligatorios ya es manejada por 'required' en HTML5.

  const anio = Number(anioVal);
  const duracion = Number(duracionVal);

  // -------------------------------------------------------------------
  // LÓGICA CORREGIDA: Recolección de géneros desde checkboxes
  // -------------------------------------------------------------------
  const selectedCheckboxes = frm.querySelectorAll(
    `input[name="${generosCheckboxName}"]:checked`
  );
  const generos = Array.from(selectedCheckboxes).map((cb) => cb.value);

  // Validación de al menos un género seleccionado (no cubierta por required en grupo)
  if (generos.length === 0) {
    alert("Selecciona al menos un género.");
    if (groupGeneros) {
      groupGeneros.classList.add("is-invalid"); // Añadir clase de error visual al contenedor
    }
    frm.classList.add("was-validated");
    return;
  } else {
    if (groupGeneros) {
      groupGeneros.classList.remove("is-invalid");
    }
  }
  // -------------------------------------------------------------------

  const payload = {
    titulo,
    anio,
    duracion,
    generos,
    director,
    sinopsis,
  };

  try {
    if (onEdit && editId) {
      await update(editId, payload);
      onEdit = false;
      editId = null;
    } else {
      await create(payload);
    }

    clearForm();
    cargarPeliculas();
  } catch (err) {
    console.error("Error guardando película:", err);
    alert("Ocurrió un error al guardar la película.");
  }
});

async function startEdit(id) {
  try {
    const p = await getById(id);

    if (!p || !p.titulo) {
      return alert("Película no encontrada.");
    }

    // poblar formulario
    txtTitulo.value = p.titulo || "";
    txtAño.value = p.anio ?? "";
    txtDuracion.value = p.duracion ?? "";
    txtDirector.value = p.director || "";
    txtSinopsis.value = p.sinopsis || "";

    // -------------------------------------------------------------------
    // LÓGICA CORREGIDA: Poblar Checkboxes
    // -------------------------------------------------------------------
    const allCheckboxes = frm.querySelectorAll(
      `input[name="${generosCheckboxName}"]`
    );
    allCheckboxes.forEach((cb) => {
      // 1. Desmarcar todos primero
      cb.checked = false;

      // 2. Marcar si el valor de la checkbox está en el array de géneros de la película
      if (Array.isArray(p.generos) && p.generos.includes(cb.value)) {
        cb.checked = true;
      }
    });
    // -------------------------------------------------------------------

    onEdit = true;
    editId = id;
    // Limpia la validación visual al entrar en modo edición
    frm.classList.remove("was-validated");
    if (groupGeneros) groupGeneros.classList.remove("is-invalid");

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Error al iniciar edición (comunicación/red):", err);
    alert(
      "Ocurrió un error de comunicación al cargar la película para edición."
    );
  }
}

async function handleDelete(id) {
  const ok = confirm("¿Seguro que quieres eliminar esta película?");
  if (!ok) return;
  try {
    const res = await remove(id);
    cargarPeliculas();
  } catch (err) {
    console.error("Error eliminando:", err);
    alert("No se pudo eliminar la película.");
  }
}

function clearForm() {
  frm.reset();

  // Limpia el estado de validación de Bootstrap
  frm.classList.remove("was-validated");
  if (groupGeneros) groupGeneros.classList.remove("is-invalid");

  // Asegura que todos los checkboxes se desmarquen al limpiar
  frm.querySelectorAll(`input[name="${generosCheckboxName}"]`).forEach((cb) => {
    cb.checked = false;
  });

  onEdit = false;
  editId = null;
}

// NUEVA FUNCIÓN: Inicializa la validación visual de Bootstrap
function initializeBootstrapValidation() {
  // La función principal de Bootstrap para que el formulario sepa cuándo mostrar los estilos de validación
  frm.addEventListener(
    "submit",
    function (event) {
      if (!frm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      frm.classList.add("was-validated");
    },
    false
  );
}

// pequeña utilidad para escapar HTML en la tabla
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
