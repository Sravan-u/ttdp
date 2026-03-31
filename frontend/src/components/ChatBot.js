import React, { useState, useRef, useEffect } from 'react';

const BOT_RESPONSES = (msg, slots, myBooking) => {
  const m = msg.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|helo|hii)/.test(m))
    return `👋 Hello! I'm **ParkBot**, your smart parking assistant!\n\nI can help you with:\n• Find available slots\n• Navigate to a zone\n• Check your booking\n• Slot types info\n• Parking tips\n\nWhat do you need help with?`;

  // My booking
  if (m.includes('my booking') || m.includes('my slot') || m.includes('where am i parked')) {
    if (myBooking)
      return `✅ You are currently parked at:\n\n🅿️ **Slot ${myBooking.slot?.slotNumber}**\n📍 Zone: ${myBooking.slot?.zone}\n🕐 Booked at: ${new Date(myBooking.bookedAt).toLocaleTimeString()}\n\nTo release your slot, click the **"Release Slot"** button on the dashboard.`;
    return `You don't have an active booking right now.\n\nTo book a slot:\n1. Go to 🗺️ **Map View** tab\n2. Click any 🟢 green marker\n3. Confirm your booking`;
  }

  // Available slots
  if (m.includes('available') || m.includes('free slot') || m.includes('empty')) {
    const avail = (slots || []).filter(s => s.status === 'AVAILABLE');
    if (avail.length === 0) return `😔 Sorry, no slots are available right now.\n\nCheck back in a few minutes or try a different zone.`;
    const zones = [...new Set(avail.map(s => s.zone))];
    return `🟢 **${avail.length} slots available** right now!\n\nAvailable in zones:\n${zones.map(z => {
      const count = avail.filter(s => s.zone === z).length;
      return `• ${z}: ${count} slot${count > 1 ? 's' : ''}`;
    }).join('\n')}\n\nGo to **Map View** and click any green marker to book!`;
  }

  // Zone A navigation
  if (m.includes('zone a') || m.includes('car parking') || m.includes('car slot')) {
    const zoneSlots = (slots || []).filter(s => s.zone === 'Zone A');
    const avail = zoneSlots.filter(s => s.status === 'AVAILABLE').length;
    return `🚗 **Zone A — Car Parking**\n\n📍 Located near the main entrance\n🅿️ Total slots: ${zoneSlots.length}\n🟢 Available: ${avail}\n🔴 Occupied: ${zoneSlots.length - avail}\n\n**How to reach Zone A:**\nEnter from the main gate → Turn right → Zone A is the first parking area on your left.`;
  }

  // Zone B navigation
  if (m.includes('zone b') || m.includes('bike parking') || m.includes('bike slot') || m.includes('motorcycle')) {
    const zoneSlots = (slots || []).filter(s => s.zone === 'Zone B');
    const avail = zoneSlots.filter(s => s.status === 'AVAILABLE').length;
    return `🏍️ **Zone B — Bike Parking**\n\n📍 Located on the left side of the building\n🅿️ Total slots: ${zoneSlots.length}\n🟢 Available: ${avail}\n🔴 Occupied: ${zoneSlots.length - avail}\n\n**How to reach Zone B:**\nEnter from the main gate → Go straight → Zone B is on your left side near the security cabin.`;
  }

  // Zone C
  if (m.includes('zone c') || m.includes('bicycle') || m.includes('cycle')) {
    const zoneSlots = (slots || []).filter(s => s.zone === 'Zone C');
    const avail = zoneSlots.filter(s => s.status === 'AVAILABLE').length;
    return `🚲 **Zone C — Bicycle Parking**\n\n📍 Located at the back of the building\n🅿️ Total slots: ${zoneSlots.length}\n🟢 Available: ${avail}\n\n**How to reach Zone C:**\nEnter from main gate → Go straight to the end → Zone C is at the back near the garden area.`;
  }

  // Zone D
  if (m.includes('zone d') || m.includes('any vehicle') || m.includes('general parking')) {
    const zoneSlots = (slots || []).filter(s => s.zone === 'Zone D');
    const avail = zoneSlots.filter(s => s.status === 'AVAILABLE').length;
    return `🅿️ **Zone D — General Parking**\n\n📍 Located near the side entrance\n🅿️ Total slots: ${zoneSlots.length}\n🟢 Available: ${avail}\n\n**How to reach Zone D:**\nUse the side entrance → Zone D is immediately visible on the right side.`;
  }

  // How to book
  if (m.includes('how to book') || m.includes('book a slot') || m.includes('how do i book') || m.includes('booking')) {
    return `📖 **How to Book a Slot:**\n\n1️⃣ Click the **🗺️ Map View** tab\n2️⃣ Look for 🟢 **green markers** (available)\n3️⃣ Click any green marker on the map\n4️⃣ A popup appears — click **"Book This Slot"**\n5️⃣ Confirm in the dialog box\n\n✅ Done! Your slot is reserved.\n\nOr use the **🅿️ All Slots** tab for a grid view.`;
  }

  // How to release
  if (m.includes('release') || m.includes('leave') || m.includes('free my slot') || m.includes('exit')) {
    return `🚗 **How to Release Your Slot:**\n\n1️⃣ You'll see a blue **"Active Booking"** banner at the top\n2️⃣ Click the **"Release Slot"** button\n3️⃣ Your slot is now free for others\n\n⚠️ Please release your slot as soon as you leave so others can use it!`;
  }

  // Map help
  if (m.includes('map') || m.includes('navigate') || m.includes('location') || m.includes('where is')) {
    return `🗺️ **Map Navigation Tips:**\n\n• 🟢 **Green pins** = Available (click to book)\n• 🔴 **Red pins** = Occupied\n• 🟡 **Yellow pins** = Reserved\n• 🏛️ **Building icon** = Main entrance\n• 📍 Click **"Find my location"** button on map\n• Switch between **Street** and **Satellite** view\n• Filter slots by Zone or Status using the buttons above the map\n• Zoom in/out with scroll wheel`;
  }

  // Slot types
  if (m.includes('type') || m.includes('vehicle') || m.includes('which zone') || m.includes('what zone')) {
    return `🚦 **Parking Zones by Vehicle Type:**\n\n🚗 **Zone A** → Cars only\n🏍️ **Zone B** → Bikes/Motorcycles\n🚲 **Zone C** → Bicycles\n🅿️ **Zone D** → Any vehicle\n\nTip: Book a slot matching your vehicle type for easier access!`;
  }

  // Occupied / full
  if (m.includes('full') || m.includes('no slot') || m.includes('occupied') || m.includes('no space')) {
    const avail = (slots || []).filter(s => s.status === 'AVAILABLE').length;
    if (avail > 0) return `🟢 Good news! There are still **${avail} available slots**.\n\nCheck the 🗺️ Map View or filter by zone to find one quickly!`;
    return `😔 All slots are currently occupied.\n\nTips:\n• Check back in 10-15 minutes\n• Enable auto-refresh (every 15 sec)\n• Try Zone D which has general parking`;
  }

  // Help menu
  if (m.includes('help') || m.includes('what can you do') || m.includes('options') || m.includes('menu')) {
    return `🤖 **ParkBot Help Menu:**\n\nHere's what I can answer:\n\n📍 **Navigation**\n• "How to reach Zone A"\n• "Where is bike parking"\n\n🅿️ **Booking**\n• "How to book a slot"\n• "How to release my slot"\n• "My current booking"\n\n📊 **Availability**\n• "Show available slots"\n• "Is Zone B free"\n\n🗺️ **Map**\n• "How to use the map"\n• "What do colors mean"\n\nJust type your question naturally!`;
  }

  // Count / stats
  if (m.includes('how many') || m.includes('count') || m.includes('total slot') || m.includes('stats')) {
    const total = (slots || []).length;
    const avail = (slots || []).filter(s => s.status === 'AVAILABLE').length;
    const occ = (slots || []).filter(s => s.status === 'OCCUPIED').length;
    return `📊 **Current Parking Stats:**\n\n🅿️ Total Slots: **${total}**\n🟢 Available: **${avail}**\n🔴 Occupied: **${occ}**\n\nOccupancy rate: **${total ? Math.round((occ/total)*100) : 0}%**`;
  }

  // Goodbye
  if (/bye|goodbye|thanks|thank you|ok thanks/.test(m))
    return `👋 You're welcome! Happy parking! 🚗\n\nRemember to release your slot when you leave. See you!`;

  // Default fallback
  return `🤔 I'm not sure about that. Try asking:\n\n• "Show available slots"\n• "How to book a slot"\n• "Where is Zone A"\n• "My current booking"\n• "Help" for full menu\n\nOr type your question differently!`;
};

