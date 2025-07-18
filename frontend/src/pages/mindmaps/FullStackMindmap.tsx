import React from 'react';
import TabbedCareerView from '../../components/UI/TabbedCareerView';

const FullStackMindmap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TabbedCareerView pathId="fullstack" pathTitle="Full Stack" />
    </div>
  );
};

export default FullStackMindmap; 