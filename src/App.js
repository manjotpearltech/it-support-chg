import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { useStreamingChat } from './hooks/useStreamingChat';
import { usePDFViewer } from './hooks/usePDFViewer';
import { useResizable } from './hooks/useResizable';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import ScrollToBottom from './components/ScrollToBottom';
import PDFViewerPanel from './components/PDFViewerPanel';
import ResizableDivider from './components/ResizableDivider';

function App() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Use streaming chat hook
  const { messages, sendMessage, isStreaming, cancelStreaming, clearMessages, error } = useStreamingChat();

  // Use PDF viewer hook
  const { isOpen: isPDFOpen, currentPDF, openPDF, closePDF } = usePDFViewer();

  // Use resizable hook
  const { panelWidth, isDragging, handleMouseDown } = useResizable();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // New Chat handler
  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Start a new chat? This will clear the current conversation.');
      if (confirmed) {
        clearMessages();
        setInputValue('');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isStreaming) {
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');

    // Send message using streaming hook
    await sendMessage(userMessage);
  };

  // Handle example query clicks
  const handleExampleClick = (query) => {
    setInputValue(query);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden flex">
      {/* Main Chat Area */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          width: isPDFOpen ? `${100 - panelWidth}%` : '100%',
          minWidth: isPDFOpen ? '30%' : '100%'
        }}
      >
        {/* Header */}
        <Header onNewChat={handleNewChat} showHeader={messages.length > 0} />

        {/* Main Content Area */}
        <main
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto scroll-smooth ${
            messages.length > 0 ? 'pt-20 pb-40' : 'pb-40'
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
            {messages.length === 0 ? (
              <WelcomeScreen onExampleClick={handleExampleClick} />
            ) : (
              <div className="py-6">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    formatTime={formatTime}
                    onSourceClick={openPDF}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Scroll to Bottom Button */}
        <ScrollToBottom
          messagesContainerRef={messagesContainerRef}
          messages={messages}
        />

        {/* Input Area - Always visible */}
        <InputArea
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onCancelStreaming={cancelStreaming}
          error={error}
        />
      </div>

      {/* Resizable Divider */}
      {isPDFOpen && (
        <ResizableDivider
          onMouseDown={handleMouseDown}
          isDragging={isDragging}
        />
      )}

      {/* PDF Viewer Panel */}
      {isPDFOpen && currentPDF && (
        <PDFViewerPanel
          pdf={currentPDF}
          onClose={closePDF}
          width={panelWidth}
        />
      )}
    </div>
  );
}

export default App;

