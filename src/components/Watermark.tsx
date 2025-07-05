interface WatermarkProps {
  variant?: 'light' | 'dark';
}

export default function Watermark({ variant = 'light' }: WatermarkProps) {
  const colorClass = variant === 'light' 
    ? 'text-gray-400 hover:text-gray-600' 
    : 'text-white/30 hover:text-white/60';

  return (
    <div className="fixed top-2 right-2 z-[9999]">
      <a 
        href="https://marciliortiz.dev.br" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-flex items-center text-xs ${colorClass} hover:scale-105 transition-all duration-300`}
      >
        <span className="font-light drop-shadow-sm mr-1">
          Desenvolvido por Marcilio Ortiz
        </span>
      </a>
    </div>
  );
} 