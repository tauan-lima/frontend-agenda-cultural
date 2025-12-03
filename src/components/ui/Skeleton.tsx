import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = ({ width = '100%', height = '20px', className = '' }: SkeletonProps) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

