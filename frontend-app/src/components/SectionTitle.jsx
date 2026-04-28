import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionTitle = ({ icon, title, subtitle, color = "primary.main" }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontFamily: 'Orbitron', 
          fontWeight: 900, 
          color,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <span>{icon}</span> {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'grey.600', mt: 1, ml: 6 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionTitle;
