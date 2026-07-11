import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Plane,
  MapPin,
  TrendingUp,
  Coins,
  Compass,
  CloudRain,
  Droplets,
  Clock,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Plus,
  X,
  Terminal,
  Sliders,
  Database,
  ArrowUpRight,
  ShieldAlert,
  Car,
  Bike,
  Navigation,
  FolderLock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Pause,
  Sparkles
} from "lucide-react";
import { InputContext, SafetyRoadmap } from "./types";

// Setup preset data with corresponding predefined outputs for fallback or quick testing
const SCENARIOS = [
  {
    id: "student",
    name: "College Student",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    input: {
      persona: "College Student",
      vulnerable_assets: ["Textbooks", "Notebooks", "Paper Assignments"],
      start_location: "Downtown Sector 4",
      destination: "State University Campus",
      transport_mode: "Metro",
      budget_buffer_inr: 150,
      weather_feed: {
        precipitation_intensity: "Heavy Downpour expected in 45 mins",
        waterlogging_risk_score: 7,
        transit_delays_reported: "Metro operating normally; local buses delayed by 30 mins"
      }
    },
    output: {
      status: "CAUTION",
      packing_directive: "Double-wrap your Textbooks, Notebooks, and Paper Assignments in heavy-duty zip-lock plastic folders before putting them in your bag.",
      commute_strategy: "Take the Metro since it is operating normally. Avoid the local feeder buses as they face 30-minute delays due to the oncoming heavy downpour. Keep your budget of 150 INR for emergency auto-rickshaw rides if metro-to-campus walking routes waterlog.",
      critical_alert: "Heavy downpour expected in Downtown Sector 4 in 45 mins. Waterlogging risk score is high (7/10) for local street connections."
    } as SafetyRoadmap
  },
  {
    id: "professional",
    name: "Working Professional",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-200",
    input: {
      persona: "Working Professional",
      vulnerable_assets: ["Enterprise Laptop", "Corporate ID"],
      start_location: "Suburban Residency",
      destination: "Tech Park Junction",
      transport_mode: "Cab",
      budget_buffer_inr: 1200,
      weather_feed: {
        precipitation_intensity: "Severe thunderstorms and cloudburst risk",
        waterlogging_risk_score: 9,
        transit_delays_reported: "Major arterial roads waterlogged; cab surge pricing at 3x"
      }
    },
    output: {
      status: "STAY_PUT",
      packing_directive: "Seal your Enterprise Laptop inside a hard waterproof shell case and secure your Corporate ID in a water-resistant sleeve.",
      commute_strategy: "Major arterial transit corridors to Tech Park Junction are flooded and dangerous. Standard cabs are facing 3x surge pricing. It is highly advised to stay at Suburban Residency, request remote work for today, and save your 1200 INR travel budget.",
      critical_alert: "Extreme waterlogging hazard (9/10). Do not attempt to cross underpasses or low-lying junctions."
    } as SafetyRoadmap
  },
  {
    id: "traveler",
    name: "Transit Traveler",
    icon: Plane,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    border: "border-amber-200",
    input: {
      persona: "Transit Traveler",
      vulnerable_assets: ["Checked luggage", "Passport", "Flight Ticket"],
      start_location: "Downtown Sector 4",
      destination: "Intl Airport T2",
      transport_mode: "Cab",
      budget_buffer_inr: 2000,
      weather_feed: {
        precipitation_intensity: "Moderate steady rain",
        waterlogging_risk_score: 5,
        transit_delays_reported: "Airport approach road restricted to single lane due to pooling water"
      }
    },
    output: {
      status: "CAUTION",
      packing_directive: "Wrap checked luggage in heavy-duty stretch film. Keep your Passport and Flight Ticket in a waterproof, sealed neck pouch kept directly on your body.",
      commute_strategy: "Book a premium, high-clearance cab immediately. Airport approach road is restricted to a single lane due to pooling water. Set off 60 minutes earlier than normal to avoid missing flights. Your 2000 INR budget easily covers premium booking services.",
      critical_alert: "Airport approach restricted to a single lane. Minor pooling water waterlogging score is 5/10."
    } as SafetyRoadmap
  }
];

