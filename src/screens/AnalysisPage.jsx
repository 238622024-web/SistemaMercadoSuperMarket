import React, { useEffect, useMemo, useRef, useState } from 'react';
import AnalysisMarkup from './analise.jsx';

const categories = [
  { name: 'Mercearia', value: 38, color: '' },
  { name: 'Bebidas', value: 24, color: 'orange' },
  { name: 'Hortifruti', value: 18, color: 'blue' },
  { name: 'Açougue', value: 12, color: 'red' },
  { name: 'Limpeza', value: 8, color: '' }
];

const bestSellers = [
  ['Arroz Tipo 1 5kg', '342 unidades vendidas', 'R$ 8.892'],
  ['Refrigerante Cola 2L', '286 unidades vendidas', 'R$ 5.434'],
  ['Leite Integral 1L', '274 unidades vendidas', 'R$ 1.918'],
  ['Cerveja Lata 350ml', '248 unidades vendidas', 'R$ 1.736'],
  ['Cafe Torrado 500g', '193 unidades vendidas', 'R$ 3.377']
];

const dailyRevenue = Array.from({ length: 90 }, (_, index) => {
  const weekly = [0.84, 0.91, 0.98, 1.03, 1.12, 1.28, 1.19][index % 7];
  const trend = 0.86 + (index / 90) * 0.22;
  return Math.round((2100 + ((index * 173) % 980)) * weekly * trend);
});

const wholeCurrency = (value) => value.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
});

export default function AnalysisPage() {
  const [period, setPeriod] = useState(30);
  const canvas = useRef(null);
  const values = useMemo(() => dailyRevenue.slice(-period), [period]);
  const revenue = useMemo(() => values.reduce((total, value) => total + value, 0), [values]);
  const sales = Math.round(revenue / (period === 7 ? 64 : period === 30 ? 66 : 68));

  useEffect(() => {
    const element = canvas.current;
    if (!element) return undefined;
    const draw = () => {
      const context = element.getContext('2d');
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!context || !width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      element.width = width * ratio;
      element.height = height * ratio;
      context.scale(ratio, ratio);
      context.clearRect(0, 0, width, height);
      const padding = { top: 12, right: 10, bottom: 28, left: 46 };
      const plotWidth = width - padding.left - padding.right;
      const plotHeight = height - padding.top - padding.bottom;
      const maximum = Math.ceil(Math.max(...values) / 1000) * 1000;
      const minimum = Math.floor(Math.min(...values) / 1000) * 1000;
      const range = maximum - minimum || 1;

      context.font = '11px Inter, sans-serif';
      context.strokeStyle = '#e2e8f0';
      context.fillStyle = '#94a3b8';
      context.lineWidth = 1;
      for (let line = 0; line <= 3; line += 1) {
        const y = padding.top + (plotHeight / 3) * line;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();
        context.fillText(wholeCurrency(maximum - (range / 3) * line), 0, y + 4);
      }

      const points = values.map((value, index) => ({
        x: padding.left + (plotWidth / Math.max(values.length - 1, 1)) * index,
        y: padding.top + plotHeight - ((value - minimum) / range) * plotHeight
      }));
      const gradient = context.createLinearGradient(0, padding.top, 0, height);
      gradient.addColorStop(0, 'rgba(15, 118, 110, .24)');
      gradient.addColorStop(1, 'rgba(15, 118, 110, 0)');
      context.beginPath();
      context.moveTo(points[0].x, height - padding.bottom);
      points.forEach((point) => context.lineTo(point.x, point.y));
      context.lineTo(points.at(-1).x, height - padding.bottom);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.strokeStyle = '#0f766e';
      context.lineWidth = 2.5;
      context.stroke();
      context.fillStyle = '#64748b';
      context.textAlign = 'center';
      [0, Math.floor(values.length / 2), values.length - 1].forEach((index) => {
        context.fillText(`D${index + 1}`, points[index].x, height - 8);
      });
      context.textAlign = 'start';
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [values]);

  const categoryRows = categories.map((item) => (
    <div className="category-row" key={item.name}>
      <div className="category-label"><span>{item.name}</span><span>{item.value}%</span></div>
      <div className="progress-track"><div className={`progress-value ${item.color}`} style={{ width: `${item.value}%` }} /></div>
    </div>
  ));

  const productRows = bestSellers.map((product, index) => (
    <div className="product-row" key={product[0]}>
      <span className="product-rank">{index + 1}</span>
      <div><div className="product-name">{product[0]}</div><div className="product-detail">{product[1]}</div></div>
      <span className="product-total">{product[2]}</span>
    </div>
  ));

  const exportReport = () => {
    const csv = `Indicador;Valor\nFaturamento;${wholeCurrency(revenue)}\nVendas;${sales.toLocaleString('pt-BR')}\nTicket medio;${(revenue / sales).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\nMargem bruta;${(27.2 + period / 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analise-mercado.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnalysisMarkup
      period={period}
      onPeriodChange={(event) => setPeriod(Number(event.target.value))}
      chartRef={canvas}
      revenue={wholeCurrency(revenue)}
      sales={sales.toLocaleString('pt-BR')}
      ticket={(revenue / sales).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      margin={`${(27.2 + period / 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
      categories={categoryRows}
      topProducts={productRows}
      onExport={exportReport}
    />
  );
}
