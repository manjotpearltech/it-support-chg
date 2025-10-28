import { useState, useRef, useCallback } from 'react';

const API_URL = 'https://worker.chargercloud.io';
const STREAM_TIMEOUT = 30000; // 30 seconds

// Generate unique message ID
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useStreamingChat = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // Removed sessionIdRef as it's not needed for this API
  const abortControllerRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Cancel ongoing stream
  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Simulate streaming effect for better UX
  const simulateStreaming = useCallback(async (fullText, sources, assistantMessageId, abortSignal) => {
    // Split text into words for streaming effect
    const words = fullText.split(' ');

    // Helper function to update message content
    const updateMessageContent = (content) => {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content }
          : msg
      ));
    };

    try {
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        // Check if cancelled
        if (abortSignal.aborted) {
          break;
        }

        // Add word with space
        currentContent += (i === 0 ? '' : ' ') + words[i];

        // Update message with current content
        updateMessageContent(currentContent);

        // Small delay for streaming effect (adjust for speed)
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      // Mark message as complete and add sources
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: fullText, sources, isComplete: true }
          : msg
      ));

    } catch (error) {
      if (error.name === 'AbortError') {
        // Stream was cancelled - message already updated
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: msg.content || 'Response cancelled.', isComplete: true }
            : msg
        ));
      } else {
        throw error;
      }
    }
  }, []);

  // Send message and handle response
  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isStreaming) {
      return;
    }

    setError(null);

    // Add user message
    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
      isComplete: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add placeholder assistant message
    const assistantMessageId = generateMessageId();
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      sources: [],
      timestamp: new Date().toISOString(),
      isComplete: false,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Set timeout for request
    streamTimeoutRef.current = setTimeout(() => {
      cancelStreaming();
      setError('Request timed out. Please try again.');
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: 'Request timed out.', isComplete: true, isError: true }
          : msg
      ));
    }, STREAM_TIMEOUT);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
        signal: abortControllerRef.current.signal,
      });

      // Clear timeout since we got a response
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();

      // Extract response text and sources
      const responseText = data.response || 'No response received.';
      const sources = (data.data || []).map(item => ({
        filename: item.filename,
        score: item.score,
      }));

      // Simulate streaming for better UX
      await simulateStreaming(
        responseText,
        sources,
        assistantMessageId,
        abortControllerRef.current.signal
      );

    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled - already handled in simulateStreaming
        return;
      }

      console.error('Chat error:', err);
      const errorMessage = err.message || 'Failed to get response. Please try again.';
      setError(errorMessage);

      // Update assistant message with error
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: `Error: ${errorMessage}\n\nNeed more help? Contact support@chargerlogistics.com`,
              isComplete: true,
              isError: true
            }
          : msg
      ));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
    }
  }, [isStreaming, cancelStreaming, simulateStreaming]);

  return {
    messages,
    sendMessage,
    isStreaming,
    cancelStreaming,
    clearMessages,
    error,
  };
};

