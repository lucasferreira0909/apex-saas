import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { icons } from 'lucide-react';
import { Search, X } from 'lucide-react';

// Common icons for quick access
const COMMON_ICONS = [
  'Home', 'Star', 'Heart', 'CheckCircle', 'Circle', 'Square', 'Triangle',
  'User', 'Users', 'Settings', 'Mail', 'Phone', 'Calendar', 'Clock',
  'Folder', 'File', 'FileText', 'Image', 'Video', 'Music', 'Camera',
  'Target', 'Flag', 'Bookmark', 'Tag', 'Zap', 'Lightbulb', 'Rocket',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'TrendingUp', 'BarChart',
  'MessageCircle', 'MessageSquare', 'Bell', 'AlertCircle', 'Info',
  'Check', 'X', 'Plus', 'Minus', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Globe', 'Map', 'MapPin', 'Navigation', 'Compass',
  'Lock', 'Unlock', 'Key', 'Shield', 'Eye', 'EyeOff',
  'Edit', 'Pencil', 'Trash2', 'Copy', 'Clipboard', 'Download', 'Upload',
  'RefreshCw', 'RotateCw', 'Repeat', 'Shuffle', 'Play', 'Pause', 'Stop',
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Snowflake', 'Flame',
  'Gift', 'Award', 'Trophy', 'Medal', 'Crown', 'Gem'
];

interface IconPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string | null) => void;
  currentIcon?: string | null;
}

export function IconPickerDialog({ open, onOpenChange, onSelect, currentIcon }: IconPickerDialogProps) {
  const [search, setSearch] = React.useState('');

  const filteredIcons = React.useMemo(() => {
    if (!search.trim()) return COMMON_ICONS;
    const searchLower = search.toLowerCase();
    return Object.keys(icons).filter(name => 
      name.toLowerCase().includes(searchLower)
    ).slice(0, 60);
  }, [search]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onOpenChange(false);
    setSearch('');
  };

  const handleRemove = () => {
    onSelect(null);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Ícone</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar ícone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {currentIcon && (
            <Button variant="outline" size="sm" onClick={handleRemove} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Remover ícone atual
            </Button>
          )}
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map(iconName => {
                const IconComponent = icons[iconName as keyof typeof icons];
                if (!IconComponent) return null;
                return (
                  <Button
                    key={iconName}
                    variant={currentIcon === iconName ? 'default' : 'outline'}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleSelect(iconName)}
                    title={iconName}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}