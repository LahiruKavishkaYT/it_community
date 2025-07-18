import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import Button from './Button';
import { User } from '../../types';

interface RegistrationData {
  attendeeName: string;
  contactNumber: string;
  dietaryRestrictions?: string;
  emergencyContact?: string;
  notes?: string;
}

const EventRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => Promise<void>;
  currentUser: User | null;
}> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState<RegistrationData>({
    attendeeName: currentUser?.name || '',
    contactNumber: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, attendeeName: currentUser.name }));
    }
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.attendeeName.trim() || !formData.contactNumber.trim()) {
      setError('Name and contact number are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          attendeeName: currentUser?.name || '',
          contactNumber: '',
        });
      }, 1500);
    } catch (err) {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Event Registration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && <div className="bg-red-600/20 text-red-300 p-3 text-sm">{error}</div>}
        {success && (
          <div className="bg-green-600/20 text-green-300 p-3 text-sm flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Registration submitted!</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="attendeeName">Full Name *</label>
              <input id="attendeeName" name="attendeeName" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={formData.attendeeName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="contactNumber">Contact Number *</label>
              <input id="contactNumber" name="contactNumber" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={formData.contactNumber} onChange={handleChange} required placeholder="e.g., +1 555-123-4567" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="dietaryRestrictions">Dietary Restrictions</label>
            <input id="dietaryRestrictions" name="dietaryRestrictions" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={formData.dietaryRestrictions || ''} onChange={handleChange} placeholder="e.g., Vegan, Nut allergy" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="emergencyContact">Emergency Contact</label>
            <input id="emergencyContact" name="emergencyContact" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={formData.emergencyContact || ''} onChange={handleChange} placeholder="Name & phone number" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" value={formData.notes || ''} onChange={handleChange} placeholder="Any additional information" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || success} className="flex items-center space-x-2">
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Submitting...</span></>) : (<span>Register</span>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationModal; 