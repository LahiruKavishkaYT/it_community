import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventAttendeesForOrganizer, manageAttendeeStatus, checkInAttendee, getEventDashboard, updateEvent } from '../services/api';
import { Event, EventAttendee, AttendeeStatus } from '../types';
import Button from '../components/UI/Button';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';

const EventManagePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [eventData, attendeeData] = await Promise.all([
          getEventById(id),
          getEventAttendeesForOrganizer(id)
        ]);
        setEvent(eventData as Event);
        setAttendees(attendeeData.attendees);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        maxAttendees: event.maxAttendees || '',
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
      });
    }
  }, [event]);

  const handleField = (e:any)=>{
    const {name,value}=e.target;
    setFormData((p:any)=>({...p,[name]:value}));
  };

  const saveChanges = async ()=>{
    if(!id) return;
    await updateEvent(id,{
      title: formData.title,
      description: formData.description,
      maxAttendees: formData.maxAttendees?parseInt(formData.maxAttendees):undefined,
      registrationDeadline: formData.registrationDeadline?new Date(formData.registrationDeadline).toISOString():undefined,
    });
    // refresh
    setEvent(prev=> prev? {...prev, ...formData, maxAttendees:formData.maxAttendees}:prev);
    setEditMode(false);
  };

  const closeRegistration = async ()=>{
    if(!id) return;
    await updateEvent(id,{ status:'COMPLETED'} as any);
    setEvent(prev=> prev? {...prev,status:'COMPLETED'}:prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center text-red-400 py-12">
        {error || 'Event not found'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Manage Event – {event.title}</h1>
      </div>

      {editMode ? (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-white">Edit Event</h2></CardHeader>
          <CardContent className="space-y-4">
            <input name="title" value={formData.title} onChange={handleField} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"/>
            <textarea name="description" value={formData.description} onChange={handleField} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" rows={3}></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Max Attendees</label>
                <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleField} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"/>
              </div>
              <div>
                <label className="text-sm text-gray-300">Registration Deadline</label>
                <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleField} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"/>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={saveChanges}>Save</Button>
              <Button variant="outline" onClick={()=>setEditMode(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex space-x-3">
          <Button onClick={()=>setEditMode(true)}>Edit Event</Button>
          <Button variant="destructive" onClick={closeRegistration}>Close Registration</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Attendees ({attendees.length})</h2>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-300">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {attendees.map(a => (
                <tr key={a.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-2 text-gray-200">{a.name}</td>
                  <td className="px-4 py-2 text-gray-400">{a.email}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {a.status !== 'APPROVED' && (
                      <Button onClick={async () => {
                        await manageAttendeeStatus(event.id, a.id, 'APPROVED' as AttendeeStatus);
                        setAttendees(prev => prev.map(x => x.id === a.id ? { ...x, status: 'APPROVED' } : x));
                      }}>
                        Approve
                      </Button>
                    )}
                    {a.status !== 'DECLINED' && (
                      <Button variant="destructive" onClick={async () => {
                        await manageAttendeeStatus(event.id, a.id, 'DECLINED' as AttendeeStatus);
                        setAttendees(prev => prev.map(x => x.id === a.id ? { ...x, status: 'DECLINED' } : x));
                      }}>
                        Decline
                      </Button>
                    )}
                    {!a.checkedIn && (
                      <Button variant="outline" onClick={async () => {
                        await checkInAttendee(event.id, a.id);
                        setAttendees(prev => prev.map(x => x.id === a.id ? { ...x, checkedIn: true } : x));
                      }}>
                        Check-in
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventManagePage; 