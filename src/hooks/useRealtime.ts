import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T> {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onData: (payload: T) => void;
  onError?: (error: Error) => void;
}

export function useRealtime<T = any>({
  table,
  event = '*',
  filter,
  onData,
  onError,
}: UseRealtimeOptions<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create channel name
    const channelName = `realtime:${table}`;
    
    // Create subscription
    let subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter,
        } as any,
        (payload: any) => {
          try {
            onData(payload.new as T);
          } catch (error) {
            if (onError) {
              onError(error as Error);
            } else {
              console.error('Realtime data processing error:', error);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    setChannel(subscription);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    };
  }, [table, event, filter, onData, onError]);

  return { channel, isConnected };
}

// Hook for presence (who's online)
export function usePresence(channelName: string) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [channelName]);

  return { onlineUsers, channel };
}
