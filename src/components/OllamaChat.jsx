import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

export default function OllamaChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    setResponse('');
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-coder', prompt })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        const json = JSON.parse(line);
        fullText += json.response || '';
        setResponse(fullText);
      }
    }

    setLoading(false);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">🧠 Ollama Chat</h1>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt..."
        />
      </div>
      <button
        className="btn btn-primary"
        onClick={sendPrompt}
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
      <div className="mt-4 p-3 border rounded bg-light">
        <MarkdownRenderer content={response} />
      </div>
    </div>
  );
}