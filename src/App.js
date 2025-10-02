import React, { useState, useEffect, useRef } from 'react';
// --- Import Chart.js for data visualization ---
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// --- Register Chart.js components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


// --- MOCK API: Simulates fetching real-time data from a database/API ---
const fetchMockData = async () => {
  console.log("Simulating API call to fetch invoice data...");
  return new Promise(resolve => {
    setTimeout(() => {
      const mockData = [
        { id: 'INV-1023', erpAmount: 15000, crmAmount: 14500, status: 'Pending', date: '2025-09-15' },
        { id: 'INV-1088', erpAmount: 9200, crmAmount: 9200, status: 'Paid', date: '2025-09-12' },
        { id: 'INV-1101', erpAmount: 6500, crmAmount: 7000, status: 'Pending', date: '2025-09-20' },
        { id: 'INV-1105', erpAmount: 22000, crmAmount: 22000, status: 'Paid', date: '2025-08-25' },
        { id: 'INV-1112', erpAmount: 3400, crmAmount: 3400, status: 'Paid', date: '2025-09-18' },
        { id: 'INV-1119', erpAmount: 8900, crmAmount: 8000, status: 'Overdue', date: '2025-08-10' },
        { id: 'INV-1125', erpAmount: 11500, crmAmount: 11500, status: 'Paid', date: '2025-09-28' },
        { id: 'INV-1130', erpAmount: 4200, crmAmount: 4200, status: 'Pending', date: '2025-09-30' },
      ];
      console.log("Mock data fetched:", mockData);
      resolve(mockData);
    }, 1500); // Simulate network delay
  });
};


