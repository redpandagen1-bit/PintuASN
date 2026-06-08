interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function AppIcon({ name, size = 48, className }: AppIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  );
}