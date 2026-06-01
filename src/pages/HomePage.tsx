import Navbar from "../components/Navbar";
import GhostButton from "../components/ghostbuttons";
import { useEffect, useState } from "react";
import { generateCode } from "../utils/codeGenerator";
import { socket } from "../socket/socket";
import ChatPage from "./chatpage";

function HomePage() {
  const [userCode, setUserCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [connectCode, setConnectCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [inChat, setInChat] = useState(false);
  const [notification, setNotification] = useState("");

  // Load or create user code
  // Load or create user code
useEffect(() => {
  const savedCode = localStorage.getItem("ghostchat-code");

  if (savedCode) {
    setUserCode(savedCode);
  } else {
    const newCode = generateCode();
    localStorage.setItem("ghostchat-code", newCode);
    setUserCode(newCode);
  }
}, []);

// Auto-dismiss notification
useEffect(() => {
  if (notification) {
    const timer = setTimeout(() => {
      setNotification("");
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [notification]);


      useEffect(() => {

  if (
    userCode &&
    connected
  ) {

    socket.emit(
      "register-code",
      userCode
    );
  }

}, [
  userCode,
  connected
]);

  // Socket listeners
  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("welcome", (message) => {
      console.log(message);
    });

    socket.on("waiting", () => {
      setWaiting(true);
    });

    socket.on("matched", (data) => {
  setWaiting(false);
  setRoomId(data.roomId);
  setPartnerCode(
  data.partnerCode
);
  setInChat(true);
  console.log("Matched room:", data.roomId);
});

    socket.on("queue-left", () => {
      setWaiting(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("welcome");
      socket.off("waiting");
      socket.off("matched");
      socket.off("queue-left");
    };
  }, []);

  // Random chat
  const startRandomChat = () => {
    socket.emit("join-random");
    setWaiting(true);
  };

  // THIS IS THE MISSING FUNCTION
  const leaveQueue = () => {
    socket.emit("leave-queue");
    setWaiting(false);
  };

  // Copy code
  const copyCode = async () => {
    await navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

    if (inChat && roomId) {
  return (
    <ChatPage
      roomId={roomId}
      userCode={userCode}
      partnerCode={partnerCode}
      onLeave={(reason) => {
  setInChat(false);
  setRoomId("");
  setPartnerCode("");

  if (reason === "partner-left") {
    setNotification(" Your phantom has vanished from the séance...");
  }
}}
    />
  );
}
  // Regenerate code
  const regenerateCode = () => {
    const newCode = generateCode();
    localStorage.setItem("ghostchat-code", newCode);
    setUserCode(newCode);
  };

  return (
    <div className="relative min-h-screen bg-[#111111] text-zinc-300 font-serif selection:bg-zinc-700 selection:text-white z-0 overflow-hidden">
      {/* Floating Ghost Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <span className="absolute left-[5%] top-[10%] text-5xl rotate-12 opacity-50 animate-[ghost-float_3s_ease-in-out_infinite]">👻</span>
        <span className="absolute left-[15%] top-[30%] text-7xl -rotate-12 opacity-50 animate-[ghost-float_4s_ease-in-out_infinite_0.5s]">👻</span>
        <span className="absolute left-[30%] top-[60%] text-3xl rotate-45 opacity-50 animate-[ghost-float_3.5s_ease-in-out_infinite_1s]">👻</span>
        <span className="absolute left-[50%] top-[20%] text-6xl -rotate-6 opacity-50 animate-[ghost-float_5s_ease-in-out_infinite_0.3s]">👻</span>
        <span className="absolute left-[70%] top-[50%] text-4xl rotate-20 opacity-50 animate-[ghost-float_4s_ease-in-out_infinite_1.5s]">👻</span>
        <span className="absolute left-[85%] top-[15%] text-7xl -rotate-12 opacity-50 animate-[ghost-float_3s_ease-in-out_infinite_0.8s]">👻</span>
        <span className="absolute left-[90%] top-[70%] text-5xl rotate-12 opacity-50 animate-[ghost-float_4.5s_ease-in-out_infinite_0.2s]">👻</span>
        <span className="absolute left-[40%] top-[80%] text-8xl -rotate-6 opacity-50 animate-[ghost-float_6s_ease-in-out_infinite_1s]">👻</span>
        <span className="absolute left-[60%] top-[40%] text-3xl rotate-30 opacity-50 animate-[ghost-float_3.5s_ease-in-out_infinite_2s]">👻</span>
      </div>

      <Navbar connected={connected} />

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-zinc-100">
          Whisper to a Ghost. Leave No Trace.
        </h2>

        <p className="text-zinc-500 mb-10 italic">
          Zero accounts. Zero memory. Pure ether.
        </p>

        {/* Code Card */}
        <div className="bg-[#1c1c1c]/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-8 mb-8 relative overflow-hidden">
          <p className="text-zinc-500 mb-2 uppercase tracking-widest text-xl font-semibold">
            Summoning Key
          </p>

          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-bold tracking-[0.2em] text-zinc-200">
              {userCode}
            </h3>

            <div className="flex gap-3">
              <button
                onClick={copyCode}
                disabled={copied}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  copied ? "bg-green-600 text-white" : "bg-yellow-600 text-black hover:bg-yellow-400"
                }`}
              >
                {copied ? "✔️ Stolen" : "🦝 Steal"}
              </button>

              <GhostButton variant="ghost" onClick={regenerateCode} className="px-4 py-2">
                🔄 Reborn
              </GhostButton>
            </div>
          </div>
        </div>

        {/* Random Chat */}
        <GhostButton
          onClick={startRandomChat}
          variant="primary"
          fullWidth
          className="py-5 text-xl mb-4 tracking-widest"
        >
          👻 Wander The Void
        </GhostButton>

        {/* Waiting Cancel UI */}
        {waiting && (
          <div className="text-center mb-4">
            <p className="text-yellow-400 mb-2">
              Searching for Ghost...
            </p>
            <button
              onClick={leaveQueue}
              className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {roomId && (
          <div className="bg-green-900 border border-green-700 rounded-xl p-4 mb-4">
            <p>Connected!</p>
            <p className="text-sm text-green-300">Room: {roomId}</p>
          </div>
        )}

        {/* Connect by Code */}
        <div className="bg-[#1c1c1c]/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
          <h3 className="text-2xl font-bold mb-6 text-zinc-200">
            Join A Séance
          </h3>

          <input
            type="text"
            value={connectCode}
            onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
            placeholder="WHISPER CODE"
            maxLength={6}
            className="w-full mb-6 px-5 py-4 rounded-xl bg-black/20 border border-white/10 outline-none text-zinc-200 uppercase tracking-widest"
          />

          <GhostButton
            variant="secondary"
            fullWidth
            type="submit"
            onClick={() => {
              if (connectCode.trim()) {
                console.log("Connecting to:", connectCode);
              }
            }}
            className="py-4"
          >
            🕯️ Summon
          </GhostButton>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 mt-10 text-sm">
          Vanish upon exit. No strings attached.
        </p>

        {/* Notification Card */}
{notification && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.5s_ease-out]">
    <div className="bg-[#1c1c1c]/90 backdrop-blur-md border border-red-800/40 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 max-w-md">
      <span className="text-3xl animate-pulse">👻</span>
      <div className="flex-1">
        <p className="text-red-300 font-serif italic text-sm">
          {notification}
        </p>
      </div>
      <button
        onClick={() => setNotification("")}
        className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg"
      >
        ✕
      </button>
    </div>
  </div>
)}
      

      </main>
    </div>
  );
}

export default HomePage;