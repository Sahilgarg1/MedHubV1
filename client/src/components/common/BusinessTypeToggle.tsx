import { Store, Warehouse } from 'lucide-react';

interface BusinessTypeToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BusinessTypeToggle = ({ value, onChange }: BusinessTypeToggleProps) => {
  return (
    <div className="business-type-toggle">
      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-option ${!value ? 'active' : ''}`}
          onClick={() => onChange(false)}
        >
          <Store size={20} />
          <span>Retailer</span>
          <small>Pharmacy/Medical Store</small>
        </button>
        
        <button
          type="button"
          className={`toggle-option ${value ? 'active' : ''}`}
          onClick={() => onChange(true)}
        >
          <Warehouse size={20} />
          <span>Wholesaler</span>
          <small>Distributor</small>
        </button>
      </div>
    </div>
  );
};
