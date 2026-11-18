
// Endpoint del servidor backend local en Node.js + Express
const URL_API = "http://localhost:3000/api/albumes";

// Estado global en memoria para almacenar los álbumes obtenidos desde MySQL
let catalogoAlbumes = [];
let indiceCoverflowActual = 0;

// Mapa de rutas locales de portadas según el album_id registrado en MySQL
const PORTADAS_ALBUMES = {
  1: "assets/imgs/1.jpg",
  2: "assets/imgs/2.jpg",
  3: "assets/imgs/3.jpg",
  4: "assets/imgs/4.jpg",
  5: "assets/imgs/5.jpg",
  6: "assets/imgs/6.jpg",
  7: "assets/imgs/7.jpg",
  8: "assets/imgs/8.jpg",
  9: "assets/imgs/9.jpg",
  10: "assets/imgs/10.jpg"
};

// Mapa de rutas locales de los Title Tracks (.mp3) según el album_id
const AUDIOS_ALBUMES = {
  1: "assets/audio/1.mp3",
  2: "assets/audio/2.mp3",
  3: "assets/audio/3.mp3",
  4: "assets/audio/4.mp3",
  5: "assets/audio/5.mp3",
  6: "assets/audio/6.mp3",
  7: "assets/audio/7.mp3",
  8: "assets/audio/8.mp3",
  9: "assets/audio/9.mp3",
  10: "assets/audio/10.mp3"
};

// Referencias a elementos del DOM (Catálogo y filtros)
const contenedorAlbumes = document.getElementById("contenedor-albumes");
const buscadorInput = document.getElementById("buscador-album");
const filtroEraSelect = document.getElementById("filtro-era");
const btnLimpiar = document.getElementById("btn-limpiar");
const contadorResultados = document.getElementById("contador-resultados");
const estadoConexion = document.getElementById("estado-conexion");

// Referencias a elementos del DOM (Carrusel Coverflow y Reproductor)
const coverflowStage = document.getElementById("coverflow-stage");
const audioPlayer = document.getElementById("audio-title-track");
const btnPlayPause = document.getElementById("btn-play-pause");
const iconoPlayPause = document.getElementById("icono-play-pause");
const btnPrevTrack = document.getElementById("btn-prev-track");
const btnNextTrack = document.getElementById("btn-next-track");
const btnMute = document.getElementById("btn-mute");
const iconoVolumen = document.getElementById("icono-volumen");
const btnPlayerInfo = document.getElementById("btn-player-info");
const playerThumb = document.getElementById("player-thumb");
const playerSongTitle = document.getElementById("player-song-title");
const playerAlbumName = document.getElementById("player-album-name");
const playerProgress = document.getElementById("player-progress");
const playerTime = document.getElementById("player-time");

/**
 * Formatea un valor numérico a moneda chilena (CLP).
 * @param {number|string} valor - Precio numérico del álbum.
 * @returns {string} Precio formateado (ej. "$28.990").
 */
function formatearPrecioCLP(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(Number(valor));
}

/**
 * Convierte segundos numéricos a formato MM:SS.
 * @param {number} segundos - Tiempo transcurrido en segundos.
 * @returns {string} Tiempo formateado.
 */
