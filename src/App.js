import React, { useState, useEffect, useRef } from 'react';

// --- Main App Component ---
export default function App() {
  // State for managing UI interactions
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am FlowSync AI. How can I help you with your revenue and supply chain operations today?',
    },
  ]);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const chatEndRef = useRef(null);

  // State for mocked feature 1: Email Generation
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  // State for mocked feature 2: Elaboration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elaborationContent, setElaborationContent] = useState('');
  const [isElaborating, setIsElaborating] = useState(false);
  const [modalTitle, setModalTitle] = useState('');


  // Scripted conversation for the demo
  const scriptedDemo = [
    {
      user: 'Show me the invoice discrepancies between our ERP and CRM for last quarter.',
      bot: "I've analyzed the data. There are 15 discrepancies totaling $42,500. The primary issues are mismatched PO numbers and delayed payment entries. Would you like a detailed report or shall I initiate a workflow to resolve them?",
    },
    {
      user: 'Generate the detailed report and summarize the top 3 highest value discrepancies.',
      bot: 'Report generated. The top 3 discrepancies are: INV-1023 ($15,000), INV-1088 ($9,200), and INV-1101 ($6,500). I have highlighted them in the report sent to your email. The resolution workflow is ready to be initiated.',
    },
    {
      user: 'Great. Initiate the workflow to resolve these discrepancies.',
      bot: 'Workflow initiated. I have scheduled the necessary data syncs and sent automated alerts to the finance and sales operations teams with their resolution tasks. You can monitor the progress on the main dashboard.'
    }
  ];

  // --- Mocked Feature 1: Email Generation ---
  const handleGenerateEmail = () => {
    setIsGeneratingEmail(true);
    setGeneratedEmail('');
    setCopyButtonText('Copy to Clipboard');

    // MOCKED RESPONSE - No API call is made
    const staticEmailResponse = `Subject: Urgent Action Required: Invoice Discrepancies Detected

Hello Teams,

This is an automated alert from FlowSync AI.

We have identified 3 high-priority invoice discrepancies between our ERP and CRM systems that require your immediate attention.

Details:
1. INV-1023: $15,000
2. INV-1088: $9,200
3. INV-1101: $6,500

An automated workflow has been initiated to perform the necessary data synchronizations. A detailed report has been sent to your inboxes.

Please review the report and action the resolution tasks assigned to your respective teams promptly to prevent any impact on our financial reporting.

Thank you,
FlowSync AI`;

    // Simulate network delay
    setTimeout(() => {
        setGeneratedEmail(staticEmailResponse);
        setIsGeneratingEmail(false);
    }, 1500);
  };

  // --- Mocked Feature 2: Elaborate on Step ---
  const handleElaborateStep = (stepTitle) => {
    setModalTitle(`Elaborating on: ${stepTitle}`);
    setIsModalOpen(true);
    setIsElaborating(true);
    setElaborationContent('');

    // MOCKED RESPONSE - No API call is made
    let staticElaboration = '';
    switch (stepTitle) {
        case 'Plan':
            staticElaboration = "This initial 'Plan' phase is crucial for establishing a unified view of the data. The system programmatically connects to the ERP and CRM via secure APIs to fetch relevant records like invoices, purchase orders, and customer data for the specified period. It then standardizes this data, creating a common format to ensure accurate, like-for-like comparisons in the next step. This prevents errors that arise from manual data entry and different system schemas.";
            break;
        case 'Action':
            staticElaboration = "In the 'Action' phase, the system executes its core logic. It cross-references the correlated data from the previous step, systematically checking for mismatches in key fields such as amounts, dates, and reference numbers. Any record that fails this validation is flagged as a discrepancy. This automated identification is significantly faster and more accurate than manual spot-checking, allowing teams to focus on the exceptions rather than the entire dataset.";
            break;
        case 'Result':
            staticElaboration = "The 'Result' phase is about delivering actionable insights. The system compiles all identified discrepancies into a structured, audit-ready report, complete with details for each issue. Simultaneously, it triggers alerts to the designated finance and operations teams, often creating tasks directly in their project management tools. This ensures that the findings are not just reported but are immediately routed to the correct personnel for resolution, closing the loop from detection to action.";
            break;
        default:
            staticElaboration = "This step is a key part of the automated workflow to ensure data integrity across systems.";
    }

    // Simulate network delay
    setTimeout(() => {
        setElaborationContent(staticElaboration);
        setIsElaborating(false);
    }, 1200);
  }


  const copyToClipboard = () => {
    // A robust copy-to-clipboard function with fallback
    navigator.clipboard.writeText(generatedEmail).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }, () => {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement("textarea");
        textArea.value = generatedEmail;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    });
  };

  const handleSendMessage = (userMessage) => {
    if (demoStep >= scriptedDemo.length) return; // Prevent extra clicks after demo is over

    const { bot } = scriptedDemo[demoStep];
    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    // Add bot reply after a short delay for realism
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: bot }]);
    }, 1000);
    setDemoStep(demoStep + 1);
  };

  const togglePlanVisibility = () => setIsPlanVisible(!isPlanVisible);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const agentPlanSteps = [
      { title: 'Plan', description: 'Correlate data from disparate ERP, CRM, and inventory systems.' },
      { title: 'Action', description: 'Identify anomalies and mismatched records across the systems.' },
      { title: 'Result', description: 'Generate a comprehensive, audit-ready report and alert the relevant teams.' }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        body { background-color: #000000; color: #EAEFFB; font-family: 'Inter', sans-serif; }
        .mockup-container { max-width: 900px; margin: 2rem auto; padding: 2rem; border-radius: 16px; background: #0D1117; border: 1px solid #30363d; box-shadow: 0 0 25px rgba(0, 245, 212, 0.1), 0 0 50px rgba(0, 245, 212, 0.05); }
        .header { text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #30363d; padding-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 2.25rem; font-weight: 700; color: #FFFFFF; text-shadow: 0 0 10px rgba(0, 245, 212, 0.7); }
        .header p { margin: 0.5rem 0 0; color: #A9B4CC; }
        .problem-user { background: linear-gradient(145deg, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.4)); padding: 1.25rem; border-radius: 12px; margin-bottom: 2rem; text-align: center; border: 1px solid #30363d; font-size: 0.9rem; }
        .problem-user strong { color: #EAEFFB; }
        .main-content { display: flex; flex-wrap: wrap; gap: 2rem; }
        .chat-section { flex: 2; min-width: 300px; }
        .chat-window { height: 400px; border-radius: 12px; padding: 1rem; overflow-y: auto; background-color: #010409; margin-bottom: 1rem; display: flex; flex-direction: column; border: 1px solid #30363d; box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5); }
        .message { margin-bottom: 1rem; padding: 0.75rem 1rem; border-radius: 12px; max-width: 80%; line-height: 1.5; word-wrap: break-word; animation: fadeIn 0.5s ease-out forwards; }
        .user { background: #3A86FF; color: white; align-self: flex-end; border-radius: 12px 12px 4px 12px; }
        .bot { background-color: #1F2937; color: #A9B4CC; align-self: flex-start; border-radius: 12px 12px 12px 4px; }
        .query-choices { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .query-choice-btn { width: 100%; padding: 0.85rem 1rem; border: 1px solid rgba(0, 245, 212, 0.4); background-color: transparent; color: #00F5D4; border-radius: 8px; cursor: pointer; text-align: left; font-size: 0.95rem; transition: all 0.3s ease; }
        .query-choice-btn:hover { background-color: rgba(0, 245, 212, 0.1); color: #FFFFFF; border-color: #00F5D4; box-shadow: 0 0 15px rgba(0, 245, 212, 0.3); }
        .agent-panel-container { flex: 1; min-width: 250px; }
        .view-plan-btn { width: 100%; padding: 0.75rem; margin-bottom: 1rem; background: #161b22; color: #70E000; border: 1px solid #30363d; border-bottom-color: #70E000; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: all 0.2s; }
        .view-plan-btn:hover { background-color: #70E000; color: #000; border-color: #70E000; box-shadow: 0 0 20px rgba(112, 224, 0, 0.5); transform: translateY(-2px); }
        .agent-panel { border: 1px solid #30363d; border-top: 3px solid #70E000; padding: 1.5rem; border-radius: 12px; background-color: #010409; }
        .agent-panel h4 { margin-top: 0; color: #70E000; font-weight: 600; text-shadow: 0 0 5px rgba(112, 224, 0, 0.7); }
        .agent-step { margin-bottom: 1rem; font-size: 0.9rem; color: #A9B4CC; }
        .agent-step strong { display: block; color: #EAEFFB; margin-bottom: 0.25rem; font-size: 1rem; }
        .footer { text-align: center; margin-top: 2.5rem; border-top: 1px solid #30363d; padding-top: 1.5rem; }
        .cta-btn { padding: 0.8rem 2rem; font-size: 1.1rem; background: #161b22; color: #AD00FF; border: 1px solid #30363d; border-bottom-color: #AD00FF; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .cta-btn:hover { background-color: #AD00FF; color: white; border-color: #AD00FF; box-shadow: 0 0 25px rgba(173, 0, 255, 0.6); transform: translateY(-2px); }
        .citation { font-size: 0.8rem; color: #8b949e; margin-top: 1.5rem; }
        .info-boxes { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; margin-top: 2rem; font-size: 0.8rem; color: #A9B4CC; }
        .info-box { border: 1px solid #30363d; border-left: 3px solid #00F5D4; background: #161b22; padding: 1rem; border-radius: 8px; width: 100%; }
        .info-box strong { color: #EAEFFB; }
        
        .gemini-feature { margin-top: 1rem; }
        .gemini-btn { width: 100%; padding: 0.85rem 1rem; border: 1px solid #AD00FF; background-color: rgba(173, 0, 255, 0.1); color: #AD00FF; border-radius: 8px; cursor: pointer; text-align: center; font-size: 0.95rem; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .gemini-btn:hover { background-color: rgba(173, 0, 255, 0.2); box-shadow: 0 0 15px rgba(173, 0, 255, 0.3); }
        .gemini-btn:disabled { cursor: not-allowed; opacity: 0.7; }
        .loader { width: 16px; height: 16px; border: 2px solid; border-color: #AD00FF transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: spin 1s linear infinite; }
        
        .email-display { margin-top: 1rem; background-color: #010409; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 0.9rem; line-height: 1.6; color: #A9B4CC; animation: fadeIn 0.5s; }
        .email-display-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .email-display-header h5 { margin: 0; color: #EAEFFB; }
        .copy-btn { background: #161b22; color: #00F5D4; border: 1px solid #30363d; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
        .copy-btn:hover { background-color: #30363d; }

        .elaborate-btn { background: none; border: 1px solid #30363d; color: #8b949e; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; margin-left: 0.5rem; }
        .elaborate-btn:hover { color: #00F5D4; border-color: #00F5D4; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.3s; }
        .modal-content { background: #0D1117; border: 1px solid #30363d; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 1rem; margin-bottom: 1rem; }
        .modal-header h4 { margin: 0; font-size: 1.2rem; color: #EAEFFB; }
        .modal-close-btn { background: none; border: none; color: #8b949e; font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
        .modal-close-btn:hover { color: #EAEFFB; }
        .modal-body { line-height: 1.7; color: #A9B4CC; font-size: 0.95rem; max-height: 60vh; overflow-y: auto; }
        .modal-body .loader { margin: 2rem auto; display: block; border-color: #00F5D4 transparent; }
        
        @media (min-width: 600px) { .info-box { width: 48%; } }
      `}</style>
      
      <div className="mockup-container">
         <header className="header">
          <h1>FlowSync AI</h1>
          <p>An intelligent AI assistant for simplifying revenue and supply chain operations.</p>
        </header>

        <div className="problem-user">
          <strong>Problem:</strong> Teams face errors and delays from manually reconciling financial and supply chain data across different systems. <br />
          <strong>User:</strong> Revenue and supply chain operations teams in mid-to-large enterprises.
        </div>

        <div className="main-content">
          <div className="chat-section">
            <div className="chat-window">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="query-choices">
              {demoStep < scriptedDemo.length && (
                <button
                  className="query-choice-btn"
                  onClick={() => handleSendMessage(scriptedDemo[demoStep].user)}
                >
                  {scriptedDemo[demoStep].user}
                </button>
              )}
            </div>

            {demoStep === scriptedDemo.length && (
              <div className="gemini-feature">
                <button className="gemini-btn" onClick={handleGenerateEmail} disabled={isGeneratingEmail}>
                  {isGeneratingEmail ? <><span className="loader"></span> Generating...</> : '✨ Draft Resolution Email'}
                </button>
                {generatedEmail && (
                  <div className="email-display">
                    <div className="email-display-header">
                        <h5>Generated Email Draft</h5>
                        <button className="copy-btn" onClick={copyToClipboard}>{copyButtonText}</button>
                    </div>
                    {generatedEmail}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="agent-panel-container">
            <button className="view-plan-btn" onClick={togglePlanVisibility}>
              {isPlanVisible ? 'Hide Plan' : 'View Plan'}
            </button>
            {isPlanVisible && (
              <div className="agent-panel">
                <h4>Agent Action Plan</h4>
                {agentPlanSteps.map(step => (
                    <div className="agent-step" key={step.title}>
                        <div>
                            <strong>{step.title} →</strong>
                            <button className="elaborate-btn" onClick={() => handleElaborateStep(step.title)}>✨ Elaborate</button>
                        </div>
                        {step.description}
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="footer">
          <button className="cta-btn">Request a Demo</button>
          <div className="citation">
            <strong>Citation:</strong> Research indicates that integrated data systems can reduce operational costs related to manual processes by up to 85%. (McKinsey & Company, 2023, "The data-driven enterprise of 2025").
          </div>
        </footer>

        <div className="info-boxes">
          <div className="info-box">
            <strong>Top 3 Assumptions</strong>
            <ol>
              <li>APIs are available and accessible for all required ERP, CRM, and inventory systems.</li>
              <li>Data formats across systems are mappable, even if they are inconsistent.</li>
              <li>Target users have the authority to act on the resolutions proposed by the AI.</li>
            </ol>
          </div>
          <div className="info-box">
            <strong>Ethics Note</strong>
            <p>This is a conceptual demo only—no real data is processed or stored. All user preferences and system actions are mocked for illustrative purposes.</p>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <h4>{modalTitle}</h4>
                      <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                  </div>
                  <div className="modal-body">
                      {isElaborating ? <span className="loader"></span> : elaborationContent}
                  </div>
              </div>
          </div>
      )}
    </>
  );
}

