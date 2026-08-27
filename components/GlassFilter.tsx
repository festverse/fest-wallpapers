const EDGE_MAP =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><defs><radialGradient id="g" cx="50%" cy="50%" r="72%"><stop offset="0%" stop-color="#808080"/><stop offset="62%" stop-color="#808080"/><stop offset="100%" stop-color="#ffffff"/></radialGradient></defs><rect width="400" height="200" fill="url(#g)"/></svg>'
  );

export default function GlassFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="liquid-glass-filter" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feImage href={EDGE_MAP} preserveAspectRatio="none" result="edgeMap" />
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise" />
          <feComposite in="noise" in2="edgeMap" operator="arithmetic" k1="1.6" k2="0" k3="0" k4="0" result="edgeNoise" />
          <feGaussianBlur in="edgeNoise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="46" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
