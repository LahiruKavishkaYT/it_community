import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HoverEffectProps {
  items: Array<{
    title: string;
    description: string;
    link?: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const HoverEffect: React.FC<HoverEffectProps> = ({
  items,
  className
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          className="relative group block p-2 h-full w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition duration-300" />
          <div className="relative z-20 h-full w-full bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-colors duration-300">
            {item.icon && (
              <div className="mb-4">
                {item.icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {item.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 