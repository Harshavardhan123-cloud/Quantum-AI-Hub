import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  CircularProgress,
  Paper,
  Fade,
  Backdrop
} from '@mui/material';
import { Sparkles, X, Terminal, ArrowRight, BookOpen, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SimulationExplainer = ({ simulationType, resultData, context = "" }) => {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    setOpen(true);
    if (explanation) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulation_type: simulationType,
          result_data: resultData,
          context: context
        })
      });
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      setExplanation("Failed to generate research insight. Please ensure the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="outlined"
          startIcon={<BrainCircuit size={18} />}
          onClick={fetchExplanation}
          sx={{
            mt: 2,
            mb: 1,
            borderRadius: '12px',
            textTransform: 'none',
            fontFamily: 'Orbitron',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#00f2ff',
            borderColor: 'rgba(0, 242, 255, 0.3)',
            background: 'rgba(0, 242, 255, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#00f2ff',
              background: 'rgba(0, 242, 255, 0.15)',
              boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)',
            }
          }}
        >
          AI Research Insight
        </Button>
      </motion.div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            bgcolor: 'rgba(10, 15, 25, 0.95)',
            backgroundImage: 'none',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: '80vh'
          }
        }}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            sx: { backdropFilter: 'blur(8px)', bgcolor: 'rgba(0,0,0,0.7)' }
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: '12px', 
            bgcolor: 'rgba(0, 242, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} color="#00f2ff" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Orbitron', fontWeight: 900, color: '#fff', fontSize: '1.1rem' }}>
              Research Analysis
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {simulationType} • AI Oracle 
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <CircularProgress size={60} thickness={2} sx={{ color: '#00f2ff' }} />
              <Typography sx={{ mt: 3, color: 'rgba(255,255,255,0.6)', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>
                Decrypting Quantum Signatures...
              </Typography>
            </Box>
          ) : (
            <Fade in={!loading}>
              <Box>
                <Box sx={{ 
                  mb: 4, 
                  p: 2, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2
                }}>
                  <Terminal size={18} color="rgba(255,255,255,0.4)" style={{ marginTop: 4 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      Raw Simulation Data Log
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Fira Code, monospace', color: 'rgba(0, 242, 255, 0.8)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {JSON.stringify(resultData)}
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  lineHeight: 1.8, 
                  fontSize: '1rem',
                  fontWeight: 400,
                  whiteSpace: 'pre-wrap'
                }}>
                  {explanation}
                </Typography>
              </Box>
            </Fade>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              color: 'rgba(255,255,255,0.5)', 
              '&:hover': { color: '#fff', bgcolor: 'transparent' },
              textTransform: 'none',
              fontFamily: 'Orbitron'
            }}
          >
            Close Analysis
          </Button>
          <Button 
            variant="contained" 
            endIcon={<ArrowRight size={18} />}
            onClick={() => setOpen(false)}
            sx={{ 
              bgcolor: '#00f2ff', 
              color: '#000', 
              px: 3,
              borderRadius: '10px',
              fontWeight: 900,
              fontFamily: 'Orbitron',
              '&:hover': { bgcolor: '#00d8e4' }
            }}
          >
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SimulationExplainer;
