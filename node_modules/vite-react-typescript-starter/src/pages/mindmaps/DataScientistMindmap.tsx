import React from 'react';
import TabbedCareerView from '../../components/UI/TabbedCareerView';

const DataScientistMindmap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TabbedCareerView pathId="data-scientist" pathTitle="Data Scientist" />
    </div>
  );
};

export default DataScientistMindmap; 