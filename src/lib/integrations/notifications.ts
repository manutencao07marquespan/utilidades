// Notification service for WhatsApp, Email, and Push notifications

interface NotificationConfig {
  enableWhatsApp: boolean
  enableEmail: boolean
  enablePush: boolean
  whatsappNumber: string
  emailRecipients: string[]
}

interface NotificationMessage {
  title: string
  body: string
  type: 'alert' | 'info' | 'warning'
  data?: Record<string, any>
}

// Send WhatsApp notification (placeholder - needs Evolution API or similar)
export async function sendWhatsAppNotification(
  phone: string,
  message: NotificationMessage
): Promise<boolean> {
  console.log(`[WhatsApp] Sending to ${phone}:`, message)
  // In production, integrate with Evolution API or similar
  // Example: await fetch('https://api.evolution.com/message/sendText', {...})
  return true
}

// Send Email notification
export async function sendEmailNotification(
  recipients: string[],
  message: NotificationMessage
): Promise<boolean> {
  console.log(`[Email] Sending to ${recipients.join(', ')}:`, message)
  // In production, integrate with SMTP or email service
  return true
}

// Send Push notification
export async function sendPushNotification(
  userId: string,
  message: NotificationMessage
): Promise<boolean> {
  console.log(`[Push] Sending to user ${userId}:`, message)
  // In production, use Web Push API
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(message.title, {
        body: message.body,
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
      } as NotificationOptions)
      return true
    } catch (e) {
      console.log('Push notification failed:', e)
    }
  }
  return false
}

// Main notification function
export async function sendNotification(
  config: NotificationConfig,
  message: NotificationMessage
): Promise<void> {
  const promises: Promise<boolean>[] = []

  if (config.enableWhatsApp && config.whatsappNumber) {
    promises.push(sendWhatsAppNotification(config.whatsappNumber, message))
  }

  if (config.enableEmail && config.emailRecipients.length > 0) {
    promises.push(sendEmailNotification(config.emailRecipients, message))
  }

  if (config.enablePush) {
    promises.push(sendPushNotification('current', message))
  }

  await Promise.allSettled(promises)
}

// Weather alert notification
export async function sendWeatherAlert(
  config: NotificationConfig,
  alert: { event: string; description: string; severity: string }
): Promise<void> {
  await sendNotification(config, {
    title: `⚠️ ${alert.event}`,
    body: alert.description,
    type: alert.severity === 'critical' ? 'alert' : 'warning',
    data: { alert },
  })
}

// Maintenance alert notification
export async function sendMaintenanceAlert(
  config: NotificationConfig,
  alert: { title: string; equipment: string; priority: string }
): Promise<void> {
  await sendNotification(config, {
    title: `🔧 ${alert.title}`,
    body: `Equipamento: ${alert.equipment} | Prioridade: ${alert.priority}`,
    type: alert.priority === 'critical' ? 'alert' : 'info',
    data: { alert },
  })
}
