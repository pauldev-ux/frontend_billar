// src/components/MesaTimer.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function MesaTimer({
  inicio,
  pausado = false,
  pausaInicio = null,
  pausaAcumuladaSeg = 0,
}) {
  const [segundos, setSegundos] = useState(0);
  const intervalRef = useRef(null);

  const inicioDate = useMemo(() => (inicio ? new Date(inicio) : null), [inicio]);
  const pausaInicioDate = useMemo(
    () => (pausaInicio ? new Date(pausaInicio) : null),
    [pausaInicio]
  );

  const nowSec = () => Math.floor(Date.now() / 1000);

  const calcEfectivos = () => {
    if (!inicioDate) return 0;

    const ahora = new Date();
    const total = Math.floor((ahora - inicioDate) / 1000);

    let pausaTotal = Number(pausaAcumuladaSeg || 0);

    // si está pausado, esta pausa en curso también “cuenta como pausa”
    if (pausado && pausaInicioDate) {
      pausaTotal += Math.floor((ahora - pausaInicioDate) / 1000);
    }

    const efectivos = total - pausaTotal;
    return efectivos > 0 ? efectivos : 0;
  };

  const calcCongelado = () => {
    if (!inicioDate) return 0;
    if (!pausado || !pausaInicioDate) return calcEfectivos();

    // tiempo total transcurrido hasta el momento exacto de pausar
    const totalHastaPausa = Math.floor((pausaInicioDate - inicioDate) / 1000);

    // 💡 Robustez:
    // Algunas veces pausa_acumulada_seg puede venir:
    // A) solo pausas anteriores (lo normal en tu backend)
    // B) pausas anteriores + lo que lleva la pausa actual
    //
    // Detectamos eso comparando "pausa en curso" vs pausa_acumulada_seg
    const pausaEnCurso = Math.max(
      0,
      nowSec() - Math.floor(pausaInicioDate.getTime() / 1000)
    );

    let pausaAntesDeEsta;
    const acumulada = Number(pausaAcumuladaSeg || 0);

    if (acumulada >= pausaEnCurso) {
      // Caso B: acumulada incluye la pausa actual -> la quitamos
      pausaAntesDeEsta = acumulada - pausaEnCurso;
    } else {
      // Caso A: acumulada NO incluye la pausa actual
      pausaAntesDeEsta = acumulada;
    }

    const efectivos = totalHastaPausa - pausaAntesDeEsta;
    return efectivos > 0 ? efectivos : 0;
  };

  // set inicial correcto (importante para recargas)
  useEffect(() => {
    if (!inicioDate) {
      setSegundos(0);
      return;
    }
    setSegundos(pausado ? calcCongelado() : calcEfectivos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicioDate, pausado, pausaInicioDate, pausaAcumuladaSeg]);

  // intervalo: solo corre si NO está pausado
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (!inicioDate) return;

    if (pausado) {
      // congelado
      setSegundos(calcCongelado());
      return;
    }

    intervalRef.current = setInterval(() => {
      setSegundos(calcEfectivos());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicioDate, pausado, pausaInicioDate, pausaAcumuladaSeg]);

  const formato = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <span className={pausado ? "text-gray-600 font-bold" : "text-gray-900 font-bold"}>
      {formato(segundos)}
    </span>
  );
}
