import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventAttendeesForOrganizer } from '../services/api';
import { Event, EventAttendee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Loader2 } from 'lucide-react';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const ev = await getEventById(id);
        if (!ev) {
          setError('Event not found');
          return;
        }
        setEvent(ev);
        if (user && ev.organizerId === user.id) {
          try {
            const res = await getEventAttendeesForOrganizer(id);
            const list: EventAttendee[] = Array.isArray(res) ? res : (res as { attendees: EventAttendee[] }).attendees;
            setAttendees(list);
          } catch (_) {
            // ignore attendee load failure
          }
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center mt-12 text-red-400">
        {error || 'Event not found'}
      </div>
    );
  }

  const isOrganizer = user && event.organizerId === user.id;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {isOrganizer ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Attendees ({attendees.length})</h3>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {attendees.length === 0 ? (
              <p className="text-gray-400">No attendees yet.</p>
            ) : (
              <table className="min-w-full text-sm text-gray-200">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a) => (
                    <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-2">{a.name}</td>
                      <td className="px-4 py-2">{a.email || '—'}</td>
                      <td className="px-4 py-2">{a.status}</td>
                      <td className="px-4 py-2">{new Date(a.registeredAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-gray-300">You are not authorized to view attendee details.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventDetailPage; 