"use client";

import { useEffect, useRef } from "react";
import { savePushSubscription } from "@/actions/push";

const rawKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PUBLIC_VAPID_KEY = rawKey ? rawKey.replace(/['"]+/g, '') : null;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscriber() {
  const subscribed = useRef(false);

  useEffect(() => {
    if (subscribed.current || !PUBLIC_VAPID_KEY) return;
    
    async function registerPush() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
            });
            
            // Send new subscription to server
            if (subscription) {
              await savePushSubscription(JSON.parse(JSON.stringify(subscription)));
              subscribed.current = true;
            }
          } else {
             subscribed.current = true;
          }
        } catch (error) {
          console.error('Service Worker / Push Error:', error);
        }
      }
    }

    // Delay slightly so it doesn't block critical rendering
    setTimeout(() => {
       registerPush();
    }, 2000);

  }, []);

  return null;
}
