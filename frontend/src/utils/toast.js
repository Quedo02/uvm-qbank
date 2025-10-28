// Inserta el contenedor si no existe
export const initToastContainer = () => {
  if (document.getElementById('uvmToast')) return;
  const html = `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1080">
      <div id="uvmToast" class="toast text-bg-light border-0" role="alert" data-bs-delay="2500">
        <div class="d-flex">
          <div class="toast-body">Mensaje</div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

export const showToast = (msg) => {
  initToastContainer();
  const el = document.getElementById('uvmToast');
  if (!el) return;
  el.querySelector('.toast-body').textContent = msg;

  // Usa Bootstrap si está disponible; si no, fallback sin romper
  const Toast = window.bootstrap?.Toast;
  if (Toast) {
    Toast.getOrCreateInstance(el).show();
  } else {
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
  }
};
