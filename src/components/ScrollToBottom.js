import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';

const ScrollToBottom = ({ messagesContainerRef, messages }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
      setShowButton(isScrolledUp);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef]);

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="fixed bottom-24 right-6 w-12 h-12 bg-white hover:bg-bg-tertiary border border-border-primary rounded-full shadow-light-lg flex items-center justify-center cursor-pointer animate-fade-in transition-all duration-200 hover:scale-105 z-30"
      title="Scroll to bottom"
    >
      <ArrowDown className="w-5 h-5 text-text-primary" />
    </button>
  );
};

export default ScrollToBottom;

