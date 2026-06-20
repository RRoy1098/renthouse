import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../api/axios';

export function AiChatWidget({listingId}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI assistant. Ask me anything about renting, listings, or how the platform works!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasStreamingMsg = messages.some((m) => m.streaming);

  const conversationHistory = messages
    .filter((m) => m.role !== 'system')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'assistant', text: '', streaming: true }]);

    try {
      const token = localStorage.getItem('tenantToken');
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory,
          listingId: id || undefined,
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.streaming) {
                    last.text = data.fullText || last.text;
                    last.streaming = false;
                  }
                  return updated;
                });
              } else if (data.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.streaming) {
                    last.text += data.text;
                  }
                  return [...updated];
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.streaming) {
          last.text = 'Sorry, I\'m not available right now. Please try again later.';
          last.streaming = false;
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="AI Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-border overflow-hidden flex flex-col">
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-xs text-primary-200">Ask me anything about renting</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] bg-primary-500 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96 bg-surface-secondary">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-muted-dark border border-border rounded-bl-md'}`}>
                  {msg.streaming ? (
                    msg.text ? msg.text : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )
                  ) : msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about listings, policies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default AiChatWidget;
