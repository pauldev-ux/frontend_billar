import { useEffect, useState } from "react";

export default function MesaTimer({ inicio }) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!inicio) return;

    const inicioDate = new Date(inicio); // soporta ISO directo

    const interval = setInterval(() => {
      const ahora = new Date();
      const diff = Math.floor((ahora - inicioDate) / 1000);
      setSegundos(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio]);

  const formato = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return <span>{formato(segundos)}</span>;
}
