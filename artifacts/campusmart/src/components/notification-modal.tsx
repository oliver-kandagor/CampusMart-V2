import React, { useState } from "react";
import { Bell, X, Check, ShoppingBag, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "order" | "alert";
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Welcome to CampusMart!",
    message: "Start exploring items from students in your campus.",
    type: "info",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "Sale Confirmed",
    message: "Your 'MacBook Pro' listing has been posted successfully.",
    type: "success",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "New Order",
    message: "Someone is interested in your 'Lab Coat'. Check your orders.",
    type: "order",
    time: "3h ago",
    read: true,
  }
];

interface NotificationModalProps {
  onClose: () => void;
}

export default function NotificationModal({ onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <Check className="w-4 h-4 text-emerald-500" />;
      case "order": return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case "alert": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-[#0A2342]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center sm:items-center sm:pt-0 pt-14">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-border"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-[#0A2342]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#D0282E] text-white text-[10px] font-bold rounded-full">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-[#1A7A4A] hover:bg-[#1A7A4A]/5 px-2 py-1 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 transition-colors flex gap-4 ${n.read ? 'bg-white' : 'bg-[#0A2342]/[0.02]'}`}
              >
                <div className={`mt-0.5 w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                  n.type === 'success' ? 'bg-emerald-50' : 
                  n.type === 'order' ? 'bg-blue-50' : 
                  n.type === 'alert' ? 'bg-red-50' : 'bg-[#0A2342]/5'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-none ${n.read ? 'text-foreground' : 'text-[#0A2342]'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#D0282E] shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No new notifications at the moment.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50/50">
          <button 
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-[#0A2342] bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close Feed
          </button>
        </div>
      </motion.div>
    </div>
  );
}
