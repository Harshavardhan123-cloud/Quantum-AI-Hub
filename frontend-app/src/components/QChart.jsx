import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import Chart from 'chart.js/auto';
import ZoomDialog from './ZoomDialog';
import { Maximize2 } from 'lucide-react';

const QChart = ({ data, type = "bar", title, height = 250 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const hasY1 = data.datasets?.some(d => d.yAxisID === 'y1');
      
      chartInstance.current = new Chart(chartRef.current, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 750, easing: 'easeInOutQuart' },
          plugins: {
            legend: {
              display: type === 'pie' || type === 'doughnut' || (data.datasets?.length > 1),
              position: 'top',
              labels: { 
                color: '#aaa', 
                font: { size: 11, family: 'Fira Code', weight: 'bold' },
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleFont: { family: 'Orbitron' },
              bodyFont: { family: 'Fira Code' },
              padding: 12,
              borderColor: 'rgba(0,242,255,0.3)',
              borderWidth: 1
            }
          },
          scales: type !== 'pie' && type !== 'doughnut' ? {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#888', font: { size: 12, family: 'Fira Code' } },
              beginAtZero: true
            },
            y1: hasY1 ? {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#888', font: { size: 12, family: 'Fira Code' } }
            } : undefined,
            x: {
              grid: { display: false },
              ticks: { color: '#888', font: { size: 11, family: 'Fira Code' } }
            }
          } : undefined
        }
      });
    }
  }, [data, type]);

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <canvas ref={chartRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
      <IconButton 
        size="small" 
        sx={{ 
          position: 'absolute', 
          top: 4, 
          right: 4, 
          bgcolor: 'rgba(0,0,0,0.4)', 
          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
          zIndex: 1
        }} 
        onClick={() => setIsZoomOpen(true)}
      >
        <Maximize2 size={14} color="#00f2ff" />
      </IconButton>
      <ZoomDialog 
        open={isZoomOpen} 
        onClose={() => setIsZoomOpen(false)} 
        chartData={data} 
        title={title || "Simulation Analysis"} 
        type={type} 
      />
    </Box>
  );
};

export default QChart;
