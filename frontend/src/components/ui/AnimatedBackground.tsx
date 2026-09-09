import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-animated-mesh select-none">
      {/* Top Left Floating Indigo/Purple Orb */}
      <div className="absolute -top-24 -left-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-indigo-500/20 via-indigo-400/15 to-purple-500/20 blur-3xl animate-orb-1 opacity-70" />

      {/* Top Right Floating Cyan/Teal Orb */}
      <div className="absolute top-10 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-cyan-400/20 via-teal-400/15 to-emerald-400/20 blur-3xl animate-orb-2 opacity-65" />

      {/* Bottom Left Floating Pink/Rose Orb */}
      <div className="absolute -bottom-28 -left-16 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-pink-500/15 via-rose-400/15 to-amber-400/15 blur-3xl animate-orb-3 opacity-60" />

      {/* Bottom Right Floating Indigo/Blue Orb */}
      <div className="absolute bottom-10 right-1/4 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tl from-indigo-600/15 via-blue-500/15 to-sky-400/15 blur-3xl animate-orb-1 opacity-70" />

      {/* Dynamic Animated Grid Pattern Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
    </div>
  );
};

export default AnimatedBackground;