export default function ChatBot({ slots, myBooking }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: `👋 Hi! I'm **ParkBot**!\n\nI can help you find parking slots, navigate zones, and answer questions.\n\nType **"help"** to see what I can do!`, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = BOT_RESPONSES(input, slots, myBooking);
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: new Date() }]);
      setTyping(false);
      if (!open) setUnread(n => n + 1);
    }, 700);
  };

  const handleOpen = () => { setOpen(true); setUnread(0); };

  const quickReplies = ['Available slots', 'My booking', 'How to book', 'Zone guide', 'Help'];

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <div style={{
        position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      }}>
        {!open && (
          <button onClick={handleOpen} style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #0f4c75)',
            border: '2px solid rgba(0,212,255,0.4)',
            boxShadow: '0 4px 20px rgba(0,212,255,0.4)',
            cursor: 'pointer', fontSize: '26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2s infinite',
            position: 'relative'
          }}>
            🤖
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#ff4757', color: 'white',
                fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-dark)'
              }}>{unread}</div>
            )}
          </button>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '360px', height: '520px', zIndex: 9999,
          background: 'var(--bg-card)',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatIn 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f4c75, #1b6ca8)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,212,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(0,212,255,0.2)',
                border: '2px solid rgba(0,212,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px'
              }}>🤖</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '15px' }}>ParkBot</div>
                <div style={{ fontSize: '11px', color: '#00e676' }}>● Online — Always here to help</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer',
              width: '30px', height: '30px', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px', alignItems: 'flex-end'
              }}>
                {msg.from === 'bot' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(0,212,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #00d4ff, #0f4c75)'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  fontSize: '13px', lineHeight: '1.6',
                  color: 'var(--text-primary)'
                }}>
                  {formatText(msg.text)}
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textAlign: 'right' }}>
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#00d4ff', animation: `bounce 1.2s ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div style={{
            padding: '8px 12px', display: 'flex', gap: '6px',
            flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(() => send(), 50); }}
                style={{
                  padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(0,212,255,0.25)',
                  background: 'rgba(0,212,255,0.08)', color: '#00d4ff',
                  fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: '10px', alignItems: 'center'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '12px', color: 'var(--text-primary)',
                fontFamily: 'DM Sans, sans-serif', fontSize: '13px', outline: 'none'
              }}
            />
            <button onClick={send} style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00d4ff, #0f4c75)',
              border: 'none', cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 4px 20px rgba(0,212,255,0.4)} 50%{box-shadow:0 4px 30px rgba(0,212,255,0.7)} }
        @keyframes chatIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </>
  );
}