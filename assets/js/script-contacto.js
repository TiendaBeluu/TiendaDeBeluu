/* =============================================
   TIENDA DE BELU — CONTACTO
   Formulario → WhatsApp + mensaje de éxito
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── Número de WhatsApp de la tienda ──
  // Formato internacional sin +, sin espacios
  // Ejemplo Paraguay: 595981234567
  const WA_NUMBER = '595992863948'; // <-- reemplazá con el número real

  // ============================================
  // SCROLL FADE-IN — secciones de contacto
  // ============================================
  const ctFades = document.querySelectorAll('.ct-fade-up');
  if (ctFades.length > 0) {
    const ctObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ct-visible');
          ctObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    ctFades.forEach(function (el) { ctObserver.observe(el); });
  }

  // ============================================
  // FORMULARIO → WHATSAPP
  // ============================================
  const form     = document.getElementById('ctContactForm');
  const btnSend  = form ? form.querySelector('.ct-btn-send') : null;

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // — Validación básica —
    const nombre  = document.getElementById('ctNombre');
    const email   = document.getElementById('ctEmail');
    const mensaje = document.getElementById('ctMensaje');

    clearErrors();

    let valid = true;
    if (!nombre.value.trim())  { showError(nombre,  'Ingresá tu nombre');         valid = false; }
    if (!email.value.trim())   { showError(email,   'Ingresá tu email');           valid = false; }
    else if (!isValidEmail(email.value)) { showError(email, 'Email no válido');    valid = false; }
    if (!mensaje.value.trim()) { showError(mensaje, 'Escribí tu mensaje');         valid = false; }

    if (!valid) return;

    // — Armar texto del mensaje para WhatsApp —
    const texto = [
      '👋 *Consulta desde la web de Tienda de Belu*',
      '',
      `*Nombre:* ${nombre.value.trim()}`,
      `*Email:* ${email.value.trim()}`,
      '',
      `*Mensaje:*`,
      mensaje.value.trim()
    ].join('\n');

    // — Estado de carga en el botón —
    btnSend.disabled = true;
    btnSend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abriendo WhatsApp…';

    // — Abrir WhatsApp —
    const waURL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(waURL, '_blank');

    // — Mostrar mensaje de éxito —
    setTimeout(function () {
      showSuccess();
      form.reset();
      btnSend.disabled = false;
      btnSend.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar mensaje';
    }, 800);
  });

  // ============================================
  // HELPERS
  // ============================================

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showError(input, msg) {
    input.classList.add('ct-input--error');
    const err = document.createElement('span');
    err.className   = 'ct-field-error';
    err.textContent = msg;
    input.parentNode.appendChild(err);
  }

  function clearErrors() {
    form.querySelectorAll('.ct-input--error').forEach(el => el.classList.remove('ct-input--error'));
    form.querySelectorAll('.ct-field-error').forEach(el => el.remove());
  }

  function showSuccess() {
    // Ocultar el formulario con fade
    const wrap = document.querySelector('.ct-form-wrap');
    if (!wrap) return;

    wrap.style.transition = 'opacity 0.4s ease';
    wrap.style.opacity    = '0';

    setTimeout(function () {
      wrap.innerHTML = `
        <div class="ct-success">
          <div class="ct-success__icon">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <h3 class="ct-success__title">¡Listo! Ya abrimos WhatsApp</h3>
          <p class="ct-success__text">
            Tu mensaje está listo para enviarse. Solo tocá <strong>Enviar</strong>
            en WhatsApp y te respondemos a la brevedad. 💬
          </p>
          <button class="ct-success__back" onclick="location.reload()">
            <i class="fa-solid fa-arrow-left"></i> Volver al formulario
          </button>
        </div>
      `;
      wrap.style.opacity = '1';
    }, 400);
  }

});