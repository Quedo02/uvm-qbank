import { useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

// genera datos dummy reproducibles
function rng(seed=7) { let s=seed; return () => (s = (s*9301+49297)%233280)/233280; }

export default function Dashboard() {
  const r = useMemo(()=>rng(42),[]);
  const labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const preguntas = labels.map(()=>Math.floor(r()*80)+20);
  const aprobadas  = preguntas.map(v=>Math.floor(v*(0.5+0.2*r())));
  const exPublicados = labels.map(()=>Math.floor(r()*6)+1);
  const tasaAprob = labels.map(()=>Math.round((0.5+0.4*r())*100));

  const barData = { labels, datasets:[{ label:'Preguntas creadas', data: preguntas }]};
  const lineData = { labels, datasets:[{ label:'Exámenes publicados', data: exPublicados }]};
  const doughData = {
    labels:['Aprobadas','Pendientes','Rechazadas'],
    datasets:[{ data:[aprobadas.at(-1), preguntas.at(-1)-aprobadas.at(-1)-5, 5] }]
  };

  const kpiCards = [
    { label:'Preguntas totales', value: preguntas.reduce((a,b)=>a+b,0) },
    { label:'Aprobadas (último mes)', value: aprobadas.at(-1) },
    { label:'Exámenes activos', value: exPublicados.at(-1) },
    { label:'Tasa aprobación % (último mes)', value: tasaAprob.at(-1) }
  ];

  return (
    <div className="container-fluid" style={{display:'grid', gap:16}}>
      <h2 className="mb-2">Dashboard</h2>

      <div className="row g-3">
        {kpiCards.map((k,i)=>(
          <div key={i} className="col-6 col-lg-3">
            <div className="card p-3 shadow-sm">
              <div className="text-muted small">{k.label}</div>
              <div className="fs-3 fw-bold">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-2">Preguntas por mes</h6>
            <Bar data={barData} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-2">Exámenes publicados</h6>
            <Line data={lineData} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-2">Estado preguntas (último mes)</h6>
            <Doughnut data={doughData} />
          </div>
        </div>
      </div>
    </div>
  );
}
