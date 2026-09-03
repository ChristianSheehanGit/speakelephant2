import { useState, useRef } from "react";
import elephantSvg from "./elephant.svg";
import backgroundSvg from "./background.svg";
import "./App.css";

const VOCABULARY: Record<string, string> = {
  "call_003": "I", "call_004": "you", "call_012": "we",
  "call_026": "here", "call_031": "there", "call_043": "this",
  "call_051": "and", "call_053": "now", "call_058": "together",
  "call_083": "good", "call_090": "safe", "call_098": "calm",
  "call_109": "yes", "call_110": "okay", "call_112": "with me",
  "call_113": "I know", "call_116": "I see", "call_126": "full",
  "call_145": "resting", "call_151": "waiting", "call_158": "strong",
  "call_062": "DANGER", "call_168": "COME NOW", "call_208": "WATCH OUT",
  "call_005": "where", "call_016": "what", "call_019": "why",
  "call_032": "who", "call_048": "when", "call_056": "how",
  "call_059": "are you", "call_086": "do you", "call_103": "is it",
  "call_104": "something wrong", "call_119": "I don't know",
  "call_120": "I'm not sure", "call_124": "can you", "call_128": "did you",
  "call_129": "do you remember", "call_143": "what happened",
  "call_153": "where are you going", "call_165": "is it safe",
  "call_166": "who is there", "call_185": "what is that",
  "call_189": "can I trust you", "call_191": "will you",
  "call_195": "do you understand", "call_209": "are you coming",
  "call_123": "long ago", "call_161": "I remember", "call_169": "before",
  "call_183": "I dreamed", "call_186": "we lost someone",
  "call_192": "I miss", "call_193": "things change",
  "call_000": "stop", "call_009": "stay", "call_010": "move",
  "call_011": "follow", "call_017": "listen", "call_024": "be careful",
  "call_041": "this way", "call_117": "go back", "call_127": "humans",
  "call_135": "predator", "call_138": "too close", "call_139": "stay back",
  "call_152": "protect", "call_159": "the young ones", "call_162": "gather",
  "call_163": "stay together", "call_175": "not safe", "call_196": "I smell something",
  "call_197": "I hear something", "call_198": "something is coming",
  "call_199": "pay attention", "call_201": "trust me", "call_202": "stay close",
  "call_204": "wait", "call_205": "not yet", "call_206": "almost",
  "call_002": "water", "call_007": "food", "call_008": "shade",
  "call_014": "mud", "call_015": "grass", "call_018": "rest",
  "call_025": "help", "call_030": "more", "call_037": "the river",
  "call_049": "I want", "call_050": "I need", "call_061": "give me",
  "call_063": "come with me", "call_064": "over there", "call_067": "I found it",
  "call_070": "smell this", "call_077": "the herd", "call_078": "the baby",
  "call_079": "the elder", "call_085": "I like this", "call_089": "share",
  "call_091": "soon", "call_093": "almost there", "call_094": "keep going",
  "call_095": "this is good", "call_096": "very good", "call_100": "I am happy",
  "call_115": "beautiful", "call_137": "plenty", "call_211": "found you",
  "call_060": "no", "call_200": "never",
  "call_001": "tired", "call_006": "hurt", "call_021": "sick",
  "call_022": "afraid", "call_023": "angry", "call_027": "sad",
  "call_028": "confused", "call_029": "lost", "call_033": "lonely",
  "call_034": "happy", "call_035": "proud", "call_038": "curious",
  "call_039": "playful", "call_044": "young", "call_057": "weak",
  "call_114": "quiet", "call_130": "loud", "call_131": "fast",
  "call_132": "slow", "call_133": "big", "call_134": "small",
  "call_140": "dark", "call_141": "bright", "call_144": "wet",
  "call_148": "cold", "call_150": "deep", "call_171": "new",
  "call_174": "many", "call_179": "same", "call_181": "different",
};

function matchFiles(text: string): { file: string; meaning: string }[] {
  const lower = text.toLowerCase();
  const entries = Object.entries(VOCABULARY).sort((a, b) => b[1].length - a[1].length);
  const matched: { file: string; meaning: string }[] = [];
  const used = new Set<string>();
  let remaining = lower;
  for (const [file, meaning] of entries) {
    if (remaining.includes(meaning.toLowerCase()) && !used.has(file)) {
      matched.push({ file, meaning });
      used.add(file);
      remaining = remaining.replace(meaning.toLowerCase(), "");
    }
  }
  if (matched.length === 0) matched.push({ file: "call_098", meaning: "calm" });
  return matched;
}

