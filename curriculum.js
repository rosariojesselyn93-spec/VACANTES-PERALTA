// ==========================================
// CURRICULUM.JS - Versión Global (Moderno Ejecutivo)
// Corregido: Eliminación profunda de párrafos y textos de guía vacíos
// ==========================================

const templates = {
    modern: `
        <div class="page-a4 tpl-modern" id="cv-page-container" style="box-sizing: border-box; width: 210mm; min-height: 297mm; margin: 0 auto; background: white;">
            <div class="cv-content-sheet" style="padding: 15mm 15mm 15mm 15mm; box-sizing: border-box; width: 100%;">
                <div id="sortable-container" style="width: 100%;">
                    
                    <!-- Cabecera -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="top-section" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                            <div class="photo-container" onclick="document.getElementById('file-photo').click()" title="Sube tu foto en formato JPEG o PNG" style="flex-shrink: 0; width: 100px; height: 120px; border: 2px dashed #cbd5e0; display: flex; align-items: center; justify-content: center; text-align: center; cursor: pointer; background: #f7fafc; overflow: hidden; position: relative;">
                                <span id="photo-text-preview" style="font-size: 8pt; color: #718096; padding: 5px;">Sube tu Foto (JPG/PNG)</span>
                                <img id="img-preview" src="" style="display:none; width: 100%; height: 100%; object-fit: cover;" />
                            </div>
                            <input type="file" id="file-photo" class="photo-input" accept="image/jpeg, image/png" onchange="previewImage(event)" style="display:none;">
                            
                            <div class="info-group" style="flex-grow: 1; min-width: 200px;">
                                <div class="editable" contenteditable="true" data-placeholder="[Tu Nombre y Apellido]" style="font-size: 20pt; font-weight: bold; color: #1a365d; text-transform: uppercase; margin-bottom: 3px; display: block; outline: none;"></div>
                                <div class="editable subtitle" contenteditable="true" data-placeholder="[Título del Puesto al que Aspiras]" style="font-size: 11pt; font-weight: bold; color: #4a5568; display: block; margin-bottom: 8px; outline: none;"></div>
                                
                                <!-- Contacto estructurado para fluir sin huecos -->
                                <div class="contact-grid" style="display: flex; flex-wrap: wrap; gap: 12px 18px; font-size: 9.5pt; color: #2d3748;">
                                    <div class="contact-item-box" style="display: inline-block;"><strong>Teléfono:</strong> <span class="editable format-phone" contenteditable="true" data-placeholder="000-000-0000" oninput="formatPhoneInput(this)"></span></div>
                                    <div class="contact-item-box" style="display: inline-block;"><strong>Correo:</strong> <span class="editable format-email" contenteditable="true" data-placeholder="correo@ejemplo.com" onblur="validateEmailInput(this)"></span></div>
                                    <div class="contact-item-box" style="display: inline-block;"><strong>Ubicación:</strong> <span class="editable" contenteditable="true" data-placeholder="[Tu Ciudad]"></span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sobre Mí -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Sobre Mí</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <p class="editable" contenteditable="true" data-placeholder="[Escribe aquí una breve descripción...]" style="font-size: 9.5pt; color: #2d3748; line-height: 1.4; margin: 0;"></p>
                    </div>

                    <!-- Experiencia Laboral -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Experiencia Laboral</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <div class="experience-list">
                            <div class="experience-item" style="position:relative; margin-bottom: 12px; border-left: 2px solid #2b6cb0; padding-left: 10px;">
                                <p style="margin: 0 0 2px 0;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de la Empresa]" style="font-size: 10pt; color: #1a365d;"></strong></p>
                                <p style="margin: 0 0 4px 0;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre del Cargo o Puesto Ocupado]" style="font-size: 9.5pt; font-weight: bold; color: #4a5568;"></strong></p>
                                <ul class="bullet-list" style="margin: 0; padding-left: 15px;">
                                    <li class="bullet-item" style="position:relative; margin-bottom: 3px; padding-right: 25px; font-size: 9pt; color: #2d3748;">
                                        <span class="editable" contenteditable="true" data-placeholder="Describe tu función o logro principal..." style="display:block;"></span>
                                        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar viñeta">×</button>
                                    </li>
                                </ul>
                                <button onclick="addBullet(this)" class="add-btn" style="margin-top: 4px;">+ Añadir función/logro</button>
                                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar experiencia completa" style="top: 0; right: 0;">×</button>
                            </div>
                        </div>
                        <button onclick="addExperience(this)" class="add-btn">+ Añadir otra experiencia</button>
                    </div>

                    <!-- Educación -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Educación y Formación</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <div class="education-list">
                            <div class="education-item" style="position:relative; margin-bottom: 8px; padding-right: 25px;">
                                <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Título o Carrera Universitaria]" style="font-weight: bold; color: #1a365d;"></strong> — <span class="editable" contenteditable="true" data-placeholder="[Nombre de la Institución]"></span></p>
                                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar formación">×</button>
                            </div>
                        </div>
                        <button onclick="addEducation(this)" class="add-btn">+ Añadir otra formación</button>
                    </div>

                    <!-- Habilidades -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Habilidades y Competencias</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <ul class="skill-list" style="margin: 0; padding-left: 15px; list-style-type: disc;">
                            <li class="skill-item" style="position:relative; margin-bottom: 3px; padding-right: 25px; font-size: 9pt; color: #2d3748;">
                                <span class="editable" contenteditable="true" data-placeholder="[Ej: Gestión de proyectos, Liderazgo...]" style="display:block;"></span>
                                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar habilidad">×</button>
                            </li>
                        </ul>
                        <button onclick="addSkill(this)" class="add-btn" style="margin-top: 5px;">+ Añadir habilidad</button>
                    </div>

                    <!-- Referencias Laborales -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Referencias Laborales</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <div class="reference-list">
                            <div class="reference-item" style="position:relative; margin-bottom: 8px; padding-right: 25px;">
                                <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de Referencia]" style="font-weight: bold; color: #1a365d;"></strong> – <span class="editable" contenteditable="true" data-placeholder="[Teléfono]"></span></p>
                                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar referencia">×</button>
                            </div>
                        </div>
                        <button onclick="addReference(this)" class="add-btn">+ Añadir otra referencia laboral</button>
                    </div>

                    <!-- Referencias Personales -->
                    <div class="draggable-block" draggable="true" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 15px;">
                        <div class="drag-handle" title="Arrastrar sección">⋮⋮</div>
                        <div class="section-title-wrapper" style="position:relative; border-bottom: 2px solid #2b6cb0; margin-bottom: 8px; padding-bottom: 2px;">
                            <h2 contenteditable="true" class="section-title" style="font-size: 12pt; color: #2b6cb0; text-transform: uppercase; margin: 0;">Referencias Personales</h2>
                            <button onclick="removeSection(this)" class="remove-section-btn" title="Eliminar este título y su contenido">×</button>
                        </div>
                        <div class="personal-ref-list">
                            <div class="personal-ref-item" style="position:relative; margin-bottom: 8px; padding-right: 25px;">
                                <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de Referencia Personal]" style="font-weight: bold; color: #1a365d;"></strong> – <span class="editable" contenteditable="true" data-placeholder="[Teléfono]"></span></p>
                                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar referencia">×</button>
                            </div>
                        </div>
                        <button onclick="addPersonalReference(this)" class="add-btn">+ Añadir otra referencia personal</button>
                    </div>

                </div>
            </div>
        </div>
    `
};

