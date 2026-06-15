"use client";

import { useChatSocket } from "@/hooks/useChatSocket";

/**
 * A silent component that establishes the global STOMP WebSocket connection
 * for real-time presence and messages. 
 * Mounted in the dashboard layout.
 */
export default function GlobalSocket() {
  useChatSocket();
  return null;
}
