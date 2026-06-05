'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, User, FileText, ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const suggestedBy = formData.get('suggestedBy') as string;

    // Client-side validation
    if (!title || !date || !suggestedBy) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate date format (YYYY-MM-DD with 4-digit year)
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      setError('Invalid date format. Please use YYYY-MM-DD format with 4-digit year');
      setLoading(false);
      return;
    }

    const year = parseInt(dateMatch[1]);
    if (year < 1000 || year > 9999) {
      setError('Year must be exactly 4 digits');
      setLoading(false);
      return;
    }

    // Validate that the date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      setError('Cannot create event with a past date');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date,
          time: time || null,
          suggestedBy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create event');
        setLoading(false);
        return;
      }

      // Redirect to the event page
      router.push(`/event/${data.event.id}`);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setLoading(false);
    }
  }

  // Handle date input to restrict year to 4 digits
  function handleDateInput(e: React.FormEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    const parts = value.split('-');
    if (parts.length >= 1 && parts[0].length > 4) {
      parts[0] = parts[0].substring(0, 4);
      e.currentTarget.value = parts.join('-');
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader>
          <Link href='/' className='text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1 w-fit'>
            <ArrowLeft className='w-3 h-3' />
            Back to Home
          </Link>
          <CardTitle className='text-3xl'>Create New Event</CardTitle>
          <CardDescription>
            Set up your event and invite others to suggest and vote on dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='mb-6 p-4 bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-lg'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='flex items-center gap-2'>
                <FileText className='w-4 h-4 text-primary' />
                Event Title
              </Label>
              <Input
                id='title'
                name='title'
                placeholder='e.g., Team Dinner, Weekend Trip, Birthday Party'
                required
                className='h-12 text-base'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                name='description'
                placeholder='Brief description of the event (optional)'
                className='h-12 text-base'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='suggestedBy' className='flex items-center gap-2'>
                <User className='w-4 h-4 text-primary' />
                Your Name
              </Label>
              <Input
                id='suggestedBy'
                name='suggestedBy'
                placeholder='Enter your name'
                required
                className='h-12 text-base'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date' className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-primary' />
                  Initial Date
                </Label>
                <Input
                  id='date'
                  name='date'
                  type='date'
                  required
                  min={new Date().toISOString().split('T')[0]}
                  onInput={handleDateInput}
                  className='h-12 text-base'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='time' className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-primary' />
                  Time
                </Label>
                <Input
                  id='time'
                  name='time'
                  type='time'
                  className='h-12 text-base'
                />
              </div>
            </div>

            <div className='flex gap-4 pt-4'>
              <Button type='submit' size='lg' className='flex-1 h-12' disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Link href='/'>
                <Button type='button' variant='secondary' size='lg' className='h-12'>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