function formatearSegundos(segundos) {
  if (isNaN(segundos)) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

/**
 * Obtiene los datos desde el backend usando fetch() asíncrono.
 */
async function cargarAlbumesDesdeDB() {
  try {
    estadoConexion.innerHTML = `
      <div class="alert alert-light border d-flex align-items-center gap-3 shadow-sm" role="status">
        <div class="spinner-border spinner-border-sm text-purple" role="status"></div>
        <span>Conectando con la base de datos MySQL y cargando discografía...</span>
      </div>
    `;

    const respuesta = await fetch(URL_API);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}: No se pudo obtener el catálogo.`);
    }

    catalogoAlbumes = await respuesta.json();
    estadoConexion.innerHTML = "";

    poblarSelectorEras(catalogoAlbumes);
    renderizarAlbumes(catalogoAlbumes);
    inicializarCoverflow();
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    contadorResultados.textContent = "Sin conexión con el servidor";
    estadoConexion.innerHTML = `
      <div class="alert alert-danger shadow-sm" role="alert">
        <h5 class="alert-heading fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i>Error de conexión con el Backend</h5>
        <p class="mb-1">No fue posible obtener los álbumes desde <code>${URL_API}</code>.</p>
        <hr>
        <p class="mb-0 small">Verifica que MySQL Server esté activo y que hayas ejecutado <code>node server.js</code> dentro de la carpeta <strong>backend</strong>.</p>
      </div>
    `;
  }
}

// =========================================================================
// CARRUSEL 3D COVERFLOW + REPRODUCTOR DE AUDIOS LOCALES (.MP3)
// =========================================================================
function inicializarCoverflow() {
  if (catalogoAlbumes.length === 0) return;

  coverflowStage.innerHTML = "";
  catalogoAlbumes.forEach((album, idx) => {
    const rutaImg = PORTADAS_ALBUMES[album.album_id] || "assets/imgs/1.jpg";
    const card = document.createElement("div");
    card.className = "cf-card cf-hidden";
    card.innerHTML = `
      <img src="${rutaImg}" alt="${album.titulo}">
      <div class="cf-card-overlay">
        <div class="cf-card-track text-truncate">${album.cancion_principal}</div>
        <div class="cf-card-album text-truncate">${album.titulo}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      if (idx === indiceCoverflowActual) alternarReproduccion();
      else seleccionarPistaCoverflow(idx, true);
    });

    coverflowStage.appendChild(card);
  });

  seleccionarPistaCoverflow(0, false);
}

function seleccionarPistaCoverflow(nuevoIndice, autoPlay = true) {
  const total = catalogoAlbumes.length;
  indiceCoverflowActual = (nuevoIndice + total) % total;

  const tarjetas = coverflowStage.querySelectorAll(".cf-card");
  tarjetas.forEach((card, idx) => {
    card.className = "cf-card";
    let diff = idx - indiceCoverflowActual;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff === 0) card.classList.add("cf-pos-0");
    else if (diff === -1) card.classList.add("cf-pos--1");
    else if (diff === 1) card.classList.add("cf-pos-1");
    else if (diff === -2) card.classList.add("cf-pos--2");
    else if (diff === 2) card.classList.add("cf-pos-2");
    else card.classList.add("cf-hidden");
  });

  audioPlayer.pause();
  actualizarIconoPlay(false);

  const albumActivo = catalogoAlbumes[indiceCoverflowActual];
  const rutaImg = PORTADAS_ALBUMES[albumActivo.album_id] || "assets/imgs/1.jpg";
  const rutaAudio = AUDIOS_ALBUMES[albumActivo.album_id] || "";

  playerThumb.src = rutaImg;
  playerSongTitle.textContent = albumActivo.cancion_principal;
  playerAlbumName.textContent = `${albumActivo.titulo} (${albumActivo.anio_lanzamiento})`;
  playerProgress.value = 0;
  playerTime.textContent = "0:00";

  if (rutaAudio) {
    audioPlayer.src = rutaAudio;
    if (autoPlay) {
      audioPlayer.play()
        .then(() => actualizarIconoPlay(true))
        .catch((err) => {
          console.warn("No se pudo reproducir el archivo:", rutaAudio, err);
          actualizarIconoPlay(false);
        });
    }
  } else {
    audioPlayer.removeAttribute("src");
  }
}

function alternarReproduccion() {
  if (!audioPlayer.src) {
    seleccionarPistaCoverflow(indiceCoverflowActual, true);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play()
      .then(() => actualizarIconoPlay(true))
      .catch(() => {
        alert(`No se encontró el archivo ${AUDIOS_ALBUMES[catalogoAlbumes[indiceCoverflowActual].album_id]}. Verifica que esté guardado en frontend/assets/audio/.`);
        actualizarIconoPlay(false);
      });
  } else {
    audioPlayer.pause();
    actualizarIconoPlay(false);
  }
}

