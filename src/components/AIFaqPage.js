import React, { useRef, useState } from 'react';

const AIFaqPage = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Audio input handler
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    setError('');
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setError('Audio error: ' + event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || 'Error fetching answer.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl p-6 bg-white rounded shadow relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        onClick={onClose}
        aria-label="Close FAQ"
        type="button"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-4">AI FAQ (Lab Usage)</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Ask a question (e.g., Who used NaCl?)"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`px-3 py-2 rounded ${listening ? 'bg-red-500' : 'bg-gray-300'} text-white`}
            title={listening ? 'Stop listening' : 'Speak your question'}
          >
            <span role="img" aria-label="mic">🎤</span>
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Answer'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {answer && (
        <div className="bg-gray-100 p-4 rounded">
          <strong>Answer:</strong>
          <pre className="whitespace-pre-wrap">{answer}</pre>
        </div>
      )}
    </div>
  );
};

export default AIFaqPage; 