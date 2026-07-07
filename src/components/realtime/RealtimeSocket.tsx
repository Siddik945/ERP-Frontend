import { useEffect } from "react";

import { useAuth } from "../../context/AuthContext";
import {
  connectSocket,
  disconnectSocket,
  type LowStockPayload,
  type SaleCreatedPayload,
} from "../../lib/socket";
import { useAppDispatch } from "../../redux/hooks";
import {
  addNotification,
  setSocketConnected,
} from "../../redux/notifications/notificationSlice";

const RealtimeSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      dispatch(setSocketConnected(false));
      return;
    }

    const socket = connectSocket(token);

    const handleConnect = () => {
      //   console.log("✅ Socket connected:", socket.id);
      //   console.log("Socket transport:", socket.io.engine?.transport.name);

      dispatch(setSocketConnected(true));
    };

    const handleDisconnect = (reason: string) => {
      //   console.log("❌ Socket disconnected:", reason);
      dispatch(setSocketConnected(false));
    };

    const handleConnectError = (error: Error) => {
      //   console.error("❌ Socket connection error:", error.message);

      dispatch(setSocketConnected(false));
    };

    const handleSocketReady = ({
      userId,
    }: {
      connected: boolean;
      userId: string;
    }) => {
      //   console.log("✅ Real-time server ready for user:", userId);
    };

    const handleSaleCreated = (sale: SaleCreatedPayload) => {
      console.log("🔔 Sale event received:", sale);

      dispatch(
        addNotification({
          type: "success",
          title: "New sale created",
          message:
            `Sale #${sale.saleId.slice(-6)} created. ` +
            `Total: ৳${sale.grandTotal.toLocaleString()}`,
          createdAt: sale.createdAt,
        }),
      );
    };

    const handleLowStock = ({ products, createdAt }: LowStockPayload) => {
      //   console.log("⚠️ Low-stock event received:", products);

      const productNames = products
        .map((product) => `${product.productName} (${product.stockQuantity})`)
        .join(", ");

      dispatch(
        addNotification({
          type: "warning",
          title: "Low stock alert",
          message: productNames,
          createdAt,
        }),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("socket:ready", handleSocketReady);
    socket.on("sale:created", handleSaleCreated);
    socket.on("stock:low", handleLowStock);

    /*
     * The socket may already be connected before listeners
     * are registered.
     */
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      /*
       * Remove only this component's listeners.
       * Do not disconnect here because React StrictMode runs
       * Effect cleanup an extra time in development.
       */
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("socket:ready", handleSocketReady);
      socket.off("sale:created", handleSaleCreated);
      socket.off("stock:low", handleLowStock);
    };
  }, [token, isAuthenticated, dispatch]);

  return null;
};

export default RealtimeSocket;