export default function App() {
  // Preset or custom state selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("student");
  
  // Input fields state
  const [persona, setPersona] = useState<string>(SCENARIOS[0].input.persona);
  const [vulnerableAssets, setVulnerableAssets] = useState<string[]>(SCENARIOS[0].input.vulnerable_assets);
  const [newAsset, setNewAsset] = useState<string>("");
  const [startLocation, setStartLocation] = useState<string>(SCENARIOS[0].input.start_location);
  const [destination, setDestination] = useState<string>(SCENARIOS[0].input.destination);
  const [transportMode, setTransportMode] = useState<string>(SCENARIOS[0].input.transport_mode);
  const [budgetBuffer, setBudgetBuffer] = useState<number>(SCENARIOS[0].input.budget_buffer_inr);
  
  // Weather feed state
  const [precipitation, setPrecipitation] = useState<string>(SCENARIOS[0].input.weather_feed.precipitation_intensity);
  const [waterloggingScore, setWaterloggingScore] = useState<number>(SCENARIOS[0].input.weather_feed.waterlogging_risk_score);
  const [delaysReported, setDelaysReported] = useState<string>(SCENARIOS[0].input.weather_feed.transit_delays_reported);

  // Output states
  const [roadmap, setRoadmap] = useState<SafetyRoadmap>(SCENARIOS[0].output);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [outputTab, setOutputTab] = useState<"visual" | "json_min" | "json_pretty">("visual");
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLiveOutput, setIsLiveOutput] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [showHelplines, setShowHelplines] = useState<boolean>(false);

  // AI Voice states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceInputProgress, setVoiceInputProgress] = useState<string>("");

  // Speak out the safety roadmap via Web Speech API Text-to-Speech
  const speakRoadmap = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechError("Speech Synthesis (TTS) is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const statusPhrase = roadmap.status === "GO"
      ? "Safety status is Green. Go! It is safe to travel on your route."
      : roadmap.status === "CAUTION"
      ? "Safety status is Amber. Exercise caution, there is some pooling or rain."
      : "Safety status is Red. Stay put! It is not safe to travel today.";

    const textToSpeak = `
      JalVayu safety update for your trip from ${startLocation || "Source"} to ${destination || "Destination"} by ${transportMode || "preferred transport"}.
      ${statusPhrase}
      Waterlogging risk is scored at ${waterloggingScore} out of 10.
      Precipitation intensity is reported as: ${precipitation || "not specified"}.
      Your packing advice is: ${roadmap.packing_directive}
      Your travel commute strategy is: ${roadmap.commute_strategy}
      ${roadmap.critical_alert ? `Critical alert warning: ${roadmap.critical_alert}` : ""}
      Thank you, stay safe.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira"))) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Listen to user via Speech Recognition (Speech-to-Text) and feed into Gemini parsing engine
  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Good fallback for dual English/Indian pronunciations

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceInputProgress("Microphone active. Speak your route now (e.g., 'Take me from Chembur to Bandra by Cab, carrying my laptop').");
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      setSpeechError(`Microphone error: ${e.error || "Permission denied"}.`);
      setIsListening(false);
      setVoiceInputProgress("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript) return;

      setIsListening(false);
      setVoiceInputProgress(`Heard: "${transcript}". Invoking JalVayu AI Voice parser...`);

      try {
        const response = await fetch("/api/jalvayu/parse-voice-commute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript })
        });

        if (!response.ok) {
          throw new Error("Failed to contact the voice parsing backend.");
        }

        const parsed = await response.json();
        
        // Populate inputs
        if (parsed.startLocation) setStartLocation(parsed.startLocation);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.persona) setPersona(parsed.persona);
        if (parsed.vulnerableAssets && parsed.vulnerableAssets.length > 0) {
          setVulnerableAssets(parsed.vulnerableAssets);
        }
        if (parsed.transportMode) {
          const matched = ["Metro", "Cab", "Auto", "Two-wheeler", "Walking"].find(
            m => m.toLowerCase() === parsed.transportMode.toLowerCase()
          );
          if (matched) setTransportMode(matched);
        }

        setSelectedScenarioId("custom");
        setVoiceInputProgress("Updating form and invoking monsoon risk engine...");

        // Automatically trigger roadmap generation!
        setIsGenerating(true);
        setApiError(null);
        setGenerationLogs([]);
        setIsConfirmed(false);
        setShowHelplines(false);

        const context: InputContext = {
          persona: parsed.persona || persona,
          vulnerable_assets: parsed.vulnerableAssets && parsed.vulnerableAssets.length > 0 ? parsed.vulnerableAssets : vulnerableAssets,
          start_location: parsed.startLocation || startLocation,
          destination: parsed.destination || destination,
          transport_mode: parsed.transportMode || transportMode,
          budget_buffer_inr: budgetBuffer,
          weather_feed: {
            precipitation_intensity: precipitation,
            waterlogging_risk_score: waterloggingScore,
            transit_delays_reported: delaysReported
          }
        };

        setGenerationLogs([
          `[${new Date().toLocaleTimeString()}] AI Voice parser successfully processed spoken command.`,
          `[${new Date().toLocaleTimeString()}] Spoken transcript: "${transcript}"`,
          `[${new Date().toLocaleTimeString()}] Extracted route: ${parsed.startLocation || "Current"} to ${parsed.destination || "Destination"}`
        ]);

        const roadmapRes = await fetch("/api/jalvayu/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context)
        });

        if (!roadmapRes.ok) {
          throw new Error("Failed to invoke GenAI risk engine for weather roadmap.");
        }

        const roadmapData: SafetyRoadmap = await roadmapRes.json();
        setRoadmap(roadmapData);
        setIsLiveOutput(true);
        
        setGenerationLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Weather roadmap calculated. Status: ${roadmapData.status}.`,
          `[${new Date().toLocaleTimeString()}] Starting immediate voice advisory broadcast...`
        ]);

        setVoiceInputProgress("Roadmap completed! Playing voice advisory...");

        // Directly speak out the fresh roadmap!
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const statusPhrase = roadmapData.status === "GO"
              ? "Your safety advisory status is Green. It is safe to travel today."
              : roadmapData.status === "CAUTION"
              ? "Your safety advisory status is Amber. Exercise caution on your route."
              : "Your safety advisory status is Red. Stay put! It is not safe to travel today.";

            const finalAdvisory = `
              JalVayu voice advisory updated.
              For your commute from ${parsed.startLocation || startLocation} to ${parsed.destination || destination} by ${parsed.transportMode || transportMode}.
              ${statusPhrase}
              Your packing instructions: ${roadmapData.packing_directive}.
              Your commute recommendation: ${roadmapData.commute_strategy}.
              ${roadmapData.critical_alert ? `Critical Warning: ${roadmapData.critical_alert}.` : ""}
              Safe journey.
            `;

            const utterance = new SpeechSynthesisUtterance(finalAdvisory);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira"))) || voices.find(v => v.lang.startsWith("en")) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
              setIsSpeaking(false);
              setVoiceInputProgress("");
            };
            utterance.onerror = () => {
              setIsSpeaking(false);
              setVoiceInputProgress("");
            };
            window.speechSynthesis.speak(utterance);
          }
        }, 500);

      } catch (err: any) {
        console.error(err);
        setSpeechError(`Voice analysis failed: ${err.message}`);
        setVoiceInputProgress("");
        setIsGenerating(false);
      }
    };
  };

  // Rain control based on waterlogging risk & rain intensity
  const [rainDroplets, setRainDroplets] = useState<number[]>([]);
  
  // Trigger rain effect inside iframe
  useEffect(() => {
    const dropletCount = Math.min(waterloggingScore * 6, 60);
    const droplets = Array.from({ length: dropletCount }, (_, i) => i);
    setRainDroplets(droplets);
  }, [waterloggingScore]);

  // Synchronize scenario state if preset changes
  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setIsConfirmed(false);
    setShowHelplines(false);
    const scenario = SCENARIOS.find((s) => s.id === id);
    if (scenario) {
      setPersona(scenario.input.persona);
      setVulnerableAssets(scenario.input.vulnerable_assets);
      setStartLocation(scenario.input.start_location);
      setDestination(scenario.input.destination);
      setTransportMode(scenario.input.transport_mode);
      setBudgetBuffer(scenario.input.budget_buffer_inr);
      setPrecipitation(scenario.input.weather_feed.precipitation_intensity);
      setWaterloggingScore(scenario.input.weather_feed.waterlogging_risk_score);
      setDelaysReported(scenario.input.weather_feed.transit_delays_reported);
      setRoadmap(scenario.output);
      setIsLiveOutput(false);
      setApiError(null);
    } else {
      // "custom" selected
      setSelectedScenarioId("custom");
    }
  };

  // Asset adding and removal
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAsset.trim() && !vulnerableAssets.includes(newAsset.trim())) {
      setVulnerableAssets([...vulnerableAssets, newAsset.trim()]);
      setNewAsset("");
      setSelectedScenarioId("custom");
    }
  };

  const handleRemoveAsset = (asset: string) => {
    setVulnerableAssets(vulnerableAssets.filter((a) => a !== asset));
    setSelectedScenarioId("custom");
  };

  // Invoke the GenAI server orchestration engine
  const triggerGenAIOrchestration = async () => {
    setIsGenerating(true);
    setApiError(null);
    setGenerationLogs([]);
    setIsConfirmed(false);
    setShowHelplines(false);
    
    const context: InputContext = {
      persona,
      vulnerable_assets: vulnerableAssets,
      start_location: startLocation,
      destination: destination,
      transport_mode: transportMode,
      budget_buffer_inr: budgetBuffer,
      weather_feed: {
        precipitation_intensity: precipitation,
        waterlogging_risk_score: waterloggingScore,
        transit_delays_reported: delaysReported
      }
    };

    const addLog = (msg: string) => {
      setGenerationLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog("Initializing JalVayu GenAI Core Orchestrator...");
      await new Promise(r => setTimeout(r, 600));
      addLog("Analyzing user profile: " + persona);
      addLog(`Tracking vulnerabilities: ${vulnerableAssets.join(", ")}`);
      await new Promise(r => setTimeout(r, 500));
      addLog(`Evaluating monsoon threat level (waterlogging: ${waterloggingScore}/10)...`);
      addLog("Calling server side Gemini 3.5 Flash engine...");
      
      const response = await fetch("/api/jalvayu/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP error ${response.status}: Failed to invoke Gemini.`);
      }

      const data: SafetyRoadmap = await response.json();
      
      addLog("Verifying output schema constraints...");
      await new Promise(r => setTimeout(r, 400));
      
      if (!data.status || !data.packing_directive || !data.commute_strategy || !data.critical_alert) {
        throw new Error("Generated response did not comply with strict JSON schema definitions.");
      }

      addLog("Successfully parsed valid JSON safety roadmap!");
      setRoadmap(data);
      setIsLiveOutput(true);
    } catch (err: any) {
      console.error(err);
      addLog("CRITICAL ENGINE ERROR: " + err.message);
      setApiError(err.message || "An unexpected error occurred during safety roadmap synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert roadmap output to minified JSON as requested by the server config rule
  const minifiedJSON = JSON.stringify({
    status: roadmap.status,
    packing_directive: roadmap.packing_directive,
    commute_strategy: roadmap.commute_strategy,
    critical_alert: roadmap.critical_alert
  });

  const formattedJSON = JSON.stringify({
    status: roadmap.status,
    packing_directive: roadmap.packing_directive,
    commute_strategy: roadmap.commute_strategy,
    critical_alert: roadmap.critical_alert
  }, null, 2);

  const copyToClipboard = () => {
    const textToCopy = outputTab === "json_min" ? minifiedJSON : formattedJSON;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get status badge colors
  const getStatusConfig = (status: "GO" | "CAUTION" | "STAY_PUT") => {
    switch (status) {
      case "GO":
        return {
          headerBg: "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400",
          accentColor: "emerald",
          textColor: "text-emerald-400",
          cardBg: "bg-[#111827]",
          icon: ShieldCheck,
          glow: "pulse-green bg-emerald-500/30",
          border: "border-[#1F2937]",
          textLabel: "SAFE TO DEPART",
          description: "All conditions appear green. Plan your route normally, keeping safety precautions active."
        };
      case "CAUTION":
        return {
          headerBg: "bg-amber-500/5 border border-amber-500/20 text-amber-500",
          accentColor: "amber",
          textColor: "text-amber-400",
          cardBg: "bg-[#111827]",
          icon: AlertTriangle,
          glow: "pulse-amber bg-amber-500/30",
          border: "border-[#1F2937]",
          textLabel: "EXERCISE CAUTION",
          description: "Moderate hazards or rain levels detected on route. Keep emergency buffers ready."
        };
      case "STAY_PUT":
        return {
          headerBg: "bg-rose-500/5 border border-rose-500/20 text-rose-500",
          accentColor: "rose",
          textColor: "text-rose-400",
          cardBg: "bg-[#111827]",
          icon: ShieldAlert,
          glow: "pulse-red bg-rose-500/30",
          border: "border-[#1F2937]",
          textLabel: "STAY PUT",
          description: "The safety index has dropped below threshold. Travel is highly discouraged."
        };
    }
  };

  const statusConfig = getStatusConfig(roadmap.status);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* Dynamic Animated Ambient Rain Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
        {rainDroplets.map((i) => {
          const left = `${Math.random() * 100}%`;
          const delay = `${Math.random() * 2}s`;
          const duration = `${0.5 + Math.random() * 0.8}s`;
          const height = `${30 + Math.random() * 40}px`;
          return (
            <div
              key={i}
              className="rain-streak"
              style={{
                left,
                animationDelay: delay,
                animationDuration: duration,
                height,
                top: "-50px"
              }}
            />
          );
        })}
      </div>

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#1F2937] bg-[#0A0A0B]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CloudRain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">JalVayu</h1>
              <span className="text-[10px] bg-blue-500/5 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">v1.1</span>
            </div>
            <p className="text-xs text-slate-400">Hyper-Local Monsoon Preparedness Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs font-mono text-slate-400">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>GenAI Orchestration Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 overflow-y-auto">
        
        {/* Left Hand Context Builder Form */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Quick Scenario Preset Select */}
          <div className="bg-[#0D0D0E] border border-[#1F2937] rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4.5 h-4.5 text-blue-400" />
                <h2 className="font-semibold font-display text-white text-base">Select Situational Preset</h2>
              </div>
              {selectedScenarioId !== "custom" && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Preset Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {SCENARIOS.map((sc) => {
                const IconComponent = sc.icon;
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                      isSelected
                        ? "bg-[#111827] border-blue-500/80 shadow-lg shadow-blue-500/10"
                        : "bg-[#0A0A0B]/60 border-[#1F2937] hover:border-slate-700 hover:bg-[#111827]/40"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full mb-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? "bg-blue-500/10 text-blue-400" : "bg-[#0A0A0B] text-slate-400 group-hover:text-slate-300"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-blue-400 translate-x-0.5 -translate-y-0.5" : "text-slate-600 group-hover:text-slate-400"}`} />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-200 line-clamp-1">{sc.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Buffer: ₹{sc.input.budget_buffer_inr}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Voice Copilot Panel */}
          <div className="bg-[#0D0D0E] border border-[#1F2937] rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                <h2 className="font-semibold font-display text-white text-base">AI Voice Copilot</h2>
              </div>
              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-red-500 animate-ping" : isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500"}`} />
                {isListening ? "RECORDING" : isSpeaking ? "SPEAKING" : "VOICE READY"}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              State your commute details using voice commands. Our AI model parses your route and immediately broadcasts your safety advisory report.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Tap to Speak Button */}
              <button
                onClick={startListening}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isListening
                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 shadow-lg shadow-red-500/5"
                    : "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/25"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span>Speak Route</span>
                  </>
                )}
              </button>

              {/* Speak Roadmap (TTS) Button */}
              <button
                onClick={isSpeaking ? stopSpeaking : speakRoadmap}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isSpeaking
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/25"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Play Voice</span>
                  </>
                )}
              </button>
            </div>

            {/* Waveform Animation Area */}
            {(isListening || isSpeaking) && (
              <div className="mt-4 p-3 bg-[#0A0A0B] border border-[#1F2937] rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {isListening ? "Input Audio Feed:" : "Synthesizer Audio Feed:"}
                </span>
                <div className="flex items-center gap-1 h-5 px-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                    <motion.div
                      key={bar}
                      className={`w-1 rounded-full ${isListening ? "bg-red-400" : "bg-emerald-400"}`}
                      animate={{
                        height: isListening ? [4, 16, 4] : isSpeaking ? [4, 12, 4] : 4
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: bar * 0.08,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Voice Parsing Terminal Progress Indicator */}
            {voiceInputProgress && (
              <div className="mt-4 p-3 bg-[#0A0A0B]/80 border border-blue-500/20 rounded-xl space-y-1.5 animate-pulse">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-blue-400">
                  <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="font-bold uppercase tracking-wider">Voice Processor Status</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed pl-3 border-l border-blue-500/30">
                  {voiceInputProgress}
                </p>
              </div>
            )}

            {/* Error notifications */}
            {speechError && (
              <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Voice Copilot Notice</span>
                  <p className="mt-0.5 leading-relaxed">{speechError}</p>
                </div>
                <button onClick={() => setSpeechError(null)} className="text-slate-500 hover:text-white cursor-pointer ml-1 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Configuration Form */}
          <div className="bg-[#0D0D0E] border border-[#1F2937] rounded-2xl p-5 backdrop-blur-sm flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2937]">
                <h2 className="font-semibold font-display text-white text-base">Situational Context & Risks</h2>
                <button
                  onClick={() => {
                    setSelectedScenarioId("custom");
                    setPersona("");
                    setVulnerableAssets([]);
                    setStartLocation("");
                    setDestination("");
                    setBudgetBuffer(0);
                    setPrecipitation("");
                    setWaterloggingScore(1);
                    setDelaysReported("");
                    setIsConfirmed(false);
                    setShowHelplines(false);
                  }}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Persona and Vulnerable Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">User Persona</label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => {
                      setPersona(e.target.value);
                      setSelectedScenarioId("custom");
                    }}
                    placeholder="e.g. Gig Worker"
                    className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">Budget Buffer (INR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetBuffer}
                      onChange={(e) => {
                        setBudgetBuffer(Math.max(0, parseInt(e.target.value) || 0));
                        setSelectedScenarioId("custom");
                      }}
                      className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors font-mono"
                    />
                    <Coins className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Vulnerable Assets Tag Manager */}
              <div>
                <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">Vulnerable Assets</label>
                <form onSubmit={handleAddAsset} className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Add asset... (e.g. Passport, Medicine)"
                      value={newAsset}
                      onChange={(e) => setNewAsset(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                    />
                    <FolderLock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 transition-colors text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0A0A0B]/50 rounded-xl border border-[#1F2937] min-h-[50px] items-center">
                  {vulnerableAssets.length === 0 ? (
                    <span className="text-slate-500 text-[11px] italic px-2">No assets selected. Add assets above.</span>
                  ) : (
                    vulnerableAssets.map((asset) => (
                      <span
                        key={asset}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#111827] border border-[#1F2937] text-slate-200"
                      >
                        <span>{asset}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(asset)}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Transit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">Start Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={startLocation}
                      onChange={(e) => {
                        setStartLocation(e.target.value);
                        setSelectedScenarioId("custom");
                      }}
                      placeholder="Start point"
                      className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                    />
                    <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">Destination</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setSelectedScenarioId("custom");
                      }}
                      placeholder="Destination point"
                      className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                    />
                    <Navigation className="w-3.5 h-3.5 text-blue-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Transport Mode */}
              <div>
                <label className="block text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-1.5 font-semibold">Preferred Transport Mode</label>
                <div className="grid grid-cols-5 gap-2">
                  {["Metro", "Cab", "Auto", "Two-wheeler", "Walking"].map((mode) => {
                    const isActive = transportMode.toLowerCase() === mode.toLowerCase();
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setTransportMode(mode);
                          setSelectedScenarioId("custom");
                        }}
                        className={`py-2 rounded-xl border text-xs text-center font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#111827] border-blue-500/80 text-white shadow-md shadow-blue-500/5"
                            : "bg-[#0A0A0B]/60 border-[#1F2937] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Weather Feed */}
              <div className="bg-[#111827]/40 p-4 rounded-xl border border-[#1F2937] space-y-4">
                <span className="block text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">Live Weather Feed Metrics</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Precipitation Intensity</label>
                    <input
                      type="text"
                      value={precipitation}
                      onChange={(e) => {
                        setPrecipitation(e.target.value);
                        setSelectedScenarioId("custom");
                      }}
                      placeholder="e.g. Heavy thunderstorms"
                      className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] text-slate-400">Waterlogging Risk Score</label>
                      <span className="text-xs font-mono font-bold text-blue-400">{waterloggingScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={waterloggingScore}
                      onChange={(e) => {
                        setWaterloggingScore(parseInt(e.target.value));
                        setSelectedScenarioId("custom");
                      }}
                      className="w-full accent-blue-500 bg-[#0A0A0B] h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Transit Delays Reported</label>
                  <input
                    type="text"
                    value={delaysReported}
                    onChange={(e) => {
                      setDelaysReported(e.target.value);
                      setSelectedScenarioId("custom");
                    }}
                    placeholder="e.g. Local flooding delays"
                    className="w-full bg-[#0A0A0B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

            <div className="pt-5 mt-4 border-t border-[#1F2937]">
              <button
                type="button"
                onClick={triggerGenAIOrchestration}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#111827] disabled:text-slate-600 text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Orchestrating GenAI Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Generate Safety Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </section>

        {/* Right Hand GenAI Monitor & Results Panel */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Active Terminal Logs Stream */}
          <div className="bg-[#0A0A0B] border border-[#1F2937] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[180px]">
            <div className="bg-[#0D0D0E] px-4 py-2.5 border-b border-[#1F2937] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-medium">JalVayu GenAI Orchestrator Terminal</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] space-y-1.5 text-emerald-400/90 scrollbar-thin scrollbar-thumb-slate-800">
              {generationLogs.length === 0 ? (
                <div className="text-slate-500 italic">
                  &gt; Waiting for next execution request...
                  <br />
                  &gt; Select a preset or customize parameters, then click &quot;Generate Safety Roadmap&quot;.
                </div>
              ) : (
                generationLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-emerald-500">&gt;</span> {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Results Visualizer / Output Panel */}
          <div className="bg-[#0D0D0E] border border-[#1F2937] rounded-2xl backdrop-blur-sm shadow-xl flex-1 flex flex-col overflow-hidden">
            
            {/* Header with Navigation and presets tag */}
            <div className="bg-[#0D0D0E]/80 px-5 py-3 border-b border-[#1F2937] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="font-semibold font-display text-white text-base">Safety Roadmap</h2>
                {!isLiveOutput && (
                  <span className="text-[10px] bg-[#111827] border border-[#1F2937] text-slate-400 px-2 py-0.5 rounded font-mono">
                    Preset Roadmap
                  </span>
                )}
                {isLiveOutput && (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    Live Orchestrated
                  </span>
                )}
              </div>

              {/* View Selector Tabs */}
              <div className="flex bg-[#0A0A0B] p-1 rounded-xl border border-[#1F2937] shrink-0">
                <button
                  onClick={() => setOutputTab("visual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    outputTab === "visual"
                      ? "bg-[#111827] text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Visual Roadmap
                </button>
                <button
                  onClick={() => setOutputTab("json_min")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    outputTab === "json_min"
                      ? "bg-[#111827] text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Minified JSON
                </button>
                <button
                  onClick={() => setOutputTab("json_pretty")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    outputTab === "json_pretty"
                      ? "bg-[#111827] text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pretty JSON
                </button>
              </div>
            </div>

            {/* Error Overlay */}
            {apiError && (
              <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl m-5 text-rose-200 text-xs flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">GenAI Generation Error</span>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            {/* Main outputs block */}
            <div className="flex-1 p-5 md:p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                
                {outputTab === "visual" ? (
                  <motion.div
                    key="visual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Status Display Area - Redesigned like Elegant Dark Status Block */}
                    <div className={`p-5 rounded-2xl ${statusConfig.headerBg} relative overflow-hidden transition-all duration-300 space-y-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur ${statusConfig.glow}`} />
                            <div className="relative p-3 rounded-full bg-[#0A0A0B] border border-[#1F2937] text-white flex items-center justify-center">
                              {React.createElement(statusConfig.icon, { className: `w-6 h-6 text-${statusConfig.accentColor}-400` })}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-semibold">Current Advisory Status</span>
                            <span className="text-xl font-bold font-display text-slate-100">{statusConfig.textLabel} ({roadmap.status})</span>
                            <p className="text-xs text-slate-400 mt-1 max-w-md">{statusConfig.description}</p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-semibold">Rain Level</span>
                          <span className="text-sm font-semibold text-slate-300">{precipitation || "No precipitation reported"}</span>
                        </div>
                      </div>

                      {/* Integrated Audio Player Broadcast Bar */}
                      <div className="pt-3 border-t border-[#1F2937]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-[#0A0A0B]/40 p-3 rounded-xl">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg ${isSpeaking ? "bg-emerald-500/10 text-emerald-400 animate-pulse" : "bg-[#111827] text-slate-400"}`}>
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-slate-200">AI Safety Radio Update</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {isSpeaking ? "Broadcasting live weather voice advisory..." : "Synthesized text-to-speech feedback ready"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSpeaking && (
                            <div className="flex items-center gap-0.5 h-3 px-1.5 mr-1">
                              {[1, 2, 3, 4].map((bar) => (
                                <motion.div
                                  key={bar}
                                  className="w-0.5 bg-emerald-400 rounded-full"
                                  animate={{ height: [4, 10, 4] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: bar * 0.1 }}
                                />
                              ))}
                            </div>
                          )}
                          <button
                            onClick={isSpeaking ? stopSpeaking : speakRoadmap}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all border ${
                              isSpeaking
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {isSpeaking ? (
                              <>
                                <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                                <span>Stop Update</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                <span>Listen to Advisory</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Hazard Scoreboard with Elegant Dark Accent borders */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#111827]/40 border border-[#1F2937] border-l-2 border-l-blue-500 rounded-xl rounded-l-none p-4 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">Waterlogging Threat</span>
                        <div className="flex items-baseline space-x-1.5 mt-2">
                          <span className="text-2xl font-bold text-white font-mono">{waterloggingScore}</span>
                          <span className="text-xs text-slate-500">/ 10</span>
                        </div>
                        <div className="w-full bg-[#0A0A0B] h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              waterloggingScore >= 8 ? "bg-[#EF4444]" : waterloggingScore >= 5 ? "bg-[#F59E0B]" : "bg-[#10B981]"
                            }`}
                            style={{ width: `${waterloggingScore * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-[#111827]/40 border border-[#1F2937] border-l-2 border-l-amber-500 rounded-xl rounded-l-none p-4 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">Transit Impact</span>
                        <div className="text-xs text-slate-300 font-medium leading-relaxed mt-2 line-clamp-2">
                          {delaysReported || "No critical transit delays reported on this route."}
                        </div>
                      </div>

                      <div className="bg-[#111827]/40 border border-[#1F2937] border-l-2 border-l-emerald-500 rounded-xl rounded-l-none p-4 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">Budget Cushion</span>
                        <div className="flex items-baseline space-x-1.5 mt-2">
                          <span className="text-2xl font-bold text-white font-mono">₹{budgetBuffer}</span>
                          <span className="text-[10px] text-slate-500 font-mono">INR</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Cards for packing, route, alert */}
                    <div className="space-y-4">
                      
                      {/* Packing Directive Card */}
                      <div className="bg-[#111827]/30 border border-[#1F2937] rounded-xl p-4.5 space-y-3">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <FolderLock className="w-4 h-4" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">Asset Packing Directive</h3>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed font-sans">
                          {roadmap.packing_directive}
                        </p>
                        
                        {/* Interactive Packing Checklist */}
                        {vulnerableAssets.length > 0 && (
                          <div className="pt-3 border-t border-[#1F2937] space-y-1.5">
                            <span className="block text-[10px] text-[#6B7280] uppercase font-mono font-medium">Waterproof Check List:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {vulnerableAssets.map((asset) => (
                                <label key={asset} className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#0A0A0B]/40 border border-[#1F2937] hover:border-slate-700/80 cursor-pointer text-[11px] text-slate-300 transition-colors">
                                  <input type="checkbox" className="rounded bg-[#0A0A0B] border-[#1F2937] text-blue-500 focus:ring-0 focus:ring-offset-0" />
                                  <span className="truncate">{asset} Protection Secured</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Commute Strategy Card */}
                      <div className="bg-[#111827]/30 border border-[#1F2937] rounded-xl p-4.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-indigo-400">
                            <Navigation className="w-4 h-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">Route & commute Strategy</h3>
                          </div>
                          <span className="text-[10px] bg-[#111827] border border-[#1F2937] px-2 py-0.5 rounded text-slate-300 font-mono">
                            {transportMode || "Any Mode"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 bg-[#0A0A0B]/60 p-2.5 rounded-xl border border-[#1F2937] text-[11px]">
                          <span className="text-slate-400 font-medium">Route:</span>
                          <span className="text-slate-200">{startLocation || "Source"}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-slate-200">{destination || "Destination"}</span>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed font-sans">
                          {roadmap.commute_strategy}
                        </p>
                      </div>

                      {/* Critical Alert Card */}
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4.5 space-y-2">
                        <div className="flex items-center space-x-2 text-rose-400">
                          <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">Critical Weather Advisory</h3>
                        </div>
                        <p className="text-rose-200 text-xs leading-relaxed font-sans">
                          {roadmap.critical_alert}
                        </p>
                      </div>

                      {/* Elegant Strategy Container with Actions */}
                      <div className="bg-gradient-to-br from-[#111827] to-[#0A0A0B] border border-[#1F2937] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="z-10">
                          <h4 className="text-sm font-semibold text-slate-200">Acknowledge Safety Measures</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">Confirm active protective setups or toggle regional emergency monsoonal resources.</p>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto z-10">
                          <button
                            onClick={() => setIsConfirmed(!isConfirmed)}
                            className={`w-full sm:w-auto font-semibold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isConfirmed 
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                                : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isConfirmed ? "Route Confirmed ✓" : "Confirm Route"}</span>
                          </button>
                          
                          <button
                            onClick={() => setShowHelplines(!showHelplines)}
                            className={`w-full sm:w-auto border border-[#374151] px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              showHelplines 
                                ? "bg-slate-800 text-white" 
                                : "bg-transparent text-slate-400 hover:text-white"
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>{showHelplines ? "Hide Helplines" : "Emergency Help"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Emergency Help Overlay Box */}
                      {showHelplines && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-950/60 border border-[#1F2937] p-5 rounded-2xl space-y-3 font-mono text-xs text-slate-300"
                        >
                          <span className="block text-[10px] text-rose-400 font-bold uppercase tracking-wider">Critical National & Regional Helpline References:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                            <div className="p-2.5 bg-[#0D0D0E] border border-[#1F2937] rounded-lg">
                              <span className="text-white block font-semibold">National Disaster Management (NDMA)</span>
                              <span className="text-blue-400 block mt-1">Call: 011-26701728</span>
                            </div>
                            <div className="p-2.5 bg-[#0D0D0E] border border-[#1F2937] rounded-lg">
                              <span className="text-white block font-semibold">National Emergency Response Number</span>
                              <span className="text-blue-400 block mt-1">Call: 112 (Toll-Free)</span>
                            </div>
                            <div className="p-2.5 bg-[#0D0D0E] border border-[#1F2937] rounded-lg">
                              <span className="text-white block font-semibold">Monsoon Floods Helpline Control Room</span>
                              <span className="text-blue-400 block mt-1">Call: 1070 / 1078</span>
                            </div>
                            <div className="p-2.5 bg-[#0D0D0E] border border-[#1F2937] rounded-lg">
                              <span className="text-white block font-semibold">Municipal Waterlogging & Drain Support</span>
                              <span className="text-blue-400 block mt-1">Call: 1913 (Major Metros)</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {outputTab === "json_min" ? "Minified JSON Schema Output (Single-line production API view)" : "Formatted JSON (Testing configuration view)"}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1.5 text-xs bg-[#111827] border border-[#1F2937] hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors font-mono cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Schema</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-[#1F2937] rounded-xl p-4 overflow-x-auto">
                      <pre className="font-mono text-xs text-blue-400 leading-relaxed max-h-[360px] overflow-y-auto whitespace-pre-wrap select-all">
                        {outputTab === "json_min" ? minifiedJSON : formattedJSON}
                      </pre>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </section>

      </main>

      {/* Mini Technical Footer */}
      <footer className="relative z-10 border-t border-[#1F2937] bg-[#0A0A0B]/60 py-3.5 text-center text-[10px] font-mono text-slate-500">
        JalVayu Monsoon Preparedness Engine • Powered by Gemini 3.5 Flash Core Architecture • Standard Port: 3000 Ingress
      </footer>
    </div>
  );
}
