/** Saját rajzolt illusztráció: egy tanterem hibás projektorral és egy beérkező értesítéssel (stock fotó helyett). */
export default function RoomScene() {
  return (
    <figure className="scene">
      <svg viewBox="0 0 480 420" role="img" aria-label="Rajzolt tanterem: a mennyezeti projektoron piros felkiáltójel, alul egy értesítés: Projektor, nem működik.">
        <defs>
          <linearGradient id="rs-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef5ff" />
            <stop offset="1" stopColor="#d9e7ff" />
          </linearGradient>
          <linearGradient id="rs-board" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f1f6ff" />
          </linearGradient>
        </defs>

        <rect width="480" height="420" rx="30" fill="url(#rs-wall)" />
        <path d="M0 310h480v80a30 30 0 0 1-30 30H30a30 30 0 0 1-30-30z" fill="#c4d6f4" />
        <rect y="304" width="480" height="8" fill="#a9c0ea" />

        {/* ablak */}
        <g>
          <rect x="356" y="64" width="92" height="124" rx="10" fill="#cfe3ff" stroke="#9db6e6" strokeWidth="3" />
          <path d="M402 64v124M356 126h92" stroke="#9db6e6" strokeWidth="3" />
          <path d="M366 180l24-46M410 180l28-52" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        </g>

        {/* tábla */}
        <g>
          <rect x="44" y="96" width="268" height="150" rx="12" fill="url(#rs-board)" stroke="#9db6e6" strokeWidth="3" />
          <rect x="68" y="122" width="120" height="10" rx="5" fill="#cfe0ff" />
          <rect x="68" y="146" width="190" height="8" rx="4" fill="#e1ebff" />
          <rect x="68" y="164" width="160" height="8" rx="4" fill="#e1ebff" />
          <rect x="68" y="182" width="176" height="8" rx="4" fill="#e1ebff" />
          <rect x="44" y="246" width="268" height="10" rx="5" fill="#9db6e6" />
        </g>

        {/* projektor a mennyezetről */}
        <g>
          <path d="M178 0v46" stroke="#64748b" strokeWidth="5" />
          <rect x="130" y="42" width="104" height="38" rx="12" fill="#fff" stroke="#94a3b8" strokeWidth="3" />
          <rect x="144" y="54" width="34" height="5" rx="2.5" fill="#cbd5e1" />
          <rect x="144" y="64" width="34" height="5" rx="2.5" fill="#cbd5e1" />
          <circle cx="204" cy="61" r="13" fill="#1e3a8a" />
          <circle cx="204" cy="61" r="7" fill="#3b82f6" />
          <circle cx="208" cy="57" r="2.5" fill="#fff" opacity=".8" />
          <g transform="translate(236 40)">
            <circle className="pulse" r="22" fill="none" stroke="#ef4444" strokeWidth="3" />
            <circle r="15" fill="#ef4444" stroke="#fff" strokeWidth="3" />
            <text y="6" textAnchor="middle" fontSize="19" fontWeight="900" fill="#fff" fontFamily="Inter, system-ui, sans-serif">!</text>
          </g>
        </g>

        {/* padok és székek */}
        <g>
          <rect x="52" y="292" width="104" height="14" rx="5" fill="#e9c28d" />
          <path d="M66 306v52M142 306v52" stroke="#8a6a3b" strokeWidth="6" strokeLinecap="round" />
          <rect x="74" y="338" width="60" height="12" rx="5" fill="#1d4ed8" />
          <path d="M82 350v26M126 350v26" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
          <rect x="70" y="316" width="10" height="34" rx="5" fill="#1d4ed8" />

          <rect x="188" y="292" width="104" height="14" rx="5" fill="#e9c28d" />
          <path d="M202 306v52M278 306v52" stroke="#8a6a3b" strokeWidth="6" strokeLinecap="round" />
          <rect x="210" y="338" width="60" height="12" rx="5" fill="#2563eb" />
          <path d="M218 350v26M262 350v26" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
          <rect x="206" y="316" width="10" height="34" rx="5" fill="#2563eb" />
        </g>

        {/* tanári asztal számítógéppel */}
        <g>
          <rect x="330" y="276" width="116" height="14" rx="5" fill="#d9ad6f" />
          <path d="M344 290v66M432 290v66" stroke="#8a6a3b" strokeWidth="6" strokeLinecap="round" />
          <rect x="360" y="222" width="58" height="42" rx="6" fill="#1e3a8a" />
          <rect x="365" y="227" width="48" height="30" rx="3" fill="#60a5fa" />
          <rect x="384" y="264" width="10" height="12" fill="#94a3b8" />
          <rect x="372" y="274" width="34" height="5" rx="2.5" fill="#94a3b8" />
        </g>

        {/* beérkező értesítés */}
        <g transform="translate(176 318)">
          <rect width="278" height="74" rx="18" fill="#172554" stroke="#60a5fa" strokeOpacity=".5" strokeWidth="2" />
          <circle cx="34" cy="37" r="17" fill="#ef4444" />
          <text x="34" y="44" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily="Inter, system-ui, sans-serif">!</text>
          <text x="64" y="32" fontSize="17" fontWeight="800" fill="#fff" fontFamily="Inter, system-ui, sans-serif">Projektor</text>
          <text x="64" y="54" fontSize="13.5" fontWeight="500" fill="#bfdbfe" fontFamily="Inter, system-ui, sans-serif">Nem működik · terem 104</text>
        </g>
      </svg>
    </figure>
  );
}
