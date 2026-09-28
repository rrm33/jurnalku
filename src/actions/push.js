"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import webpush from "web-push";

// Konfigurasi Web Push dengan VAPID dari environment
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:ryanrizqimaulana@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function savePushSubscription(subscription) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return { success: false, error: "No session" };
    
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "siswa") return { success: false, error: "Unauthorized" };

    const { endpoint, keys } = subscription;
    if (!keys || !keys.auth || !keys.p256dh) {
      return { success: false, error: "Invalid subscription" };
    }

    // Save to database
    await prisma.pushSubscription.create({
      data: {
        siswa_id: parseInt(session.id),
        endpoint: endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Save subscription error:", error);
    return { success: false };
  }
}

export async function sendWebPush(siswaIds, title, body, url = "/") {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("VAPID Keys not set, skipping web push");
    return;
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        siswa_id: { in: siswaIds }
      }
    });

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: "/icon-192x192.png"
    });

    const pushPromises = subscriptions.map(sub => {
      return webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        },
        payload
      ).catch(async (err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log("Subscription expired or invalid. Deleting.");
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Error sending push to", sub.endpoint, err);
        }
      });
    });

    await Promise.all(pushPromises);
  } catch (error) {
    console.error("Send push error:", error);
  }
}
