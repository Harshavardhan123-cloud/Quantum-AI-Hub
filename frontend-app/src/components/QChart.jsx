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
      
      chartInstance.current = new Chart(chartRef.current, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: type === 'pie' || type === 'doughnut',
              labels: { color: '#ccc' }
            }
          },
          scales: type !== 'pie' && type !== 'doughnut' ? {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#888', font: { size: 12, family: 'Fira Code' } }
            },
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
      <canvas ref={chartRef}></canvas>
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
