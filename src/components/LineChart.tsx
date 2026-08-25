export function LineChart() {
  const points = "8,36 72,30 138,42 204,50 270,64 336,58";
  return (
    <svg className="line-chart" viewBox="0 0 344 96" role="img" aria-label="Gráfico de evolução de peso">
      <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16A34A" stopOpacity=".24"/><stop offset="1" stopColor="#16A34A" stopOpacity="0"/></linearGradient></defs>
      {[20,40,60,80].map((y) => <line key={y} x1="0" x2="344" y1={y} y2={y} stroke="#D8E0E6" strokeDasharray="4 5" />)}
      <polygon points={`${points} 336,90 8,90`} fill="url(#fill)" />
      <polyline points={points} fill="none" stroke="#087B43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="336" cy="58" r="5" fill="#087B43" stroke="white" strokeWidth="2" />
    </svg>
  );
}
