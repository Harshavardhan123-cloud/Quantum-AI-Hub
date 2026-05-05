import React, { useRef, useEffect } from 'react';
import { Dialog, Box, Typography, Button, Fade } from '@mui/material';
import Chart from 'chart.js/auto';

const ZoomDialog = ({ open, onClose, chartData, title, type = "bar" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (open && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const hasY1 = chartData.datasets?.some(d => d.yAxisID === 'y1');
      
      chartInstance.current = new Chart(chartRef.current, {
        type,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: type === 'pie' || type === 'doughnut' || (chartData.datasets?.length > 1),
              labels: { color: '#ccc', font: { family: 'Fira Code' } },
            },
          },
          scales: type !== 'pie' && type !== 'doughnut' ? {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#888', font: { family: 'Fira Code', size: 14 } }
            },
            y1: hasY1 ? {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#888', font: { family: 'Fira Code', size: 14 } }
            } : undefined,
            x: {
              grid: { display: false },
              ticks: { color: '#888', font: { family: 'Fira Code', size: 14 } }
            }
          } : undefined
        },
      });
    }
  }, [open, chartData, type]);

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Fade}>
      <Box sx={{ p: 4, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#03030a' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontFamily: 'Orbitron', color: '#00f2ff' }}>
            {title}
          </Typography>
          <Button variant="outlined" color="primary" onClick={onClose}>
            Close
          </Button>
        </Box>
        <Box sx={{ flex: 1, bgcolor: '#000', p: 3, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <canvas ref={chartRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ZoomDialog;
