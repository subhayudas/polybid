import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateVendorApplication } from '@/hooks/useVendorProfile';
import { toast } from 'sonner';
import { Building, Mail, Phone, MapPin, Award, Wrench } from 'lucide-react';

interface VendorApplicationFormProps {
  onSuccess: () => void;
}

export const VendorApplicationForm: React.FC<VendorApplicationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    business_email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    business_license: '',
    tax_id: '',
    capabilities: [] as string[],
    materials_offered: [] as string[],
    certifications: [] as string[],
    business_description: ''
  });

  const createApplication = useCreateVendorApplication();

  const capabilityOptions = [
    '3d_printing',
    'cnc_machining',
    'sheet_metal',
    'injection_molding',
    'vacuum_casting',
    'laser_cutting',
    'welding',
    'assembly',
    'finishing',
    'quality_inspection'
  ];

  const materialOptions = [
    'Aluminum',
    'Stainless Steel',
    'Brass',
    'Copper',
    'Titanium',
    'Steel',
    'ABS',
    'PLA',
    'PETG',
    'Nylon',
    'Polycarbonate',
    'TPU',
    'Resin'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleArrayToggle = (field: 'capabilities' | 'materials_offered' | 'certifications', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.business_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.capabilities.length === 0) {
      toast.error('Please select at least one capability');
      return;
    }

    try {
      await createApplication.mutateAsync({
        ...formData,
        address: Object.values(formData.address).some(v => v) ? formData.address : null,
      });

      toast.success('Application submitted successfully! We will review it and get back to you.');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Vendor Application
          </CardTitle>
          <CardDescription>
            Apply to become a verified vendor and start bidding on orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Business Email *
                  </Label>
                  <Input
                    id="business_email"
                    type="email"
                    value={formData.business_email}
                    onChange={(e) => handleInputChange('business_email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_license">Business License</Label>
                  <Input
                    id="business_license"
                    value={formData.business_license}
                    onChange={(e) => handleInputChange('business_license', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    value={formData.address.zip}
                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Manufacturing Capabilities *
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {capabilityOptions.map(capability => (
                  <label key={capability} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.includes(capability)}
                      onChange={() => handleArrayToggle('capabilities', capability)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">
                      {capability.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Materials Offered</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {materialOptions.map(material => (
                  <label key={material} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.materials_offered.includes(material)}
                      onChange={() => handleArrayToggle('materials_offered', material)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="business_description">Business Description</Label>
              <textarea
                id="business_description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe your business, experience, and what makes you a great vendor partner..."
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createApplication.isPending}
            >
              {createApplication.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