function actualizarIconoPlay(reproduciendo) {
  iconoPlayPause.className = reproduciendo ? "bi bi-pause-fill" : "bi bi-play-fill";
}

btnPlayPause.addEventListener("click", alternarReproduccion);
btnPrevTrack.addEventListener("click", () => seleccionarPistaCoverflow(indiceCoverflowActual - 1, true));
btnNextTrack.addEventListener("click", () => seleccionarPistaCoverflow(indiceCoverflowActual + 1, true));

const playerVolume = document.getElementById("player-volume");
// Volumen inicial al 80%
audioPlayer.volume = 0.8;

playerVolume.addEventListener("input", () => {
  const nivel = Number(playerVolume.value);
  audioPlayer.volume = nivel;
  audioPlayer.muted = nivel === 0;

  if (nivel === 0) {
    iconoVolumen.className = "bi bi-volume-mute-fill";
  } else if (nivel < 0.5) {
    iconoVolumen.className = "bi bi-volume-down-fill";
  } else {
    iconoVolumen.className = "bi bi-volume-up-fill";
  }
});

btnMute.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  if (audioPlayer.muted) {
    iconoVolumen.className = "bi bi-volume-mute-fill";
    playerVolume.value = 0;
  } else {
    const nivelRestaurado = audioPlayer.volume > 0 ? audioPlayer.volume : 0.8;
    audioPlayer.volume = nivelRestaurado;
    playerVolume.value = nivelRestaurado;
    iconoVolumen.className = nivelRestaurado < 0.5 ? "bi bi-volume-down-fill" : "bi bi-volume-up-fill";
  }
});

btnPlayerInfo.addEventListener("click", () => {
  const albumActivo = catalogoAlbumes[indiceCoverflowActual];
  if (albumActivo) abrirModalDetalle(albumActivo.album_id);
});

audioPlayer.addEventListener("timeupdate", () => {
  if (audioPlayer.duration) {
    playerProgress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    playerTime.textContent = formatearSegundos(audioPlayer.currentTime);
  }
});

audioPlayer.addEventListener("ended", () => {
  seleccionarPistaCoverflow(indiceCoverflowActual + 1, true);
});

playerProgress.addEventListener("input", () => {
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (playerProgress.value / 100) * audioPlayer.duration;
  }
});

// =========================================================================
// FILTROS Y TARJETAS DE ÁLBUMES CON VINILO
// =========================================================================
function poblarSelectorEras(albumes) {
  const erasUnicas = [...new Set(albumes.map((album) => album.era))];

  erasUnicas.forEach((era) => {
    const opcion = document.createElement("option");
    opcion.value = era;
    opcion.textContent = era;
    filtroEraSelect.appendChild(opcion);
  });
}

