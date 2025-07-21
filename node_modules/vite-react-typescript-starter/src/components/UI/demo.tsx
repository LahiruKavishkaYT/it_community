import React from 'react';
import { GlowCard } from "./SpotlightCard";

export function Default(){
  return(
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor">
      <GlowCard>
        <div className="p-6">
          <h3 className="text-white text-lg font-bold">Demo Card 1</h3>
          <p className="text-gray-300">This is a demo card.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="purple">
        <div className="p-6">
          <h3 className="text-white text-lg font-bold">Demo Card 2</h3>
          <p className="text-gray-300">This is another demo card.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="green">
        <div className="p-6">
          <h3 className="text-white text-lg font-bold">Demo Card 3</h3>
          <p className="text-gray-300">This is a third demo card.</p>
        </div>
      </GlowCard>
    </div>
  );
}; 