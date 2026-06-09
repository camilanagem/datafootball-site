// Sparkle de 4 pontas — mesmo motivo da logo do Instagram (@datafootball__).
// Usa currentColor, então herda a cor do texto. O detalhe halftone da logo só
// aparece em tamanho grande; aqui (header/hero) a estrela sólida já remete à marca.
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 0 C53.5 33 67 46.5 100 50 C67 53.5 53.5 67 50 100 C46.5 67 33 53.5 0 50 C33 46.5 46.5 33 50 0 Z" />
    </svg>
  );
}
