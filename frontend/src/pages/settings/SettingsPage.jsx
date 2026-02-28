import { useState } from 'react'
import { User, Lock, LogOut, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import useAuthStore from '../../stores/authStore'
import { useLogout, useCurrentUser } from '../../hooks/useAuth'
import api from '../../api/client'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const logout = useLogout()
  const { refetch } = useCurrentUser()

  const [editProfile, setEditProfile] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleProfileSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.put('/users/me/profile', profileForm)
      await refetch()
      setEditProfile(false)
      setMessage('Profile updated')
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.put('/users/me/password', passwordForm)
      setChangePassword(false)
      setPasswordForm({ current_password: '', new_password: '' })
      setMessage('Password changed')
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 max-w-xl">
        {/* User info */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold">
            {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {message && (
          <p className={`text-sm px-4 py-2 rounded-xl ${message.includes('Failed') || message.includes('failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </p>
        )}

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
          <button
            onClick={() => { setEditProfile(!editProfile); setChangePassword(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-slate-50"
          >
            <User className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-sm text-slate-700 text-left">Edit Profile</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => { setChangePassword(!changePassword); setEditProfile(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-slate-50"
          >
            <Lock className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-sm text-slate-700 text-left">Change Password</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-slate-50"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="flex-1 text-sm text-red-600 text-left">Sign Out</span>
          </button>
        </div>

        {/* Edit Profile Form */}
        {editProfile && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Change Password Form */}
        {changePassword && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                minLength={8}
              />
            </div>
            <button
              onClick={handlePasswordSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
