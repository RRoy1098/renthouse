import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { listingService } from '../api/listingService';
import toast from 'react-hot-toast';

const roomTypes = ['single', 'double', 'flat', 'PG'];
const furnishingTypes = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const amenityList = ['wifi', 'ac', 'parking', 'water', 'electricity', 'security', 'lift', 'gym'];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getById(id);
        const l = data.data;
        setForm({
          description: l.description || '',
          type: l.type || 'single',
          rent: l.rent || '',
          deposit: l.deposit || '',
          sqft: l.sqft || '',
          floor: l.floor || '',
          totalFloors: l.totalFloors || '',
          furnishing: l.furnishing || 'semi-furnished',
          address: l.location?.address || '',
          city: l.location?.city || '',
          state: l.location?.state || '',
          pincode: l.location?.pincode || '',
          lat: l.location?.coordinates?.coordinates?.[1] || '',
          lng: l.location?.coordinates?.coordinates?.[0] || '',
          nearbyPlaces: l.location?.nearbyPlaces?.join(', ') || '',
          locationSummary: l.location?.locationSummary || '',
          amenities: l.amenities || {},
          petsAllowed: l.rules?.petsAllowed || false,
          smokingAllowed: l.rules?.smokingAllowed || false,
          genderPreference: l.rules?.genderPreference || 'any',
          otherRules: l.rules?.otherRules?.join('\n') || '',
          existingImages: l.images || [],
        });
      } catch (err) {
        toast.error('Failed to load listing');
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [amenity]: !prev.amenities[amenity] },
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'existingImages') {
          if (key === 'amenities') fd.append(key, JSON.stringify(val));
          else if (key === 'otherRules') fd.append('rules', JSON.stringify({
            petsAllowed: form.petsAllowed,
            smokingAllowed: form.smokingAllowed,
            genderPreference: form.genderPreference,
            otherRules: form.otherRules ? form.otherRules.split('\n').filter(Boolean) : [],
          }));
          else if (key === 'nearbyPlaces') fd.append('nearbyPlaces', JSON.stringify(val ? val.split(',').map((s) => s.trim()) : []));
          else if (!['petsAllowed', 'smokingAllowed', 'genderPreference', 'lat', 'lng', 'locationSummary', 'existingImages'].includes(key)) {
            fd.append(key, val);
          }
          else if (key === 'lat' || key === 'lng') fd.append(key, val || '0');
          else if (key === 'locationSummary') fd.append(key, val || '');
        }
      });
      newImages.forEach((img) => fd.append('images', img));

      await listingService.update(id, fd);
      toast.success('Listing updated successfully!');
      navigate('/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  const inputClass = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400";
  const labelClass = "block text-sm font-medium text-muted-dark mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-muted mt-1">Step {step} of 3 — {['Basic Info', 'Location', 'Media & Rules'][step - 1]}</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${s <= step ? 'bg-primary-600 text-white' : 'bg-surface-tertiary text-muted'}`}>{s}</div>
            <div className={`h-1 flex-1 rounded-full ${s < step ? 'bg-primary-600' : 'bg-border'}`} />
          </div>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl border border-border p-6 shadow-card space-y-5">
        {step === 1 && (
          <>
            <div><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={handleChange('description')} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Type</label><select value={form.type} onChange={handleChange('type')} className={inputClass}>{roomTypes.map((t) => <option key={t} value={t} className="capitalize">{t === 'PG' ? 'Paying Guest' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
              <div><label className={labelClass}>Furnishing</label><select value={form.furnishing} onChange={handleChange('furnishing')} className={inputClass}>{furnishingTypes.map((f) => <option key={f} value={f}>{f.replace('-', ' ')}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Rent (₹/month)</label><input type="number" value={form.rent} onChange={handleChange('rent')} className={inputClass} /></div>
              <div><label className={labelClass}>Deposit (₹)</label><input type="number" value={form.deposit} onChange={handleChange('deposit')} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>Area (sqft)</label><input type="number" value={form.sqft} onChange={handleChange('sqft')} className={inputClass} /></div>
              <div><label className={labelClass}>Floor</label><input type="number" value={form.floor} onChange={handleChange('floor')} className={inputClass} /></div>
              <div><label className={labelClass}>Total Floors</label><input type="number" value={form.totalFloors} onChange={handleChange('totalFloors')} className={inputClass} /></div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div><label className={labelClass}>Address</label><input type="text" value={form.address} onChange={handleChange('address')} className={inputClass} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>City</label><input type="text" value={form.city} onChange={handleChange('city')} className={inputClass} /></div>
              <div><label className={labelClass}>State</label><input type="text" value={form.state} onChange={handleChange('state')} className={inputClass} /></div>
              <div><label className={labelClass}>Pincode</label><input type="text" value={form.pincode} onChange={handleChange('pincode')} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Latitude</label><input type="text" value={form.lat} onChange={handleChange('lat')} className={inputClass} /></div>
              <div><label className={labelClass}>Longitude</label><input type="text" value={form.lng} onChange={handleChange('lng')} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Nearby Places</label><input type="text" value={form.nearbyPlaces} onChange={handleChange('nearbyPlaces')} className={inputClass} /></div>
            <div><label className={labelClass}>Location Summary</label><textarea rows={2} value={form.locationSummary} onChange={handleChange('locationSummary')} className={`${inputClass} resize-none`} /></div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className={labelClass}>Images</label>
              {form.existingImages?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.existingImages.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" id="imageUpload" />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-light" />
                  <p className="text-sm text-muted">Click to add more images</p>
                </label>
              </div>
              {newPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {newPreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {amenityList.map((amenity) => (
                  <label key={amenity} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer capitalize ${
                    form.amenities[amenity] ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-border text-muted-dark'
                  }`}>
                    <input type="checkbox" checked={!!form.amenities[amenity]} onChange={() => toggleAmenity(amenity)} className="sr-only" />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Rules</label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {['petsAllowed', 'smokingAllowed'].map((rule) => (
                    <label key={rule} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form[rule]} onChange={handleChange(rule)} className="accent-primary-600" />
                      <span className="capitalize">{rule.replace('Allowed', ' Allowed')}</span>
                    </label>
                  ))}
                </div>
                <div><label className="text-sm text-muted-dark">Gender Preference</label><select value={form.genderPreference} onChange={handleChange('genderPreference')} className={inputClass}>
                  <option value="any">Any</option><option value="male">Male Only</option><option value="female">Female Only</option>
                </select></div>
                <div><label className="text-sm text-muted-dark">Other Rules</label><textarea rows={3} value={form.otherRules} onChange={handleChange('otherRules')} className={`${inputClass} resize-none`} /></div>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-dark hover:bg-surface-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div />}
          {step < 3 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
