import { browserJson } from "@/lib/api/browser";
import type {
  ApiListResponse,
  ModerationComment,
  NotificationRecord,
  RevenueReport,
  StaffAuthResponse,
  StaffProfile,
  StaffSubscriptionRecord,
} from "@/lib/types";

export async function loginStaff(payload: { username: string; password: string }) {
  return browserJson<StaffAuthResponse>("/api/v1/auth/token/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutStaff(accessToken: string) {
  return browserJson<{ detail: string }>("/api/v1/auth/logout/", {
    method: "POST",
  }, accessToken);
}

export async function getStaffMe(accessToken: string) {
  return browserJson<StaffProfile>("/api/v1/auth/me/", { method: "GET" }, accessToken);
}

export async function getRevenueReport(accessToken: string) {
  return browserJson<RevenueReport>(
    "/api/v1/subscriptions/revenue/",
    { method: "GET" },
    accessToken,
  );
}

export async function getAllSubscriptions(accessToken: string) {
  return browserJson<ApiListResponse<StaffSubscriptionRecord>>(
    "/api/v1/subscriptions/all/",
    { method: "GET" },
    accessToken,
  );
}

export async function getModerationQueue(accessToken: string) {
  return browserJson<ApiListResponse<ModerationComment>>(
    "/api/v1/comments/moderation/",
    { method: "GET" },
    accessToken,
  );
}

export async function getNotificationHistory(accessToken: string) {
  return browserJson<ApiListResponse<NotificationRecord>>(
    "/api/v1/notifications/history/",
    { method: "GET" },
    accessToken,
  );
}
