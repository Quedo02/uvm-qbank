export default function Skeleton({
  height = 16,
  width = '100%',
  radius = 10,
  className = '',
  style
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, borderRadius: radius, ...style }}
    />
  );
}
