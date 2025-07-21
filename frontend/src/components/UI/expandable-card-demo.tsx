import React from 'react';
import { ProjectStatusCard } from "./expandable-card";

export const ExpandableCardDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Project Status Cards Demo</h2>
      
      <ProjectStatusCard
        title="Frontend Development"
        status="approved"
        description="React-based user interface implementation"
        details={
          <div className="space-y-3">
            <p className="text-gray-300">This project involves building a modern React application with TypeScript and Tailwind CSS.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Component-based architecture</li>
              <li>Responsive design</li>
              <li>Accessibility features</li>
              <li>Performance optimization</li>
            </ul>
          </div>
        }
      />
      
      <ProjectStatusCard
        title="Backend API Development"
        status="pending"
        description="RESTful API with authentication and database integration"
        details={
          <div className="space-y-3">
            <p className="text-gray-300">Building a robust backend API using Node.js and Express.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>JWT Authentication</li>
              <li>Database modeling</li>
              <li>API documentation</li>
              <li>Error handling</li>
            </ul>
          </div>
        }
      />
      
      <ProjectStatusCard
        title="DevOps Pipeline"
        status="rejected"
        description="CI/CD setup and deployment automation"
        details={
          <div className="space-y-3">
            <p className="text-gray-300">Setting up automated deployment and monitoring.</p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Docker containerization</li>
              <li>GitHub Actions</li>
              <li>Monitoring setup</li>
              <li>Security scanning</li>
            </ul>
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">
                <strong>Rejection Reason:</strong> Missing security compliance documentation. Please add security audit reports and compliance certifications.
              </p>
            </div>
          </div>
        }
      />
      
      <ProjectStatusCard
        title="Simple Card"
        status="approved"
        description="This card has no expandable details"
      />
    </div>
  );
};

export default ExpandableCardDemo; 