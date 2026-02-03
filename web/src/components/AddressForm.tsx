
import React, { useState } from 'react';
import Button from './UIElements/Button';

interface AddressFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        type: initialData?.type || 'HOME',
        name: initialData?.name || '',
        street: initialData?.street || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        pincode: initialData?.pincode || '',
        country: initialData?.country || 'India',
        phone: initialData?.phone || '',
        isDefault: initialData?.isDefault || false
    });
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!/^\d{6}$/.test(formData.pincode)) {
            setError("Please enter a valid 6-digit Pincode.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            setError("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.message || "Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">{initialData ? 'Edit Address' : 'Add New Address'}</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. My Home"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <textarea
                    value={formData.street}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                    rows={2}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input
                        type="text"
                        value={formData.country}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
            </div>

            <div className="mb-6 flex items-center">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-slate-700">Set as default address</label>
            </div>

            <div className="flex justify-end space-x-3">
                <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" disabled={loading} variant="primary">Save Address</Button>
            </div>
        </form>
    );
};

export default AddressForm;
