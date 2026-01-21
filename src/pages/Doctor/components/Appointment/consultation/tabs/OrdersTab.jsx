import { COLORS } from '../../../../../../configs/CONST';

const OrdersTab = ({ data, onChange, isDarkMode }) => {
  const inputClassName = `w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2`;

  const getInputStyle = () => ({
    backgroundColor: isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.input.background,
    borderColor: isDarkMode ? COLORS.input.borderDark : COLORS.input.border,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  });

  const labelClassName = `block text-sm font-medium mb-1`;
  const getLabelStyle = () => ({
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Laboratory & Imaging Orders
        </h3>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Note: Detailed lab/imaging orders will be created separately after
          saving the consultation.
        </p>
      </div>

      {/* Lab Tests */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Laboratory Tests to Order
        </label>
        <textarea
          value={data.lab_tests_ordered || ''}
          onChange={e => onChange('lab_tests_ordered', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={4}
          placeholder="List lab tests needed (e.g., CBC, Lipid Panel, HbA1c, Urinalysis)..."
        />
      </div>

      {/* Imaging */}
      <div>
        <label className={labelClassName} style={getLabelStyle()}>
          Imaging Studies to Order
        </label>
        <textarea
          value={data.imaging_ordered || ''}
          onChange={e => onChange('imaging_ordered', e.target.value)}
          className={inputClassName}
          style={getInputStyle()}
          rows={4}
          placeholder="List imaging needed (e.g., Chest X-ray, CT Scan, Ultrasound, MRI)..."
        />
      </div>
    </div>
  );
};

export default OrdersTab;
