import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
  `👋 Welcome to AegisBank AI Assistant

  I can help you with:

  💰 Check Account Balances

  📄 View Recent Transactions

  📊 Monthly Financial Summary

  💸 Spending Analysis

  🛡 Fraud & Security Status

  🎯 Savings Goal Progress

  💡 Personalized Financial Tips

  ❓ Banking FAQs

  Type your question below or choose one of the quick actions.`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Append user message
    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/ai/chatbot', { message: text });
      
      const botMsg = {
          sender: "bot",
          text: response.data.response || response.data.message,
          success: response.data.success,
          timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError('Connection disrupted. Unable to contact AI chatbot.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const suggestionChips = [
    "💰 Check Balance",
    "📄 Recent Transactions",
    "📊 Monthly Summary",
    "💸 Spending Analysis",
    "🛡 Security Status",
    "🎯 Savings Goal",
    "💡 Financial Tips",
    "❓ What is UPI?",
    "💸 Transfer ₹1000 to 1234567890",
    "💰 Budget suggestions",
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dark-900 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-brand-500" />
          <span>AI Financial Assistant</span>
        </h1>
        <p className="text-sm text-dark-500">
          Your intelligent banking assistant powered by AI. Get account information, transaction summaries, spending insights, financial advice, and answers to banking questions.
        </p>
      </div>

      {/* Main Conversation Box */}
      <div className="flex-1 glass-card border border-white/20 dark:border-dark-800/80 flex flex-col overflow-hidden p-0">
        
        {/* Messages Ledger */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3.5 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                msg.sender === 'user' 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-dark-100 dark:bg-dark-800 text-brand-500 dark:text-brand-400 border border-brand-500/10'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-none'
                  : 'bg-dark-100/70 dark:bg-dark-950/40 text-dark-800 dark:text-dark-100 border border-dark-200/50 dark:border-dark-800/50 rounded-tl-none'
              }`}>
                {/* Format newline strings nicely */}
                {msg.text.includes("Transfer Successful") ? (

                <div className="space-y-3">

                <div className="text-green-500 font-bold text-base">
                ✅ Transfer Successful
                </div>

                <div className="whitespace-pre-line text-sm">
                {msg.text.replace("✅ Transfer Successful", "")}
                </div>

                </div>

                ) : msg.text.includes("Please confirm") ? (

                <div className="space-y-3">

                <div className="text-yellow-500 font-bold">
                ⚠ Confirm Transfer
                </div>

                <div className="whitespace-pre-line text-sm">
                {msg.text}
                </div>

                </div>

                ) : (

                <p className="whitespace-pre-line">
                {msg.text}
                </p>

                )}
                <span className={`text-[10px] block mt-1.5 ${
                  msg.sender === 'user' ? 'text-brand-200 text-right' : 'text-dark-400'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-800 text-brand-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="py-3 px-4 rounded-2xl bg-dark-100/70 dark:bg-dark-950/40 border border-dark-200/50 dark:border-dark-800/50 rounded-tl-none flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-500 flex gap-2 max-w-sm mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-3 bg-dark-100/30 dark:bg-dark-950/20 border-t border-b border-dark-200/50 dark:border-dark-800/50 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-500 text-dark-600 dark:text-dark-300 transition duration-150 whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 flex gap-3 flex-shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            placeholder="Ask anything... e.g. 'Transfer ₹5000 to 1234567890', 'Show my balance', 'Recent transactions', 'Monthly summary', 'What is UPI?'"
            className="glass-input flex-1 pr-4 py-3"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            className="p-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-lg shadow-brand-500/25 transition duration-150"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
