import { io, Socket } from "socket.io-client";

export type SaleCreatedPayload = {
  saleId: string;
  customerId: string;
  grandTotal: number;
  createdAt: string;
};

export type LowStockProductPayload = {
  productId: string;
  productName: string;
  sku: string;
  stockQuantity: number;
};

export type LowStockPayload = {
  products: LowStockProductPayload[];
  createdAt: string;
};

interface ServerToClientEvents {
  "socket:ready": (payload: { connected: boolean; userId: string }) => void;

  "sale:created": (payload: SaleCreatedPayload) => void;

  "stock:low": (payload: LowStockPayload) => void;
}

interface ClientToServerEvents {
  "socket:ping": (
    callback: (response: { success: boolean; time: string }) => void,
  ) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/*
 * Only one socket instance is created for the entire application.
 */
export const socket: AppSocket = io(SOCKET_URL, {
  autoConnect: false,

  /*
   * Use Socket.IO's normal polling → WebSocket upgrade flow.
   * This avoids forcing WebSocket first.
   */
  transports: ["polling", "websocket"],

  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

let activeToken: string | null = null;

export const connectSocket = (token: string): AppSocket => {
  if (activeToken !== token) {
    activeToken = token;

    socket.auth = {
      token,
    };

    /*
     * Reconnect when the authentication token changes.
     */
    if (socket.connected) {
      socket.disconnect();
    }
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = (): void => {
  activeToken = null;

  if (socket.connected) {
    socket.disconnect();
  }
};
