import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, Filter, Clock, Database } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import { motion } from 'framer-motion';

const HistoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/logs')
      .then(r => r.json())
      .then(setLogs)
      .catch(err => console.error("Failed to fetch logs:", err));
  }, []);

  const typeColor = {
    quantum: '#00f2ff',
    hebbian: '#a855f7',
    hebbian_batch: '#a855f7',
    physics: '#fbbf24',
    mechanics: '#34d399',
    qml: '#06b6d4',
    qdl: '#f97316',
    qllm: '#f472b6'
  };

  const filteredLogs = logs.filter(l => {
    const matchesFilter = filter === 'all' || l.type.startsWith(filter);
    const matchesSearch = l.description.toLowerCase().includes(search.toLowerCase()) || 
                         l.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Box>
      <SectionTitle icon="📜" title="Research Audit Logs" subtitle="Chronological record of every simulation and quantum operation executed" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={{ p: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['all', 'quantum', 'hebbian', 'physics', 'mechanics', 'qml', 'qdl', 'qllm'].map(f => (
              <Chip 
                key={f} 
                label={f.toUpperCase()} 
                size="small" 
                onClick={() => setFilter(f)} 
                sx={{ 
                  bgcolor: filter === f ? 'primary.main' : 'rgba(255, 255, 255, 0.05)', 
                  color: filter === f ? '#000' : '#888', 
                  cursor: 'pointer',
                  fontWeight: filter === f ? 800 : 500,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: filter === f ? 'primary.main' : 'rgba(255, 255, 255, 0.1)' }
                }} 
              />
            ))}
          </Box>
          
          <TextField
            size="small"
            placeholder="Search simulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#666" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: '100%', md: 300 },
              '& .MuiOutlinedInput-root': { borderRadius: '20px' }
            }}
          />
        </Paper>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: 'primary.main', fontWeight: 900, py: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Clock size={14} /> TIME</Box></TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 900 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Filter size={14} /> MODULE</Box></TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 900 }}>DESCRIPTION</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 900 }} align="right"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}><Database size={14} /> RESULT DATA</Box></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((l, i) => (
                <TableRow 
                  key={l.id || i} 
                  sx={{ 
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ color: 'grey.600', fontSize: '0.75rem' }}>
                    {new Date(l.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={l.type.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: `${typeColor[l.type] || '#555'}22`, 
                        color: typeColor[l.type] || '#fff', 
                        fontSize: '0.65rem', 
                        fontWeight: 900,
                        border: `1px solid ${typeColor[l.type] || '#555'}44`
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {l.description}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontFamily: 'Fira Code', 
                      fontSize: '0.65rem', 
                      color: 'grey.700', 
                      maxWidth: 300, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {JSON.stringify(l.result_data)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
          
          {filteredLogs.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography sx={{ color: 'grey.800', fontStyle: 'italic' }}>
                No records found in the neural archives.
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default HistoryLogs;