async function playSequence(files: { file: string }[], onFile?: (i: number) => void) {
  for (let i = 0; i < files.length; i++) {
    onFile?.(i);
    await new Promise<void>((resolve) => {
      const audio = new Audio(`/calls/${files[i].file}.mp3`);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  onFile?.(-1);
}

type Exchange = {
  you: string;
  youFiles: { file: string; meaning: string }[];
  elephant: string;
  elephantFiles: { file: string; meaning: string }[];
};

export default function App() {
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elephantSpeaking, setElephantSpeaking] = useState(false);
  const [activeFile, setActiveFile] = useState(-1);
  const [activeFiles, setActiveFiles] = useState<{ file: string; meaning: string }[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
    const [sendHovered2, setSendHovered2] = useState(false);
  const [humanSpeaking, setHumanSpeaking] = useState(false);
const [humanActiveFile, setHumanActiveFile] = useState(-1);
const [humanFiles, setHumanFiles] = useState<{ file: string; meaning: string }[]>([]);
  const messagesRef = useRef<Exchange[]>([]);

async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const humanFiles = matchFiles(text);

    // show your message immediately
    setExchange({
      you: text,
      youFiles: humanFiles,
      elephant: "",
      elephantFiles: [],
    });

setHumanFiles(humanFiles);
setHumanSpeaking(true);
await playSequence(humanFiles, (i) => setHumanActiveFile(i));
setHumanSpeaking(false);
setHumanActiveFile(-1);

    try {
      const history = messagesRef.current.flatMap(e => [
        { role: "user" as const, content: e.you },
        { role: "assistant" as const, content: e.elephant },
      ]);

      const res = await fetch("https://elephant-616938642091.europe-west1.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an elephant responding to a human. Keep responses to one short sentence, something that can be easily translated into elephant noises. No action descriptions like *flaps ears* or *trumpets*. Speak plainly as an elephant would — simple, direct, a little goofy. You care about water, mud, grass, your herd, and the young ones. You are cautious but curious about humans.`,
          messages: [...history, { role: "user", content: text }],
        }),
      });

      const data = await res.json();
      const reply = data.content[0].text;
      const elephantFiles = matchFiles(reply);

      const newExchange: Exchange = {
        you: text,
        youFiles: humanFiles,
        elephant: reply,
        elephantFiles,
      };

      messagesRef.current = [...messagesRef.current, newExchange];
      setExchange(newExchange);

      setActiveFiles(elephantFiles);
      setElephantSpeaking(true);
      await playSequence(elephantFiles, (i) => setActiveFile(i));
      setElephantSpeaking(false);
      setActiveFile(-1);

    } catch {
      setExchange(prev => prev ? { ...prev, elephant: "...", elephantFiles: [{ file: "call_028", meaning: "confused" }] } : null);
    }

    setLoading(false);
  }
  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "sans-serif", overflow: "hidden" }}>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');
