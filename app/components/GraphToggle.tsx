import { Switch } from '@headlessui/react';

interface GraphToggleProps {
  isAdvanced: boolean;
  onToggle: (isAdvanced: boolean) => void;
}

/**
 * Graph Toggle Component
 * 
 * A reusable component for switching between basic and advanced graph views.
 * Uses Headless UI's Switch component for accessibility and styling.
 */
export default function GraphToggle({ isAdvanced, onToggle }: GraphToggleProps) {
  return (
    <div className="flex items-center justify-end mb-4">
      <span className={`mr-3 text-sm font-medium ${!isAdvanced ? 'text-blue-600' : 'text-gray-500'}`}>
        Basic Graphs
      </span>
      <Switch
        checked={isAdvanced}
        onChange={onToggle}
        className={`${
          isAdvanced ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            isAdvanced ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className={`ml-3 text-sm font-medium ${isAdvanced ? 'text-blue-600' : 'text-gray-500'}`}>
        Advanced Graphs
      </span>
    </div>
  );
} 