// ==========================================
// GESTIÓN DE INTERFAZ Y PLANTILLAS
// ==========================================

window.loadTemplate = function() {
    const selector = document.getElementById('selector-container');
    const workspace = document.getElementById('workspace');
    const canvas = document.getElementById('cv-canvas');

    if (selector) selector.style.display = 'none';
    if (workspace) workspace.style.display = 'block';
    
    if (canvas && templates.modern) {
        canvas.innerHTML = templates.modern;
        initDragAndDrop();
        updatePageMetrics();
    }
    window.scrollTo(0, 0);
};

window.backToSelector = function() {
    const selector = document.getElementById('selector-container');
    const workspace = document.getElementById('workspace');

    if (workspace) workspace.style.display = 'none';
    if (selector) selector.style.display = 'block';
};

// ==========================================
// TAMAÑOS, MÁRGENES Y PÁGINAS
// ==========================================

window.changeFontSize = function(sizeType) {
    const canvas = document.getElementById('cv-canvas');
    if (!canvas) return;
    
    canvas.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
    if (sizeType === 'small') {
        canvas.classList.add('font-size-small');
    } else if (sizeType === 'large') {
        canvas.classList.add('font-size-large');
    } else {
        canvas.classList.add('font-size-normal');
    }
    updatePageMetrics();
};

