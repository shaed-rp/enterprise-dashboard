import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { 
  Search, 
  BarChart3, 
  Wrench, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users,
  Calendar,
  FileText,
  Car,
  ClipboardList,
  Handshake,
  Settings,
  LucideIcon
} from 'lucide-react';

// Type definitions
interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions: QuickAction[] = [
  { id: 'executive-dashboard', label: 'Executive Dashboard', icon: BarChart3, action: '/dashboard/executive' },
  { id: 'service-dashboard', label: 'Service Dashboard', icon: Wrench, action: '/dashboard/service' },
  { id: 'sales-dashboard', label: 'Sales Dashboard', icon: TrendingUp, action: '/dashboard/sales' },
  { id: 'parts-dashboard', label: 'Parts Dashboard', icon: Package, action: '/dashboard/parts' },
  { id: 'finance-dashboard', label: 'Finance Dashboard', icon: DollarSign, action: '/dashboard/finance' },
  { id: 'customers', label: 'Customer Management', icon: Users, action: '/customers' },
  { id: 'inventory', label: 'Vehicle Inventory', icon: Car, action: '/inventory' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, action: '/appointments' },
  { id: 'repair-orders', label: 'Repair Orders', icon: ClipboardList, action: '/repair-orders' },
  { id: 'deals', label: 'Sales Deals', icon: Handshake, action: '/deals' },
  { id: 'reports', label: 'Reports & Analytics', icon: FileText, action: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, action: '/settings' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (action: string): void => {
    navigate(action);
    onOpenChange(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border-0 shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search for actions, pages, or data..."
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList className="max-h-96">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              {filteredActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => handleSelect(action.action)}
                  className="flex items-center space-x-3 px-4 py-3"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {search && (
              <CommandGroup heading="Search Results">
                <CommandItem className="flex items-center space-x-3 px-4 py-3">
                  <Search className="h-4 w-4" />
                  <span>Search for "{search}" in all data</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
