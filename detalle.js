import { db } from "./firebase-config.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("🚀 Módulo detalle.js iniciado.");

(function iniciarModuloDetalle() {

    function obtenerIdUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    function formatearFecha(fechaTimestamp) {
        if (!fechaTimestamp) return "No especificada";

        let fecha;
        if (typeof fechaTimestamp.toDate === "function") {
            fecha = fechaTimestamp.toDate();
        } else if (fechaTimestamp.seconds) {
            fecha = new Date(fechaTimestamp.seconds * 1000);
        } else {
            fecha = new Date(fechaTimestamp);
        }

        if (isNaN(fecha.getTime())) return "No especificada";

        const hoy = new Date();
        const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

        const diffDias = Math.round((inicioHoy - inicioFecha) / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return "Hoy";
        if (diffDias === 1) return "Ayer";
        if (diffDias > 1 && diffDias < 7) return `Hace ${diffDias} días`;

        return fecha.toLocaleDateString("es-DO", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    async function cargarDetalleVacante() {
        const vacanteId = obtenerIdUrl();
        console.log("📌 ID detectado en la URL:", vacanteId);

        // Selección de elementos del HTML
        const elPuesto = document.getElementById("puesto");
        const elEmpresa = document.getElementById("empresa");
        const elUbicacion = document.getElementById("ubicacion");
        const elSalario = document.getElementById("salario");
        const elHorario = document.getElementById("horario");
        const elContrato = document.getElementById("contrato");
        const elFechaPublicacion = document.getElementById("fechaPublicacion");

        const elDescripcion = document.getElementById("descripcion");
        const elRequisitos = document.getElementById("requisitos");
        const elBeneficios = document.getElementById("beneficios");

        const elAplicar = document.getElementById("aplicar");
        const elWhatsapp = document.getElementById("opcionWhatsapp");

        if (!vacanteId) {
            console.error("❌ No se encontró el parámetro ID en la URL.");
            if (elPuesto) elPuesto.textContent = "Vacante no encontrada (ID no especificado)";
            return;
        }

        try {
            const docRef = doc(db, "vacantes", vacanteId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.warn("⚠️ La vacante solicitada no existe en Firestore.");
                if (elPuesto) elPuesto.textContent = "Vacante no disponible o fue eliminada";
                return;
            }

            const vacante = docSnap.data();
            console.log("✅ Datos leídos de la vacante:", vacante);

            // Mapeo directo con los campos enviados desde el formulario
            const empresa = vacante.empresa || "Empresa Confidencial";
            const puesto = vacante.puesto || vacante.titulo || "Sin posición declarada";
            const ubicacion = vacante.ubicacion || "Santo Domingo";
            const salario = vacante.salario || "";
            const horario = vacante.horario || "";
            const contrato = vacante.contrato || vacante.tipoContrato || "No especificado";
            
            const descripcion = vacante.descripcion || "Sin descripción proporcionada.";
            const requisitos = vacante.requisitos || "No especificados.";
            const beneficios = vacante.beneficios || "No especificados.";
            const correo = vacante.correo || vacante.aplicar || "#";
            const fechaPublicada = formatearFecha(vacante.fechaCreacion || vacante.fecha);

            // Inyección de datos básicos
            if (elPuesto) elPuesto.textContent = puesto;
            if (elEmpresa) elEmpresa.textContent = empresa;
            if (elUbicacion) elUbicacion.textContent = ubicacion;
            if (elContrato) elContrato.textContent = contrato;

            // Ocultar la tarjeta de "Publicado" por completo
            if (elFechaPublicacion) {
                const tarjetaFecha = elFechaPublicacion.closest("div");
                if (tarjetaFecha) tarjetaFecha.style.display = "none";
            }

            // Filtro inteligente para el Salario (si es genérico, ocultamos la tarjeta completa)
            const salarioTexto = salario.toLowerCase().trim();
            const esSalarioGenerico = 
                salarioTexto === "" || 
                salarioTexto === "a convenir" || 
                salarioTexto.includes("discutir") || 
                salarioTexto.includes("evaluar") ||
                salarioTexto.includes("revisar");

            if (elSalario) {
                if (esSalarioGenerico) {
                    const tarjetaSalario = elSalario.closest("div");
                    if (tarjetaSalario) tarjetaSalario.style.display = "none";
                } else {
                    elSalario.textContent = salario;
                }
            }

            // Filtro inteligente para el Horario (si es genérico, ocultamos la tarjeta completa)
            const horarioTexto = horario.toLowerCase().trim();
            const esHorarioGenerico = 
                horarioTexto === "" || 
                horarioTexto === "no especificado" || 
                horarioTexto.includes("discutir") || 
                horarioTexto.includes("evaluar") ||
                horarioTexto.includes("revisar");

            if (elHorario) {
                if (esHorarioGenerico) {
                    const tarjetaHorario = elHorario.closest("div");
                    if (tarjetaHorario) tarjetaHorario.style.display = "none";
                } else {
                    elHorario.textContent = horario;
                }
            }

            // Renderizado de descripciones y requisitos
            if (elDescripcion) elDescripcion.innerHTML = descripcion;
            if (elRequisitos) elRequisitos.innerHTML = requisitos;
            if (elBeneficios) elBeneficios.innerHTML = beneficios;

            // Configuración del botón "Aplicar ahora" (Mailto)
            if (elAplicar) {
                if (correo.includes("@")) {
                    const asunto = `Postulación al puesto: ${puesto} - ${empresa}`;
                    const cuerpo = 
                        `Estimado equipo de Selección / ${empresa},\n\n` +
                        `Espero que se encuentren muy bien.\n\n` +
                        `Les escribo para presentar mi candidatura para la posición de "${puesto}", la cual vi publicada en Vacantes Peralta.\n\n` +
                        `Adjunto mi Currículum Vitae (CV) para su revisión.\n\n` +
                        `Quedo a su disposición para cualquier duda o consulta.`;
                        
                    elAplicar.href = `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
                } else {
                    elAplicar.href = correo;
                }
            }

            // Configuración del botón compartir por WhatsApp
            if (elWhatsapp) {
                const urlActual = window.location.href;
                const textoWA = `Mira esta vacante de ${puesto} en ${empresa}: ${urlActual}`;
                elWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoWA)}`;
            }

        } catch (error) {
            console.error("💥 Error consultando la vacante en Firestore:", error);
            if (elPuesto) elPuesto.textContent = "Error al obtener los detalles de la vacante";
        }
    }

    // Funciones globales para la UI
    window.toggleMenuCompartir = function() {
        const menu = document.getElementById("menuCompartir");
        if (menu) {
            menu.style.display = (menu.style.display === "block") ? "none" : "block";
        }
    };

    window.copiarEnlaceDetalle = function() {
        const textoCopiar = document.getElementById("textoCopiar");
        navigator.clipboard.writeText(window.location.href).then(() => {
            if (textoCopiar) {
                const original = textoCopiar.textContent;
                textoCopiar.textContent = "¡Copiado!";
                setTimeout(() => {
                    textoCopiar.textContent = original;
                }, 2000);
            }
        }).catch(err => {
            console.error("Error copiando enlace al portapapeles:", err);
        });
    };

    // Inicio seguro de ejecución
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", cargarDetalleVacante);
    } else {
        cargarDetalleVacante();
    }
})();