window.changeMargins = function(marginType) {
    const container = document.getElementById('cv-page-container');
    if (!container) return;

    container.classList.remove('margin-compact', 'margin-normal', 'margin-wide');
    if (marginType === 'compact') {
        container.classList.add('margin-compact');
    } else if (marginType === 'wide') {
        container.classList.add('margin-wide');
    } else {
        container.classList.add('margin-normal');
    }
    updatePageMetrics();
};

window.updatePageMetrics = function() {
    const container = document.getElementById('cv-page-container');
    const indicator = document.getElementById('page-count-indicator');
    if (!container) return;

    const pageHeightPx = 1123; 
    const currentHeight = container.scrollHeight;
    const estimatedPages = Math.max(1, Math.ceil(currentHeight / pageHeightPx));

    if (indicator) {
        indicator.innerText = `Páginas estimadas: ${estimatedPages} (${currentHeight}px)`;
    }
};

// ==========================================
// GESTIÓN DE IMAGEN DE PERFIL
// ==========================================

window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type === "image/jpeg" || file.type === "image/png") {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('img-preview');
                const span = document.getElementById('photo-text-preview');
                if (img && span) {
                    img.src = e.target.result;
                    img.style.display = 'block';
                    span.style.display = 'none';
                }
            }
            reader.readAsDataURL(file);
        } else {
            alert("Por favor selecciona una imagen válida en formato JPEG o PNG.");
        }
    }
};

// ==========================================
// EXPORTACIÓN A PDF (Blindado y con reordenamiento fluido)
// ==========================================

window.downloadPDF = function() {
    try {
        if (typeof html2pdf === 'undefined') {
            alert("La herramienta de exportación a PDF no se ha cargado correctamente. Revisa tu conexión a internet o la etiqueta de la librería en el HTML.");
            console.error("Error crítico: html2pdf no está definido en el objeto global.");
            return;
        }

        const originalElement = document.getElementById('cv-canvas');
        if (!originalElement) {
            alert("No se encontró el lienzo del currículum.");
            return;
        }

        const exportContainer = originalElement.cloneNode(true);

        const originalImg = originalElement.querySelector('#img-preview');
        const exportImg = exportContainer.querySelector('#img-preview');
        if (originalImg && exportImg && originalImg.src) {
            exportImg.src = originalImg.src;
            exportImg.style.display = originalImg.style.display;
            
            const exportSpan = exportContainer.querySelector('#photo-text-preview');
            if (exportSpan) exportSpan.style.display = 'none';
        }

        // ==========================================
        // ELIMINACIÓN DINÁMICA PROFUNDA DE ELEMENTOS VACÍOS (SIN HUECOS)
        // ==========================================
        
        // 1. Eliminar subtítulo u otros elementos de la cabecera si están vacíos
        const headerEditables = exportContainer.querySelectorAll('.info-group > .editable');
        headerEditables.forEach(el => {
            if (el.innerText.trim() === "") {
                el.remove();
            }
        });

        // 2. Eliminar elementos individuales de contacto vacíos y sus contenedores
        const contactItems = exportContainer.querySelectorAll('.contact-item-box');
        contactItems.forEach(item => {
            const spanEditable = item.querySelector('.editable');
            if (!spanEditable || spanEditable.innerText.trim() === "") {
                item.remove();
            }
        });

        // 3. Eliminar párrafos sueltos o contenedores internos de experiencia/educación que no tengan texto real
        const internalParagraphs = exportContainer.querySelectorAll('.experience-item p, .education-item p, .reference-item p, .personal-ref-item p');
        internalParagraphs.forEach(p => {
            const editables = p.querySelectorAll('.editable');
            let hasRealContent = false;
            editables.forEach(ed => {
                if (ed.innerText.trim() !== "") {
                    hasRealContent = true;
                }
            });
            // Si el párrafo no tiene ningún campo editable con texto real, se elimina por completo el <p>
            if (!hasRealContent) {
                p.remove();
            }
        });

        // 4. Eliminar ítems completos de listas si se quedaron sin párrafos o contenido válido
        const itemsAEliminar = exportContainer.querySelectorAll('.experience-item, .education-item, .skill-item, .reference-item, .personal-ref-item, .bullet-item');
        itemsAEliminar.forEach(item => {
            const editables = item.querySelectorAll('.editable');
            let isEmpty = true;
            editables.forEach(ed => {
                if (ed.innerText.trim() !== "") {
                    isEmpty = false;
                }
            });
            if (isEmpty) {
                item.remove();
            }
        });

        // 5. Eliminar bloques de secciones enteras si se quedaron sin elementos
        const bloquesSeccion = exportContainer.querySelectorAll('.draggable-block');
        bloquesSeccion.forEach(bloque => {
            const parrafoSobreMi = bloque.querySelector('p.editable');
            const h2Title = bloque.querySelector('h2');
            if (parrafoSobreMi && parrafoSobreMi.innerText.trim() === "" && h2Title && h2Title.innerText.toUpperCase().includes("SOBRE MÍ")) {
                bloque.remove();
                return;
            }

            const listContainer = bloque.querySelector('.experience-list, .education-list, .skill-list, .reference-list, .personal-ref-list');
            if (listContainer && listContainer.children.length === 0) {
                bloque.remove();
            }
        });

        // ==========================================

        // Eliminar botones y elementos de interfaz del PDF
        const elementosAEliminar = exportContainer.querySelectorAll('.add-btn, .remove-btn, .remove-section-btn, .drag-handle, .photo-input');
        elementosAEliminar.forEach(el => el.remove());

        const options = {
            margin:      [0, 0, 0, 0],
            filename:    'curriculum_ejecutivo.pdf',
            image:       { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 3,
                useCORS: true,
                letterRendering: true,
                scrollY: 0
            },
            jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(exportContainer).set(options).save().catch(function (err) {
            console.error("Error al generar el PDF:", err);
            alert("Ocurrió un error al intentar generar el documento PDF.");
        });

    } catch (e) {
        console.error("Excepción en downloadPDF:", e);
        alert("Ocurrió un error inesperado al intentar descargar el archivo.");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.downloadPDF();
        });
    }

    const canvas = document.getElementById('cv-canvas');
    if (canvas) {
        canvas.addEventListener('input', () => {
            window.updatePageMetrics();
        });
    }
});

