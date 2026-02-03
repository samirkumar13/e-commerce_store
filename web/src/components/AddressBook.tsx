
import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/api';
import Button from './UIElements/Button';
import AddressForm from './AddressForm';
import Modal from './UIElements/Modal';

const AddressBook: React.FC = () => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadAddresses = useCallback(async () => {
        try {
            const data = await apiService.fetchAddresses();
            setAddresses(data);
        } catch (err) {
            console.error("Failed to load addresses", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const handleSave = async (data: any) => {
        if (editingAddress) {
            await apiService.updateAddress(editingAddress.id, data);
        } else {
            await apiService.addAddress(data);
        }
        setIsEditing(false);
        setEditingAddress(null);
        loadAddresses();
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await apiService.deleteAddress(deleteId);
            loadAddresses();
            setDeleteId(null);
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    if (loading) return <div>Loading addresses...</div>;

    if (isEditing) {
        return (
            <AddressForm
                initialData={editingAddress}
                onSubmit={handleSave}
                onCancel={() => { setIsEditing(false); setEditingAddress(null); }}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Addresses</h2>
                <Button onClick={() => setIsEditing(true)} variant="primary">
                    + Add New Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-4">You haven't added any addresses yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${addr.type === 'HOME' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {addr.type}
                                </span>
                                {addr.isDefault && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Default</span>}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{addr.name || addr.user?.name}</h3>
                            <p className="text-slate-600 text-sm whitespace-pre-line mb-3">
                                {addr.street}, {addr.city}<br />
                                {addr.state} - {addr.pincode}<br />
                                Phone: {addr.phone}
                            </p>

                            <div className="flex space-x-3 mt-4 border-t pt-4">
                                <button
                                    onClick={() => { setEditingAddress(addr); setIsEditing(true); }}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteId(addr.id)}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Delete"
                footer={
                    <>
                        <Button onClick={() => setDeleteId(null)} variant="secondary">Cancel</Button>
                        <Button onClick={confirmDelete} variant="primary" className="!bg-red-600 hover:!bg-red-700">Delete</Button>
                    </>
                }
            >
                <p className="text-slate-600">
                    Are you sure you want to delete this address? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default AddressBook;