</style>
      {/* background */}
      <img
        src={backgroundSvg}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, zIndex: 0, filter: "blur(8px)" }}
      />

      {/* title */}
      <div style={{ marginTop: "25px", marginBottom: "40px", position: "relative", zIndex: 2, textAlign: "center", paddingTop: "1.5rem" }}>
        <h1 style={{ fontFamily: "Bungee", fontSize: '2.5rem', fontWeight: 500, margin: 0, color: "rgb(242, 240, 239)", lineHeight: "1"}}>
          Speak with an Elephant
        </h1>
      </div>

      {/* info button */}
      <button
        onClick={() => setShowInfo(true)}
        onMouseEnter={() => setSendHovered2(true)} 
        onMouseLeave={() => setSendHovered2(false)} 
        style={{ position: "fixed", opacity: sendHovered2 ? 0.6 : 1, top: 16, right: 16, zIndex: 10, width: 32, height: 32, cursor: "pointer", fontSize: "1.25rem", color: "rgb(242, 240, 239)", background:"none", border: "none" }}
      >
        <i className="fa-solid fa-circle-info"></i>
      </button>

      {/* info modal */}
      {showInfo && (
        <div onClick={() => setShowInfo(false)} style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "rgb(242, 240, 239)", padding: "2rem", maxWidth: 400, width: "90%" }}>
            <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#000000" }}>
              This project was made within 24 hours at HackSMU VII using 212 elephant calls provided by <a href="https://www.elephantvoices.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#000000", textDecoration: "underline" }}>Elephant Voices</a>.
              <br/>•<br/>
              Claude API calls and FontAwesome Icons were used.
              <br/>•<br/>
              Created by <a href="https://christiansheehan.com" target="_blank" rel="noopener noreferrer" style={{ color: "#000000", textDecoration: "underline" }}>Christian Sheehan</a>.
            </p>
          </div>
        </div>
      )}

      {/* elephant */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", marginTop: "0.5rem", marginBottom: "25px" }}>
<div style={{ position: "relative", width: "clamp(140px, 40vw, 260px)" }}>
  <img
    src={elephantSvg}
    style={{
      width: "100%",
      animation: elephantSpeaking ? "shake 0.3s infinite" : "none"
    }}
  />

          {elephantSpeaking && [0, 1, 2].map(i => (
            <div key={i} style={{
              position: "absolute", top: "30%", left: "55%",
              width: 12 + i * 14, height: 12 + i * 14,
              animation: `ripple 1s ${i * 0.3}s infinite`,
              transform: "translate(-50%, -50%)", pointerEvents: "none",
            }} />
          ))}
        </div>
      </div>

      {/* exchange display */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 500, margin: "0.75rem auto 0",}}>
        {exchange && (
          <div>
            {/* you */}
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", marginBottom: 3, letterSpacing: 1 }}>You:</div>
              <div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", background: "rgba(0, 0, 0, 0.2)", padding: "5px 10px", marginBottom: 4 }}>
                {exchange.you}
              </div>
<div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", fontFamily: "SometypeMono", lineHeight: 2 }}>
  {humanSpeaking && humanActiveFile >= 0 && humanFiles[humanActiveFile]
    ? <span style={{ background: "rgba(0, 0, 0, 0.2)", padding: "4px 8px" }}><i className="fa-solid fa-volume-high"></i> ({humanFiles[humanActiveFile].meaning})</span>
    : exchange.youFiles.map(f => `(${f.meaning})`).join(" · ")
  }
</div>
            </div>

            {/* elephant */}

          

{(elephantSpeaking || exchange.elephantFiles.length > 0) && (
            <div>
              <div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", marginBottom: 3, letterSpacing: 1 }}>Elephant:</div>
              <div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", background: "rgba(0, 0, 0, 0.2)", padding: "5px 10px", marginBottom: 4 }}>
                {exchange.elephant}
              </div>
              <div style={{ fontSize: "1rem", color: "rgb(242, 240, 239)", fontFamily: "SometypeMono", lineHeight: 2 }}>
                {elephantSpeaking && activeFile >= 0 && activeFiles[activeFile]
                  ? <span style={{ background: "rgba(0, 0, 0, 0.2)", padding: "4px 8px" }}><i className="fa-solid fa-volume-high"></i> ({activeFiles[activeFile].meaning})</span>
                  : exchange.elephantFiles.map(f => `(${f.meaning})`).join(" · ")
                }
              </div>
            </div>
                    )}
          </div>




        )}

        {!exchange && !loading && (
          <div style={{ fontFamily: "SometypeMono", textAlign: "center", color: "rgb(242, 240, 239)", fontSize: "1rem", marginTop: "1rem", opacity: 0.8 }}>
            Say something to the elephant!
                      <br></br>
          (Turn up your volume for the best experience)
          </div>
        )}

      </div>

      {/* floating input */}
      <div style={{ position: "fixed", bottom: '50px', left: "50%", transform: "translateX(-50%)", zIndex: 5, width: "90%", maxWidth: 500 }}>
        <div style={{ display: "flex", gap: 8, backdropFilter: "blur(8px)" }}>
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Say something..."
            style={{ background: "rgba(0, 0, 0, 0.2)", fontFamily: "SometypeMono", flex: 1, padding: "6px 8px", fontSize: "1.25rem", resize: "none", color: "rgb(242, 240, 239)", outline: "none", border: "none" }}
          />
<button
  onClick={send}
  disabled={loading || elephantSpeaking}
  onMouseEnter={() => setSendHovered(true)}
  onMouseLeave={() => setSendHovered(false)}
  style={{ backgroundColor: "rgb(242, 240, 239)", fontFamily: "SometypeMono", padding: "8px 16px", cursor: loading || elephantSpeaking ? "default" : "pointer", opacity: loading || elephantSpeaking ? 0.4 : sendHovered ? 0.6 : 1, color: "#000", alignSelf: "flex-end", fontSize: "1.25rem", border: "none" }}
>
  Send
</button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(-3px) rotate(-1deg); }
          75%  { transform: translateX(3px) rotate(1deg); }
          100% { transform: translateX(0); }
        }
        @keyframes ripple {
          0%   { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.5); }
        }
      `}</style>
    </div>
  );
}