// ==========================================
// VALIDACIONES Y MANIPULACIÓN DE SECCIONES
// ==========================================

window.formatPhoneInput = function(element) {
    let numbers = element.innerText.replace(/\D/g, '').substring(0, 10);
    let formatted = '';
    if (numbers.length > 0) {
        formatted = numbers.substring(0, 3);
    }
    if (numbers.length >= 4) {
        formatted += '-' + numbers.substring(3, 6);
    }
    if (numbers.length >= 7) {
        formatted += '-' + numbers.substring(6, 10);
    }
    
    if (element.innerText !== formatted) {
        element.innerText = formatted;
        document.execCommand('selectAll', false, null);
        window.getSelection().collapseToEnd();
    }
};

window.validateEmailInput = function(element) {
    let val = element.innerText.trim();
    if (val !== "" && !val.includes("@")) {
        alert("El correo electrónico debe contener un símbolo '@'.");
        element.style.borderColor = "#e53e3e";
    } else {
        element.style.borderColor = "";
    }
};

window.addExperience = function(btn) {
    const block = btn.closest('.draggable-block');
    if (!block) return;
    const list = block.querySelector('.experience-list');
    if (!list) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'experience-item';
    newItem.style.cssText = "position:relative; margin-bottom: 12px; border-left: 2px solid #2b6cb0; padding-left: 10px;";
    newItem.innerHTML = `
        <p style="margin: 0 0 2px 0;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de la Empresa]" style="font-size: 10pt; color: #1a365d;"></strong></p>
        <p style="margin: 0 0 4px 0;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre del Cargo o Puesto Ocupado]" style="font-size: 9.5pt; font-weight: bold; color: #4a5568;"></strong></p>
        <ul class="bullet-list" style="margin: 0; padding-left: 15px;">
            <li class="bullet-item" style="position:relative; margin-bottom: 3px; padding-right: 25px; font-size: 9pt; color: #2d3748;">
                <span class="editable" contenteditable="true" data-placeholder="Describe tu función o logro principal..." style="display:block;"></span>
                <button onclick="removeItem(this)" class="remove-btn" title="Eliminar viñeta">×</button>
            </li>
        </ul>
        <button onclick="addBullet(this)" class="add-btn" style="margin-top: 4px;">+ Añadir función/logro</button>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar experiencia completa" style="top: 0; right: 0;">×</button>
    `;
    list.appendChild(newItem);
    window.updatePageMetrics();
};

