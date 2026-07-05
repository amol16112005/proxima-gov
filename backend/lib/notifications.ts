import { scheduleActivity } from "./cloud/activityLog";
import { persistNotification } from "./cloud/persist";

export interface Notification {
  id: string;
  citizenId: string;
  issueId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

declare global {
   
  var __proximaNotifications: Notification[] | undefined;
}

function store(): Notification[] {
  if (!global.__proximaNotifications) {
    global.__proximaNotifications = [];
  }
  return global.__proximaNotifications;
}

export function addNotification(citizenId: string, issueId: string, message: string): Notification {
  const n: Notification = {
    id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    citizenId,
    issueId,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  store().unshift(n);
  persistNotification(n);
  scheduleActivity({
    type: "notification.sent",
    summary: message,
    entityType: "notification",
    entityId: n.id,
    citizenId,
    issueId,
  });
  return n;
}

export function getNotificationsByCitizen(citizenId: string): Notification[] {
  return store().filter((n) => n.citizenId === citizenId);
}

export function markNotificationRead(id: string, citizenId: string): boolean {
  const n = store().find((x) => x.id === id && x.citizenId === citizenId);
  if (!n) return false;
  n.read = true;
  persistNotification(n);
  return true;
}

export function markAllRead(citizenId: string): void {
  for (const n of store()) {
    if (n.citizenId === citizenId) {
      n.read = true;
      persistNotification(n);
    }
  }
}