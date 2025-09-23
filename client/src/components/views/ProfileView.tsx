import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUpdateProfile, type UpdateProfilePayload } from '../../hooks/useProfile';
import { Edit, Save, X } from 'lucide-react';

export const ProfileView = () => {
  const { user } = useAuthStore();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProfilePayload>({});
  
  const updateProfileMutation = useUpdateProfile();

  // If for some reason the user is not available, show a loading message.
  if (!user) {
    return <div>Loading profile...</div>;
  }

  const handleEditField = (field: string) => {
    setEditingField(field);
    setFormData({
      ...formData,
      [field]: user[field as keyof typeof user] || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof UpdateProfilePayload, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  const handleSave = () => {
    if (!user || !editingField) return;
    
    updateProfileMutation.mutate({
      payload: { [editingField]: formData[editingField as keyof UpdateProfilePayload] },
      userId: user.id,
    }, {
      onSuccess: () => {
        setEditingField(null);
        setFormData({});
      },
      onError: (error) => {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      },
    });
  };

  const handleAddressChange = (newAddress: string) => {
    setFormData(prev => ({ ...prev, address: newAddress }));
  };



  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="profile-view flex-1 overflow-y-auto">
        <div className="profile-content pb-8">
          <div className="profile-header mb-8 px-6 py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 px-2">Profile Settings</h1>
              <p className="text-gray-600 text-lg px-2">Manage your business information and preferences</p>
            </div>
          </div>
          
          <div className="profile-form bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6">
          <div className="profile-fields grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="businessName-edit" className="form-label block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                {editingField === 'businessName' ? (
                  <div className="field-edit-mode space-y-3">
                    <input
                      id="businessName-edit"
                      name="businessName"
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="form-input w-full"
                      placeholder="Enter business name"
                      autoComplete="organization"
                    />
                    <div className="field-actions flex items-center gap-2 justify-end">
                      <button onClick={handleSave} className="btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <div className="loading-spinner small"></div> : <Save size={14} />}
                      </button>
                      <button onClick={handleCancelEdit} className="btn-outline btn-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{user.businessName}</span>
                    <button onClick={() => handleEditField('businessName')} className="btn-ghost btn-sm">
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="address-edit" className="form-label block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                {editingField === 'address' ? (
                  <div className="field-edit-mode space-y-3">
                    <textarea
                      id="address-edit"
                      name="address"
                      value={formData.address || ''}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className="form-textarea w-full"
                      placeholder="Enter business address"
                      rows={3}
                      autoComplete="street-address"
                    />
                    
                    <div className="field-actions flex items-center gap-2 justify-end">
                      <button onClick={handleSave} className="btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <div className="loading-spinner small"></div> : <Save size={14} />}
                      </button>
                      <button onClick={handleCancelEdit} className="btn-outline btn-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-gray-900 font-medium">{user.address}</span>
                    </div>
                    <button onClick={() => handleEditField('address')} className="btn-ghost btn-sm">
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="primary-phone-display" className="form-label block text-sm font-medium text-gray-700 mb-2">Primary Phone</label>
                <span id="primary-phone-display" className="text-gray-900 font-medium">{user.phone}</span>
              </div>
            </div>



            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="contactNumber-edit" className="form-label block text-sm font-medium text-gray-700 mb-2">Additional Contact</label>
                {editingField === 'contactNumber' ? (
                  <div className="field-edit-mode space-y-3">
                    <input
                      id="contactNumber-edit"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber || ''}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="form-input w-full"
                      placeholder="Enter additional contact number"
                      autoComplete="tel"
                    />
                    <div className="field-actions flex items-center gap-2 justify-end">
                      <button onClick={handleSave} className="btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <div className="loading-spinner small"></div> : <Save size={14} />}
                      </button>
                      <button onClick={handleCancelEdit} className="btn-outline btn-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{user.contactNumber || <em className="text-gray-500">Not provided</em>}</span>
                    <button onClick={() => handleEditField('contactNumber')} className="btn-ghost btn-sm">
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="email-edit" className="form-label block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {editingField === 'email' ? (
                  <div className="field-edit-mode space-y-3">
                    <input
                      id="email-edit"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="form-input w-full"
                      placeholder="Enter email address"
                      autoComplete="email"
                    />
                    <div className="field-actions flex items-center gap-2 justify-end">
                      <button onClick={handleSave} className="btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <div className="loading-spinner small"></div> : <Save size={14} />}
                      </button>
                      <button onClick={handleCancelEdit} className="btn-outline btn-sm">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="field-display flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{user.email || <em className="text-gray-500">Not provided</em>}</span>
                    <button onClick={() => handleEditField('email')} className="btn-ghost btn-sm">
                      <Edit size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="license-number-display" className="form-label block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <div className="field-display">
                  <span id="license-number-display" className="text-gray-900 font-medium">{user.licenseNumber || <em className="text-gray-500">Not provided</em>}</span>
                  <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                </div>
              </div>
            </div>

            <div className="profile-field bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="field-content">
                <label htmlFor="gst-number-display" className="form-label block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <div className="field-display">
                  <span id="gst-number-display" className="text-gray-900 font-medium">{user.gstNumber || <em className="text-gray-500">Not provided</em>}</span>
                  <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};