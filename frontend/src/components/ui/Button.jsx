// components/ui/Button.jsx
export default function Button({
  children,
  variant = 'primary',   // primary | secondary | danger | outline
  size = 'md',           // sm | md | lg
  full = false,          // w-100
  className = '',
  ...props
}) {
  const variants = {
    primary:  'btn btn-primary',
    secondary:'btn btn-secondary',
    danger:   'btn btn-danger',
    outline:  'btn btn-outline-primary',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const classes = [
    variants[variant] ?? 'btn',
    sizes[size] ?? '',
    full ? 'w-100' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
