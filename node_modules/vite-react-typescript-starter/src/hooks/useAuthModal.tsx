import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('continue');
  const [modalFeature, setModalFeature] = useState('this feature');
  const { user } = useAuth();

  const requireAuth = (action: string, feature?: string) => {
    if (!user) {
      setModalAction(action);
      setModalFeature(feature || 'this feature');
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    modalAction,
    modalFeature,
    requireAuth,
    closeModal,
    isAuthenticated: !!user
  };
}; 