window.addBullet = function(btn) {
    const experienceItem = btn.closest('.experience-item');
    if (!experienceItem) return;
    const bulletList = experienceItem.querySelector('.bullet-list');
    if (!bulletList) return;
    
    const newLi = document.createElement('li');
    newLi.className = 'bullet-item';
    newLi.style.cssText = "position:relative; margin-bottom: 3px; padding-right: 25px; font-size: 9pt; color: #2d3748;";
    newLi.innerHTML = `
        <span class="editable" contenteditable="true" data-placeholder="Describe otra función o logro..." style="display:block;"></span>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar viñeta">×</button>
    `;
    bulletList.appendChild(newLi);
    window.updatePageMetrics();
};

window.addSkill = function(btn) {
    const block = btn.closest('.draggable-block');
    if (!block) return;
    const list = block.querySelector('.skill-list');
    if (!list) return;
    
    const newItem = document.createElement('li');
    newItem.className = 'skill-item';
    newItem.style.cssText = "position:relative; margin-bottom: 3px; padding-right: 25px; font-size: 9pt; color: #2d3748;";
    newItem.innerHTML = `
        <span class="editable" contenteditable="true" data-placeholder="[Nueva habilidad]" style="display:block;"></span>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar habilidad">×</button>
    `;
    list.appendChild(newItem);
    window.updatePageMetrics();
};

window.addEducation = function(btn) {
    const block = btn.closest('.draggable-block');
    if (!block) return;
    const list = block.querySelector('.education-list');
    if (!list) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'education-item';
    newItem.style.cssText = "position:relative; margin-bottom: 8px; padding-right: 25px;";
    newItem.innerHTML = `
        <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Título o Carrera]" style="font-weight: bold; color: #1a365d;"></strong> — <span class="editable" contenteditable="true" data-placeholder="[Institución]"></span></p>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar formación">×</button>
    `;
    list.appendChild(newItem);
    window.updatePageMetrics();
};

window.addReference = function(btn) {
    const block = btn.closest('.draggable-block');
    if (!block) return;
    const list = block.querySelector('.reference-list');
    if (!list) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'reference-item';
    newItem.style.cssText = "position:relative; margin-bottom: 8px; padding-right: 25px;";
    newItem.innerHTML = `
        <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de Referencia]" style="font-weight: bold; color: #1a365d;"></strong> – <span class="editable" contenteditable="true" data-placeholder="[Teléfono]"></span></p>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar referencia">×</button>
    `;
    list.appendChild(newItem);
    window.updatePageMetrics();
};

window.addPersonalReference = function(btn) {
    const block = btn.closest('.draggable-block');
    if (!block) return;
    const list = block.querySelector('.personal-ref-list');
    if (!list) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'personal-ref-item';
    newItem.style.cssText = "position:relative; margin-bottom: 8px; padding-right: 25px;";
    newItem.innerHTML = `
        <p style="margin: 0; font-size: 9.5pt; color: #2d3748;"><strong class="editable" contenteditable="true" data-placeholder="[Nombre de Referencia Personal]" style="font-weight: bold; color: #1a365d;"></strong> – <span class="editable" contenteditable="true" data-placeholder="[Teléfono]"></span></p>
        <button onclick="removeItem(this)" class="remove-btn" title="Eliminar referencia">×</button>
    `;
    list.appendChild(newItem);
    window.updatePageMetrics();
};

window.removeItem = function(btn) {
    const item = btn.parentElement;
    if (item) {
        item.remove();
        window.updatePageMetrics();
    }
};

window.removeSection = function(btn) {
    const block = btn.closest('.draggable-block');
    if (block) {
        block.remove();
        window.updatePageMetrics();
    }
};

// ==========================================
// DRAG AND DROP (Reordenar Secciones)
// ==========================================

function initDragAndDrop() {
    const container = document.getElementById('sortable-container');
    if (!container) return;

    let draggedItem = null;

    container.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('draggable-block')) {
            draggedItem = e.target;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });

    container.addEventListener('dragend', function(e) {
        if (e.target.classList.contains('draggable-block')) {
            e.target.classList.remove('dragging');
            draggedItem = null;
            window.updatePageMetrics();
        }
    });

    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetBlock = e.target.closest('.draggable-block');
        if (targetBlock && targetBlock !== draggedItem) {
            const rect = targetBlock.getBoundingClientRect();
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
            container.insertBefore(draggedItem, next ? targetBlock.nextSibling : targetBlock);
        }
    });
}