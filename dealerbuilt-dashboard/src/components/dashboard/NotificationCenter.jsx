import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  MoreHorizontal
} from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { formatRelativeTime } from '../../lib/utils';

const mockNotifications = [
  {
    id: 'notif_1',
    type: 'info',
    title: 'Service Appointment Scheduled',
    message: 'New service appointment for John Doe - 2024 Honda Civic',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
  },
  {
    id: 'notif_2',
    type: 'success',
    title: 'Deal Completed',
    message: 'Sale completed for 2024 Toyota Camry - $28,500',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
  },
  {
    id: 'notif_3',
    type: 'warning',
    title: 'Low Parts Inventory',
    message: 'Oil filters running low - 5 units remaining',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
  },
  {
    id: 'notif_4',
    type: 'error',
    title: 'System Alert',
    message: 'Failed to sync customer data - please retry',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
  },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

export const NotificationCenter = ({ open, onOpenChange }) => {
  const { markNotificationRead } = useDashboard();

  const handleMarkAsRead = (notificationId) => {
    markNotificationRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    mockNotifications.forEach(notification => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4">
            {mockNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              mockNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`relative p-4 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-muted/30 border-border' 
                        : 'bg-card border-border shadow-sm'
                    }`}
                  >
                    {!notification.read && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < mockNotifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            View All Notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

