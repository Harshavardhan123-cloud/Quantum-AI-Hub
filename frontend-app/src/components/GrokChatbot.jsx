import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, IconButton, Fade, CircularProgress, Chip } from '@mui/material';
import { Send, X, Bot, Sparkles, MessageSquare, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GrokChatbot = ({ currentPage = 'general' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          page: currentPage
        })
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Temporal rift detected. Connection lost. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #03030a, #1a1a2e)',
            border: '2px solid rgba(0, 242, 255, 0.3)',
            boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)',
            color: 'primary.main',
            '&:hover': {
              background: 'linear-gradient(135deg, #03030a, #1a1a2e)',
              borderColor: 'primary.main',
              boxShadow: '0 0 40px rgba(0, 242, 255, 0.4)',
            }
          }}
        >
          {isOpen ? <X size={28} /> : <BrainCircuit size={28} />}
        </IconButton>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <Paper
              sx={{
                position: 'absolute',
                bottom: 80,
                right: 0,
                width: { xs: 'calc(100vw - 48px)', sm: 400 },
                height: 580,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(8, 8, 20, 0.95)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(0, 242, 255, 0.2)',
                boxShadow: '0 20px 80px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Header */}
              <Box 
                sx={{ 
                  p: 2.5, 
                  background: 'linear-gradient(90deg, rgba(0, 242, 255, 0.1), rgba(168, 85, 247, 0.1))',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: 'rgba(0, 242, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BrainCircuit size={22} color="#00f2ff" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: '0.8rem', color: '#00f2ff', letterSpacing: 1 }}>
                    QUANTUM ORACLE
                  </Typography>
                </Box>
                <Chip 
                  label="LIVE" 
                  size="small" 
                  sx={{ 
                    height: 18, 
                    fontSize: '0.6rem', 
                    fontWeight: 900, 
                    bgcolor: 'rgba(52, 211, 153, 0.1)', 
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.2)'
                  }} 
                />
              </Box>

              {/* Messages Area */}
              <Box 
                sx={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
              >
                {messages.length === 0 && (
                  <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.5 }}>
                    <MessageSquare size={48} color="#00f2ff" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <Typography variant="body2" sx={{ color: 'grey.500', maxWidth: 240, mx: 'auto' }}>
                      Initialized and ready for quantum queries. How can I assist your research today?
                    </Typography>
                  </Box>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '85%',
                          bgcolor: m.role === 'user' ? 'rgba(0, 242, 255, 0.08)' : 'rgba(168, 85, 247, 0.05)',
                          border: m.role === 'user' ? '1px solid rgba(0, 242, 255, 0.2)' : '1px solid rgba(168, 85, 247, 0.15)',
                          borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.85rem', 
                            lineHeight: 1.6, 
                            color: m.role === 'user' ? '#e0e0e0' : '#d1d1d1',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {m.content}
                        </Typography>
                      </Paper>
                    </Box>
                  </motion.div>
                ))}

                {isLoading && (
                  <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a855f7' }} /></motion.div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a855f7' }} /></motion.div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a855f7' }} /></motion.div>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.2)' }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Inquire the Oracle..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    autoComplete="off"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        '& fieldset': { borderColor: 'rgba(0, 242, 255, 0.15)' },
                        '&:hover fieldset': { borderColor: 'rgba(0, 242, 255, 0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#00f2ff', borderWidth: 1 }
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: '#000',
                      borderRadius: '12px',
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: '#00d8e6' },
                      '&.Mui-disabled': { bgcolor: 'rgba(0, 242, 255, 0.1)', color: 'rgba(0,0,0,0.3)' }
                    }}
                  >
                    <Send size={18} />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default GrokChatbot;