// --- Main App Component ---
export default function App() {
  // State for managing UI interactions
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am FlowSync AI. You can ask me to analyze invoice discrepancies, draft emails, or visualize financial data. How can I help you?',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  // State for new features: Data Visualization
  const [chartData, setChartData] = useState(null);
  const [visualizationTitle, setVisualizationTitle] = useState('');

  // State for Gemini API feature: Email Generation (retained from original)
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  // --- Main Message Handling Logic ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsBotTyping(true);
    setChartData(null); // Clear previous chart

    // --- Intent Recognition ---
    const lowerCaseInput = userInput.toLowerCase();
    if (lowerCaseInput.includes('analyze') || lowerCaseInput.includes('discrepancies') || lowerCaseInput.includes('visualize')) {
      await handleDataAnalysisRequest(userInput);
    } else if (lowerCaseInput.includes('email') || lowerCaseInput.includes('draft')) {
      await handleGenerateEmail(userInput);
    } else {
      await handleGeneralQuery(userInput);
    }

    setIsBotTyping(false);
  };

  // --- Gemini API Call 1: Data Analysis and Visualization ---
  const handleDataAnalysisRequest = async (query) => {
    const botMessage = { sender: 'bot', text: "Accessing systems and analyzing data..." };
    setMessages(prev => [...prev, botMessage]);

    const realTimeData = await fetchMockData();

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY; // <-- IMPORTANT: USE ENVIRONMENT VARIABLE
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an expert financial data analyst AI named FlowSync. Your task is to analyze raw JSON data containing invoice records from an ERP and CRM.
    1. Identify records with discrepancies (where erpAmount and crmAmount do not match).
    2. Calculate the value of each discrepancy.
    3. Provide a concise, professional summary of your findings in bullet points.
    4. Generate data for a visual chart to represent the findings.
    5. You MUST return your response as a single, valid JSON object with the following structure:
       {
         "summaryText": "A string containing your text analysis.",
         "visualization": {
           "title": "A descriptive title for the chart.",
           "type": "bar",
           "labels": ["Array of strings for the chart labels, e.g., invoice IDs"],
           "datasets": [
             { "label": "ERP Amount", "data": [Array of numbers], "backgroundColor": "rgba(255, 99, 132, 0.5)" },
             { "label": "CRM Amount", "data": [Array of numbers], "backgroundColor": "rgba(54, 162, 235, 0.5)" }
           ]
         }
       }
    Do NOT include any text or markdown formatting before or after the JSON object.`;
    
    const userQuery = `Analyze the following invoice data. The user's original request was: "${query}". Here is the data:\n${JSON.stringify(realTimeData)}`;
    
    const payload = { contents: [{ parts: [{ text: userQuery }] }], system_instruction: { parts: [{ text: systemPrompt }] } };

    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        // Find and parse the JSON block from the response
        const jsonString = textResponse.match(/```json\n([\s\S]*?)\n```/)?.[1] || textResponse;
        const parsedData = JSON.parse(jsonString);

        // Update the last bot message with the analysis summary
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = parsedData.summaryText;
            return newMessages;
        });

        // Set state for the chart
        setVisualizationTitle(parsedData.visualization.title);
        setChartData({
          type: parsedData.visualization.type,
          data: {
            labels: parsedData.visualization.labels,
            datasets: parsedData.visualization.datasets,
          }
        });

      } else {
        throw new Error("Invalid API response format.");
      }
    } catch (error) {
      console.error("Gemini API call failed:", error);
      const errorMessage = { sender: 'bot', text: 'Sorry, I encountered an error while analyzing the data. Please check the console for details.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace "analyzing" message with error
    }
  };

  // --- Gemini API Call 2: General Query ---
  const handleGeneralQuery = async (query) => {
    // This is a simple passthrough for conversational queries
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: query }] }] };

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
        setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
        console.error("Gemini API call failed:", error);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
    }
  }
  
  // --- Gemini API Call 3: Email Generation (Modified to be more dynamic) ---
  const handleGenerateEmail = async (query) => {
    setGeneratedEmail('');
    const botMessage = { sender: 'bot', text: `Drafting an email based on your request: "${query}"` };
    setMessages(prev => [...prev, botMessage]);

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const systemPrompt = "You are an expert financial operations assistant named FlowSync AI. Your tone is professional, clear, and action-oriented. You are drafting an email to internal teams to resolve financial discrepancies based on the user's request.";
    const payload = { contents: [{ parts: [{ text: query }] }], system_instruction: { parts: [{ text: systemPrompt }] } };

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        const emailText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (emailText) {
            setGeneratedEmail(emailText);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Here is the draft. You can copy it from the panel on the right.' }]);
        } else {
             throw new Error("Invalid API response format for email.");
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Failed to generate the email.' }]);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- Chart Component to render different chart types ---
  const ChartRenderer = ({ chartData }) => {
    const options = {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: false } },
    };
    if (!chartData) return null;
    switch (chartData.type) {
        case 'bar':
            return <Bar options={options} data={chartData.data} />;
        case 'line':
            return <Line options={options} data={chartData.data} />;
        case 'doughnut':
            return <Doughnut options={options} data={chartData.data} />;
        default:
            return <Bar options={options} data={chartData.data} />;
    }
  };

  return (
    <>
      <style>{`
        /* ... (Your original CSS is great, no major changes needed. You might want to add styles for the new elements if desired) ... */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes typing { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } 100% { content: '.'; } }
        
        body { background-color: #000000; color: #EAEFFB; font-family: 'Inter', sans-serif; }
        .mockup-container { max-width: 1200px; margin: 2rem auto; padding: 2rem; border-radius: 16px; background: #0D1117; border: 1px solid #30363d; box-shadow: 0 0 25px rgba(0, 245, 212, 0.1), 0 0 50px rgba(0, 245, 212, 0.05); }
        .header { text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #30363d; padding-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 2.25rem; font-weight: 700; color: #FFFFFF; text-shadow: 0 0 10px rgba(0, 245, 212, 0.7); }
        .header p { margin: 0.5rem 0 0; color: #A9B4CC; }
        .main-content { display: flex; flex-wrap: wrap; gap: 2rem; }
        .chat-section { flex: 2; min-width: 300px; display: flex; flex-direction: column; }
        .chat-window { flex-grow: 1; height: 500px; border-radius: 12px; padding: 1rem; overflow-y: auto; background-color: #010409; margin-bottom: 1rem; display: flex; flex-direction: column; border: 1px solid #30363d; box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5); }
        .message { margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 12px; max-width: 80%; line-height: 1.5; word-wrap: break-word; animation: fadeIn 0.5s ease-out forwards; white-space: pre-wrap; }
        .user { background: #3A86FF; color: white; align-self: flex-end; border-radius: 12px 12px 4px 12px; }
        .bot { background-color: #1F2937; color: #A9B4CC; align-self: flex-start; border-radius: 12px 12px 12px 4px; }
        .bot-typing::after { content: '.'; animation: typing 1.5s infinite; }
        .chat-input-form { display: flex; gap: 0.5rem; }
        .chat-input { flex-grow: 1; padding: 0.85rem 1rem; background-color: #010409; border: 1px solid #30363d; border-radius: 8px; color: #EAEFFB; font-size: 1rem; }
        .chat-input:focus { outline: none; border-color: #00F5D4; }
        .send-btn { padding: 0.85rem 1.5rem; background: #00F5D4; color: #010409; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background-color 0.2s; }
        .send-btn:hover { background: #62ffe9; }
        .send-btn:disabled { background: #30363d; cursor: not-allowed; }
        .right-panel { flex: 1.5; min-width: 350px; }
        .panel-box { border: 1px solid #30363d; padding: 1.5rem; border-radius: 12px; background-color: #010409; margin-bottom: 1rem; animation: fadeIn 0.5s; }
        .panel-box h4 { margin-top: 0; color: #70E000; font-weight: 600; text-shadow: 0 0 5px rgba(112, 224, 0, 0.7); }
        .email-display { margin-top: 1rem; background-color: #010409; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 0.9rem; line-height: 1.6; color: #A9B4CC; animation: fadeIn 0.5s; max-height: 300px; overflow-y: auto; }
        .email-display-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .email-display-header h5 { margin: 0; color: #EAEFFB; }
        .copy-btn { background: #161b22; color: #00F5D4; border: 1px solid #30363d; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
        .copy-btn:hover { background-color: #30363d; }
      `}</style>
      
      <div className="mockup-container">
         <header className="header">
          <h1>FlowSync AI</h1>
          <p>Your interactive AI assistant for revenue and supply chain operations.</p>
        </header>

        <div className="main-content">
          <div className="chat-section">
            <div className="chat-window">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isBotTyping && <div className="message bot bot-typing">Thinking</div>}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., Visualize invoice discrepancies for last quarter"
                    disabled={isBotTyping}
                />
                <button type="submit" className="send-btn" disabled={isBotTyping || !userInput.trim()}>Send</button>
            </form>
          </div>

          <div className="right-panel">
            {chartData && (
                <div className="panel-box">
                    <h4>{visualizationTitle}</h4>
                    <ChartRenderer chartData={chartData} />
                </div>
            )}
             {generatedEmail && (
              <div className="panel-box">
                <h4>Generated Email Draft</h4>
                <div className="email-display">
                    <div className="email-display-header">
                        <button className="copy-btn" onClick={copyToClipboard}>{copyButtonText}</button>
                    </div>
                    {generatedEmail}
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}