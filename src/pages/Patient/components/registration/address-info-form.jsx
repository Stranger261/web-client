import { useState, useEffect } from 'react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';
import { addressAPI } from '../../../../services/addressApi';

export const AddressInfoForm = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false,
  });

  // Load regions on component mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (data.region_code) {
      loadProvinces(data.region_code);
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [data.region_code]);

  // Load cities when province changes
  useEffect(() => {
    if (data.province_code) {
      loadCities(data.province_code);
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [data.province_code]);

  // Load barangays when city changes
  useEffect(() => {
    if (data.city_code) {
      loadBarangays(data.city_code);
    } else {
      setBarangays([]);
    }
  }, [data.city_code]);

  const loadRegions = async () => {
    setLoading(prev => ({ ...prev, regions: true }));
    try {
      const response = await addressAPI.getRegions();

      let regionsArray = [];

      // FIXED: Access the data from response.data
      if (response && response.success && Array.isArray(response.data)) {
        regionsArray = response.data;
      } else if (Array.isArray(response)) {
        regionsArray = response;
      } else if (response && typeof response === 'object') {
        // Fallback: try to extract array from object
        regionsArray = Object.values(response).find(Array.isArray) || [];
      }

      // Format for Select component
      const formattedRegions = regionsArray.map(region => ({
        value: region.region_code,
        label: region.region_name,
      }));

      setRegions(formattedRegions);
    } catch (error) {
      console.error('Failed to load regions:', error);
      setErrors({ region_code: 'Failed to load regions' });
      setRegions([]);
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  const loadProvinces = async regionCode => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const response = await addressAPI.getProvinces(regionCode);

      let provincesArray = [];

      // FIXED: Use the same pattern for all API calls
      if (response && response.success && Array.isArray(response.data)) {
        provincesArray = response.data;
      } else if (Array.isArray(response)) {
        provincesArray = response;
      } else if (response && typeof response === 'object') {
        provincesArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedProvinces = provincesArray.map(province => ({
        value: province.province_code,
        label: province.province_name,
      }));

      setProvinces(formattedProvinces);

      // Clear dependent fields
      onChange({ province_code: '', city_code: '', barangay_code: '' });
    } catch (error) {
      console.error('Failed to load provinces:', error);
      setErrors({ province_code: 'Failed to load provinces' });
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async provinceCode => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const response = await addressAPI.getCities(provinceCode);

      let citiesArray = [];

      if (response && response.success && Array.isArray(response.data)) {
        citiesArray = response.data;
      } else if (Array.isArray(response)) {
        citiesArray = response;
      } else if (response && typeof response === 'object') {
        citiesArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedCities = citiesArray.map(city => ({
        value: city.city_code,
        label: `${city.city_name} (${city.city_type || 'City'})`,
      }));

      setCities(formattedCities);

      // Clear dependent fields
      onChange({ city_code: '', barangay_code: '' });
    } catch (error) {
      console.error('Failed to load cities:', error);
      setErrors({ city_code: 'Failed to load cities' });
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadBarangays = async cityCode => {
    setLoading(prev => ({ ...prev, barangays: true }));
    try {
      const response = await addressAPI.getBarangays(cityCode);

      let barangaysArray = [];

      if (response && response.success && Array.isArray(response.data)) {
        barangaysArray = response.data;
      } else if (Array.isArray(response)) {
        barangaysArray = response;
      } else if (response && typeof response === 'object') {
        barangaysArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedBarangays = barangaysArray.map(barangay => ({
        value: barangay.barangay_code,
        label: barangay.barangay_name,
      }));

      setBarangays(formattedBarangays);

      // Clear dependent field
      onChange({ barangay_code: '' });
    } catch (error) {
      console.error('Failed to load barangays:', error);
      setErrors({ barangay_code: 'Failed to load barangays' });
      setBarangays([]);
    } finally {
      setLoading(prev => ({ ...prev, barangays: false }));
    }
  };

  const handleChange = (field, value) => {
    onChange({ [field]: value });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = [
      'barangay_code',
      'city_code',
      'province_code',
      'region_code',
    ];

    required.forEach(field => {
      if (!data[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Address Information
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            console.log('Current state:', {
              regions,
              provinces,
              cities,
              barangays,
              data,
              loading,
            })
          }
          className="text-xs"
        >
          Debug State
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="House Number"
          name="house_number"
          value={data.house_number || ''}
          onChange={e => handleChange('house_number', e.target.value)}
          placeholder="e.g., 123"
        />

        <Input
          label="Block Number"
          name="block_number"
          value={data.block_number || ''}
          onChange={e => handleChange('block_number', e.target.value)}
          placeholder="e.g., 5A"
        />

        <Input
          label="Lot Number"
          name="lot_number"
          value={data.lot_number || ''}
          onChange={e => handleChange('lot_number', e.target.value)}
          placeholder="e.g., 12"
        />

        <Input
          label="Building Name"
          name="building_name"
          value={data.building_name || ''}
          onChange={e => handleChange('building_name', e.target.value)}
          placeholder="e.g., Sunshine Tower"
        />

        <Input
          label="Floor/Unit"
          name="floor_unit"
          value={data.floor_unit || ''}
          onChange={e => handleChange('floor_unit', e.target.value)}
          placeholder="e.g., 3rd Floor, Unit 301"
        />

        <Input
          label="Subdivision/Village"
          name="subdivision_village"
          value={data.subdivision_village || ''}
          onChange={e => handleChange('subdivision_village', e.target.value)}
          placeholder="e.g., Greenhills Subdivision"
        />
      </div>

      <Input
        label="Street"
        name="street"
        value={data.street || ''}
        onChange={e => handleChange('street', e.target.value)}
        placeholder="Street name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Select
          label="Region"
          name="region_code"
          value={data.region_code || ''}
          onChange={e => handleChange('region_code', e.target.value)}
          options={regions}
          error={errors.region_code}
          loading={loading.regions}
          placeholder="Select Region"
          required
        />

        <Select
          label="Province"
          name="province_code"
          value={data.province_code || ''}
          onChange={e => handleChange('province_code', e.target.value)}
          options={provinces}
          error={errors.province_code}
          loading={loading.provinces}
          disabled={!data.region_code || regions.length === 0}
          placeholder="Select Province"
          required
        />

        <Select
          label="City/Municipality"
          name="city_code"
          value={data.city_code || ''}
          onChange={e => handleChange('city_code', e.target.value)}
          options={cities}
          error={errors.city_code}
          loading={loading.cities}
          disabled={!data.province_code || provinces.length === 0}
          placeholder="Select City"
          required
        />

        <Select
          label="Barangay"
          name="barangay_code"
          value={data.barangay_code || ''}
          onChange={e => handleChange('barangay_code', e.target.value)}
          options={barangays}
          error={errors.barangay_code}
          loading={loading.barangays}
          disabled={!data.city_code || cities.length === 0}
          placeholder="Select Barangay"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="ZIP Code"
          name="postal_code"
          value={data.postal_code || ''}
          onChange={e => handleChange('postal_code', e.target.value)}
          placeholder="e.g., 1000"
        />
      </div>

      <Input
        label="Additional Address Notes"
        name="address_notes"
        value={data.address_notes || ''}
        onChange={e => handleChange('address_notes', e.target.value)}
        placeholder="Any additional address information..."
        rows={3}
      />

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to Emergency Contact</Button>
      </div>
    </form>
  );
};
