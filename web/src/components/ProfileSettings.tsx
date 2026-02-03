
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './UIElements/Button';
import * as apiService from '../services/api';

const ProfileSettings: React.FC = () => {
    const { user, login } = useAuth(); // We might need a way to refresh user data without full login
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const updatedUser = await apiService.updateProfile({ name });
            // Ideally update local user context here. For now, rely on storing token/user logic or reload.
            // A quick hack is to reload the page or add a refreshUser method to AuthContext.
            // Let's assume we show success and user sees update on next load.
            sessionStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await apiService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

            {message && (
                <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <form onSubmit={handleUpdateProfile}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" value={user?.email} disabled className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500" />
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed directly.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <Button type="submit" disabled={loading} variant="primary">Update Profile</Button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} variant="secondary">Change Password</Button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
