import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button.jsx";

export default function Modal({
  open = false,
  title = "",
  onClose = () => {},
  size = "md",
  centered = true,
  scrollable = false,
  staticBackdrop = false,
  keyboard = true,
  footer = null,
  children,
}) {
  const modalRef = useRef(null);
  const bsInstanceRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Mantén siempre la última versión de onClose SIN disparar reinstanciación
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Crear instancia una sola vez
  useEffect(() => {
    if (!modalRef.current) return;
    const el = modalRef.current;

    bsInstanceRef.current = new window.bootstrap.Modal(el, {
      backdrop: staticBackdrop ? "static" : true,
      keyboard,
      focus: true,
    });

    const handleHidden = () => onCloseRef.current?.();
    el.addEventListener("hidden.bs.modal", handleHidden);

    return () => {
      el.removeEventListener("hidden.bs.modal", handleHidden);
      bsInstanceRef.current?.dispose();
      bsInstanceRef.current = null;
    };
    // ⬇️ IMPORTANTE: no dependas de onClose/staticBackdrop/keyboard para no reinstanciar
  }, []);

  // Mostrar/Ocultar según `open`
  useEffect(() => {
    const inst = bsInstanceRef.current;
    if (!inst) return;
    if (open) inst.show();
    else inst.hide();
  }, [open]);

  if (typeof document === "undefined") return null;

  const dialogClass = [
    "modal-dialog",
    size === "sm" && "modal-sm",
    size === "lg" && "modal-lg",
    size === "xl" && "modal-xl",
    centered && "modal-dialog-centered",
    scrollable && "modal-dialog-scrollable",
  ]
    .filter(Boolean)
    .join(" ");

  const modalMarkup = (
    <div className="modal fade" tabIndex="-1" aria-hidden={!open} ref={modalRef}>
      <div className={dialogClass} role="document">
        <div className="modal-content">
          {(title || onClose) && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => bsInstanceRef.current?.hide()}
              />
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}

/* Modal de confirmación rápido */
export function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Seguro que quieres continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  onConfirm = () => {},
  onClose = () => {},
  size = "sm",
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size={size}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "Procesando..." : confirmText}
          </Button>
        </div>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
}
