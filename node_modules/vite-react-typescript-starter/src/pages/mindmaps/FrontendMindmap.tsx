import React from 'react';
import TabbedCareerView from '../../components/UI/TabbedCareerView';

const FrontendMindmap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TabbedCareerView pathId="frontend" pathTitle="Frontend" />
    </div>
  );
};

export default FrontendMindmap; 