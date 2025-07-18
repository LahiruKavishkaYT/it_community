import React from 'react';
import TabbedCareerView from '../../components/UI/TabbedCareerView';

const BackendMindmap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TabbedCareerView pathId="backend" pathTitle="Backend" />
    </div>
  );
};

export default BackendMindmap; 