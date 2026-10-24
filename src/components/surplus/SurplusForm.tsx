import { useState, type FormEvent } from 'react';
import { PlusCircle, Save, X, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { SurplusListing, Unit } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

function generateId() {
  return `surplus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface SurplusFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (listing: SurplusListing) => void;
}

type FormErrors = Partial<Record<string, string>>;

export function SurplusForm({ open, onClose, onSave }: SurplusFormProps) {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>('kg');
  const [preparedAt, setPreparedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [deadlineHours, setDeadlineHours] = useState('3');
  const [handlingNotes, setHandlingNotes] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!foodItem.trim()) errs.foodItem = 'Food item is required.';
    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) errs.quantity = 'Enter a positive quantity.';
    if (!preparedAt) errs.preparedAt = 'Preparation time is required.';
    const h = parseFloat(deadlineHours);
    if (isNaN(h) || h <= 0 || h > 24) errs.deadlineHours = 'Enter 0.5–24 hours for collection window.';
    if (!contactInfo.trim()) errs.contactInfo = 'Contact info is required for recipients.';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const deadline = new Date(preparedAt);
    deadline.setHours(deadline.getHours() + parseFloat(deadlineHours));

    onSave({
      id: generateId(),
      foodItem: foodItem.trim(),
      quantity: parseFloat(quantity),
      unit,
      preparedAt: new Date(preparedAt).toISOString(),
      collectionDeadline: deadline.toISOString(),
      handlingNotes: handlingNotes.trim() || 'Keep covered and refrigerate if not collected within 2 hours.',
      contactInfo: contactInfo.trim(),
      status: 'Available',
      isDemo: false,
      createdAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="List Surplus Food" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food safety reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-800 flex gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            Only list food that is freshly prepared and safe to consume.
            Hot food must be kept above 60°C or refrigerated below 5°C.
            Do not list food prepared more than 4 hours ago unless refrigerated.
          </span>
        </div>

        <Input
          label="Food Item"
          placeholder="e.g. Chicken Biryani"
          value={foodItem}
          onChange={e => { setFoodItem(e.target.value); setErrors(p => ({ ...p, foodItem: undefined })); }}
          error={errors.foodItem}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="0.1"
            step={unit === 'kg' ? '0.1' : '1'}
            placeholder="0"
            value={quantity}
            onChange={e => { setQuantity(e.target.value); setErrors(p => ({ ...p, quantity: undefined })); }}
            error={errors.quantity}
          />
          <Select
            label="Unit"
            value={unit}
            onChange={e => setUnit(e.target.value as Unit)}
            options={[
              { value: 'kg', label: 'Kilograms (kg)' },
              { value: 'portions', label: 'Portions' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prepared At"
            type="datetime-local"
            value={preparedAt}
            onChange={e => setPreparedAt(e.target.value)}
            error={errors.preparedAt}
          />
          <Input
            label="Collection Window (hours)"
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={deadlineHours}
            onChange={e => { setDeadlineHours(e.target.value); setErrors(p => ({ ...p, deadlineHours: undefined })); }}
            error={errors.deadlineHours}
            helper="How long until food is no longer safe to distribute"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">Handling Notes</label>
          <textarea
            value={handlingNotes}
            onChange={e => setHandlingNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Keep covered. Refrigerate within 2 hours. Do not reheat twice."
            className="w-full border border-stone-200 rounded-xl py-2 px-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
          />
        </div>

        <Input
          label="Contact / Pickup Location"
          placeholder="e.g. Canteen Manager — Block A Kitchen, Ext 201"
          value={contactInfo}
          onChange={e => { setContactInfo(e.target.value); setErrors(p => ({ ...p, contactInfo: undefined })); }}
          error={errors.contactInfo}
          helper="Recipients need this to arrange pickup"
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            <Save className="h-4 w-4" /> List Surplus
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface AddSurplusButtonProps {
  onClick: () => void;
}

export function AddSurplusButton({ onClick }: AddSurplusButtonProps) {
  return (
    <Button onClick={onClick} variant="primary">
      <PlusCircle className="h-4 w-4" />
      List Surplus
    </Button>
  );
}

// ─── Surplus Card ──────────────────────────────────────────────────────────────

interface SurplusCardProps {
  listing: SurplusListing;
  onStatusChange: (id: string, status: SurplusListing['status'], reservedBy?: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE_COLORS: Record<SurplusListing['status'], string> = {
  Available: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  Reserved:  'bg-amber-50 text-amber-800 border-amber-200/80',
  Collected: 'bg-blue-50 text-blue-800 border-blue-200/80',
  Expired:   'bg-stone-100 text-stone-500 border-stone-200/60',
};

function timeRemaining(deadline: string): { label: string; urgent: boolean } {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { label: 'Deadline passed', urgent: true };
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  const urgent = mins < 60;
  return {
    label: hours > 0 ? `${hours}h ${remainMins}m remaining` : `${mins}m remaining`,
    urgent,
  };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function SurplusCard({ listing, onStatusChange, onDelete }: SurplusCardProps) {
  const [reserveModal, setReserveModal] = useState(false);
  const [reserverName, setReserverName] = useState('');
  const { label: timeLeft, urgent } = timeRemaining(listing.collectionDeadline);
  const isActive = listing.status === 'Available' || listing.status === 'Reserved';

  return (
    <>
      <div className="p-1 rounded-2xl bg-gradient-to-b from-stone-200/60 to-stone-200/30 ring-1 ring-stone-900/5 shadow-card transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between">
        <div className="bg-white rounded-[calc(1rem-0.25rem)] border border-stone-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] p-5 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold font-display text-stone-900 text-base tracking-tight">{listing.foodItem}</p>
                  {listing.isDemo && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-xl font-extrabold font-display text-forest-700 mt-1">
                  {listing.quantity} <span className="text-xs font-semibold text-stone-400 uppercase">{listing.unit}</span>
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${STATUS_BADGE_COLORS[listing.status]}`}>
                {listing.status === 'Available' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {listing.status === 'Reserved' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                {listing.status}
              </span>
            </div>

            {/* Time info */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-stone-500">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                <span>Prep: {formatDateTime(listing.preparedAt)}</span>
              </div>
              <span className={`font-semibold ${urgent && isActive ? 'text-red-600 animate-pulse' : 'text-stone-700'}`}>
                {isActive ? timeLeft : `Deadline: ${formatDateTime(listing.collectionDeadline)}`}
              </span>
            </div>

            {urgent && isActive && (
              <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200/80 rounded-xl p-2.5 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>Time-critical: Food approaching safe consumption window. Expedite pickup!</span>
              </div>
            )}

            {/* Handling + Contact */}
            <div className="bg-stone-50/70 border border-stone-200/50 rounded-xl p-3 space-y-2 text-xs">
              <div>
                <p className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">Handling & Hygiene</p>
                <p className="text-stone-600 mt-0.5 leading-relaxed">{listing.handlingNotes}</p>
              </div>
              <div className="pt-1.5 border-t border-stone-200/60">
                <p className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">Pickup Location & Contact</p>
                <p className="text-stone-600 mt-0.5">{listing.contactInfo}</p>
              </div>
              {listing.reservedBy && (
                <div className="pt-1.5 border-t border-stone-200/60 flex items-center gap-1 text-emerald-800 font-semibold">
                  <span>Reserved for:</span>
                  <span className="font-bold">{listing.reservedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-2">
            {listing.status === 'Available' && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 rounded-xl font-bold py-2"
                  onClick={() => setReserveModal(true)}
                >
                  Claim / Reserve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl font-semibold border-stone-200 text-stone-600"
                  onClick={() => onStatusChange(listing.id, 'Expired')}
                >
                  Mark Expired
                </Button>
              </div>
            )}

            {listing.status === 'Reserved' && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 rounded-xl font-bold py-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                  onClick={() => onStatusChange(listing.id, 'Collected')}
                >
                  Confirm Pickup
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl font-semibold border-stone-200 text-stone-600"
                  onClick={() => onStatusChange(listing.id, 'Available')}
                >
                  Cancel Hold
                </Button>
              </div>
            )}

            {(listing.status === 'Collected' || listing.status === 'Expired') && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs font-semibold text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                onClick={() => onDelete(listing.id)}
              >
                Archive Listing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reserve modal */}
      <Modal open={reserveModal} onClose={() => setReserveModal(false)} title="Reserve Surplus" size="sm">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-800">
            <strong>Simulated workflow:</strong> In a real deployment, this would notify the recipient organisation.
            For now, enter the volunteer/recipient name to mark this as reserved.
          </div>
          <Input
            label="Reserved by (name or organisation)"
            placeholder="e.g. Student Welfare Team"
            value={reserverName}
            onChange={e => setReserverName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setReserveModal(false)} className="flex-1">Cancel</Button>
            <Button
              variant="primary"
              disabled={!reserverName.trim()}
              onClick={() => {
                onStatusChange(listing.id, 'Reserved', reserverName.trim());
                setReserveModal(false);
              }}
              className="flex-1"
            >
              Confirm Reserve
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
