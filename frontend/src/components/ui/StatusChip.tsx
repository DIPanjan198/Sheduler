import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, UserCheck } from 'lucide-react';

interface StatusChipProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, size = 'md' }) => {
  const normStatus = status.toUpperCase();

  const getStyleAndIcon = () => {
    switch (normStatus) {
      case 'PENDING':
      case 'OPEN':
      case 'SWAP_PENDING':
        return {
          class: 'chip-pending',
          icon: <Clock className="w-3.5 h-3.5" />,
          defaultText: 'Pending'
        };
      case 'APPROVED':
      case 'COMPLETED':
      case 'CLOCKED IN':
      case 'ACTIVE':
        return {
          class: 'chip-approved',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          defaultText: normStatus === 'ACTIVE' ? 'Clocked In' : 'Approved'
        };
      case 'DENIED':
      case 'FLAGGED':
      case 'CANCELLED':
        return {
          class: 'chip-denied',
          icon: <XCircle className="w-3.5 h-3.5" />,
          defaultText: normStatus
        };
      case 'CLAIMED':
        return {
          class: 'chip-pending',
          icon: <UserCheck className="w-3.5 h-3.5" />,
          defaultText: 'Claimed (Pending Approval)'
        };
      default:
        return {
          class: 'chip-open',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          defaultText: label || status
        };
    }
  };

  const { class: className, icon, defaultText } = getStyleAndIcon();

  return (
    <span className={`${className} ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : ''}`}>
      {icon}
      <span>{label || defaultText}</span>
    </span>
  );
};