function renderizarAlbumes(listaAlbumes) {
  contenedorAlbumes.innerHTML = "";
  contadorResultados.textContent = `Mostrando ${listaAlbumes.length} de ${catalogoAlbumes.length} álbumes registrados`;

  if (listaAlbumes.length === 0) {
    contenedorAlbumes.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5 bg-white rounded-4 shadow-sm">
          <i class="bi bi-disc display-4 text-muted"></i>
          <h3 class="h5 fw-bold mt-3">No se encontraron álbumes con esos filtros</h3>
          <p class="text-muted mb-3">Intenta buscar otro título, canción principal o selecciona todas las eras.</p>
          <button class="btn btn-outline-purple btn-sm" onclick="reiniciarFiltros()">Mostrar todos los álbumes</button>
        </div>
      </div>
    `;
    return;
  }

  listaAlbumes.forEach((album) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-4";
    const rutaPortada = PORTADAS_ALBUMES[album.album_id] || "assets/imgs/1.jpg";

    columna.innerHTML = `
      <article class="card album-card h-100 shadow-sm">
        <div class="album-showcase" style="background: linear-gradient(180deg, #dce2e8 0%, ${album.color_acento}45 100%);">
          <span class="album-year-pill">${album.anio_lanzamiento} • ${album.tipo_lanzamiento}</span>

          <div class="vinyl-display-wrapper">
            <div class="album-sleeve">
              <img
                src="${rutaPortada}"
                alt="Portada del álbum ${album.titulo}"
                onerror="this.src='https://placehold.co/300x300/5a189a/ffffff?text=BTS'"
              >
            </div>

            <div class="vinyl-disc" style="background-color: ${album.color_acento}cc;">
              <div class="vinyl-center-label" style="background-image: url('${rutaPortada}');"></div>
            </div>
          </div>
        </div>

        <div class="card-body d-flex flex-column p-4">
          <span class="badge bg-purple-soft text-purple align-self-start mb-2 text-wrap text-start">
            ${album.era}
          </span>

          <h2 class="album-card-title mb-2">${album.titulo}</h2>

          <p class="small text-muted mb-2">
            <i class="bi bi-music-note-beamed text-purple me-1"></i>
            <strong>Title Track:</strong> ${album.cancion_principal}
          </p>

          <p class="card-text text-secondary small flex-grow-1">
            ${album.descripcion}
          </p>

          <div class="d-flex justify-content-between align-items-center pt-3 mt-3 border-top">
            <span class="price-tag">${formatearPrecioCLP(album.precio_clp)}</span>
            <button
              type="button"
              class="btn btn-sm btn-outline-purple rounded-pill px-3"
              onclick="abrirModalDetalle(${album.album_id})"
            >
              Ver ficha <i class="bi bi-arrow-right-short"></i>
            </button>
          </div>
        </div>
      </article>
    `;

    contenedorAlbumes.appendChild(columna);
  });
}

function aplicarFiltrosDOM() {
  const textoBusqueda = buscadorInput.value.trim().toLowerCase();
  const eraSeleccionada = filtroEraSelect.value;

  const albumesFiltrados = catalogoAlbumes.filter((album) => {
    const coincideTexto =
      album.titulo.toLowerCase().includes(textoBusqueda) ||
      album.cancion_principal.toLowerCase().includes(textoBusqueda) ||
      album.descripcion.toLowerCase().includes(textoBusqueda);

    const coincideEra =
      eraSeleccionada === "todas" || album.era === eraSeleccionada;

    return coincideTexto && coincideEra;
  });

  renderizarAlbumes(albumesFiltrados);
}

function reiniciarFiltros() {
  buscadorInput.value = "";
  filtroEraSelect.value = "todas";
  renderizarAlbumes(catalogoAlbumes);
}

function abrirModalDetalle(albumId) {
  const album = catalogoAlbumes.find((item) => item.album_id === albumId);
  if (!album) return;

  document.getElementById("modal-banner-color").style.background =
    `linear-gradient(135deg, ${album.color_acento}, #1f1b24)`;
  document.getElementById("modal-era-badge").textContent = album.era;
  document.getElementById("modalTituloAlbum").textContent = album.titulo;
  document.getElementById("modal-descripcion").textContent = album.descripcion;
  document.getElementById("modal-anio").textContent = album.anio_lanzamiento;
  document.getElementById("modal-cancion").textContent = album.cancion_principal;
  document.getElementById("modal-tipo").textContent = album.tipo_lanzamiento;
  document.getElementById("modal-precio").textContent = formatearPrecioCLP(album.precio_clp);

  const modalBootstrap = new bootstrap.Modal(document.getElementById("modalDetalleAlbum"));
  modalBootstrap.show();
}

buscadorInput.addEventListener("input", aplicarFiltrosDOM);
filtroEraSelect.addEventListener("change", aplicarFiltrosDOM);
btnLimpiar.addEventListener("click", reiniciarFiltros);
document.addEventListener("DOMContentLoaded", cargarAlbumesDesdeDB);