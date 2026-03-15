import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { api } from '../../utils/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your AI assistant. How can I help you find events?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What events am I attending this week?",
    "When is my next event?",
    "List all events I organize.",
    "Show public tech events this weekend.",
    "Who’s attending the Marketing Meetup?",
    "Where is the Design Sprint?"
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmedInput }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { messages: newMessages });
      setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Вибачте, сталася помилка під час зв\'язку з сервером.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 dark:bg-indigo-500 dark:hover:bg-indigo-400",
          isOpen ? "scale-0 opacity-0 duration-200" : "scale-100 opacity-100 duration-300 delay-100"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
      </button>

      {/* Overlay for mobile when open (optional, makes clicking outside close it on mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel (Left Side on Desktop, Full Screen on Mobile) */}
      <div
        className={clsx(
          "fixed bottom-0 top-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-slate-900",
          // Mobile: Full screen, sliding up or right. Desktop: Slide from right, fixed width.
          isOpen ? "right-0" : "-right-full sm:-right-[400px]",
          "w-full sm:w-[380px]"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-indigo-600 px-4 text-white dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <p className="text-xs text-indigo-200 dark:text-slate-400">Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  "flex w-max max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'user'
                    ? "self-end rounded-br-sm bg-indigo-600 text-white dark:bg-indigo-500"
                    : "self-start rounded-bl-sm bg-white border border-slate-200 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                )}
              >
                <span className="whitespace-pre-wrap leading-relaxed">{msg.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="self-start rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {!isLoading && (
          <div className="shrink-0 bg-slate-50 px-3 pb-2 pt-2 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSuggestionsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between mb-2"
            >
              <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Suggested Questions</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={clsx("text-slate-400 dark:text-slate-500 transition-transform duration-200", isSuggestionsOpen ? "rotate-180" : "rotate-0")}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            {isSuggestionsOpen && (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      // Focus the input to let them hit Enter or change it
                    }}
                    className="w-full text-left whitespace-normal rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute bottom-1 right-1 flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
          <div className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
            AI can make mistakes. Verify important info.
          </div>
        </div>
      </div>
    </>
  );
}
