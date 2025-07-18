import React from 'react';
import TabbedCareerView from '../../components/UI/TabbedCareerView';

const DevOpsMindmap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TabbedCareerView pathId="devops" pathTitle="DevOps" />
    </div>
  );
};

export default DevOpsMindmap; 