'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      // 1. Prevent duplicate tracking in same session
      const SESSION_KEY = 'ubos_visitor_session_id';
      let sessionId = sessionStorage.getItem(SESSION_KEY);
      
      if (sessionId) return; // Already tracked this session

      // Generate random uuid for session
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);

      // 2. Gather Metadata
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const ref = urlParams.get('ref') || urlParams.get('fbclid') || urlParams.get('gclid');
      
      let trafficSource = 'Direct Landing';
      if (utmSource) trafficSource = `UTM: ${utmSource}`;
      else if (ref) trafficSource = `Referral/Ads: ${ref}`;
      else if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          trafficSource = `Referred from: ${referrerUrl.hostname}`;
        } catch {
          trafficSource = `Referred from: ${document.referrer}`;
        }
      }

      const ua = navigator.userAgent;
      let deviceType = 'Desktop';
      if (/android/i.test(ua)) deviceType = 'Mobile Android';
      else if (/iPad|iPhone|iPod/.test(ua)) deviceType = 'Mobile iOS';
      else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

      let browser = 'Unknown Browser';
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
      else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
      else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';

      const deviceInfo = `${deviceType} - ${browser}`;

      // 3. Send to Supabase page_traffic_logs
      try {
        const { error } = await supabase.from('page_traffic_logs').insert([{
          session_id: sessionId,
          traffic_source: trafficSource,
          device_info: deviceType,
          browser: browser,
          ref_code: ref || null,
          landing_path: window.location.pathname,
          status: 'VISITOR_BOUNCE'
        }]);

        if (error) {
          console.error('Failed to log visitor silently:', error);
          alert('ERROR TRACKING: ' + error.message + '\n\nApakah Anda sudah menjalankan SQL untuk RLS Visitor Logs?');
        } else {
          console.log('Visitor tracked successfully!');
        }
      } catch (error) {
        console.error('Failed to log visitor silently:', error);
      }
    };

    trackVisitor();
  }, []);

  return null; // Passive component, renders nothing
}
