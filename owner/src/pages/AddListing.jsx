import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { listingService } from '../api/listingService';
import toast from 'react-hot-toast';

const roomTypes = ['single', 'double', 'flat', 'PG'];
const furnishingTypes = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const amenityList = ['wifi', 'ac', 'parking', 'water', 'electricity', 'security', 'lift', 'gym'];

const initialState = {
  description: '',
  type: 'single',
  rent: '',
  deposit: '',
  sqft: '',
  floor: '',
  totalFloors: '',
  furnishing: 'semi-furnished',
  address: '',
  city: '',
  state: '',
  pincode: '',
  lat: '',
  lng: '',
  nearbyPlaces: '',
  locationSummary: '',
  amenities: {},
  petsAllowed: false,
  smokingAllowed: false,
  genderPreference: 'any',
  otherRules: '',
};

export default function AddListing() {
  const [form, setForm] = useState(initialState);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!form.description.trim()) { toast.error('Description is required'); return false; }
    if (!form.rent) { toast.error('Rent is required'); return false; }
    if (!form.sqft) { toast.error('Square footage is required'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.address.trim()) { toast.error('Address is required'); return false; }
    if (!form.city.trim()) { toast.error('City is required'); return false; }
    if (!form.state.trim()) { toast.error('State is required'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('rent', form.rent);
      fd.append('deposit', form.deposit || '0');
      fd.append('sqft', form.sqft);
      fd.append('floor', form.floor || '1');
      fd.append('totalFloors', form.totalFloors || '1');
      fd.append('furnishing', form.furnishing);
      fd.append('address', form.address);
      fd.append('city', form.city);
      fd.append('state', form.state);
      fd.append('pincode', form.pincode);
      fd.append('lat', form.lat || '0');
      fd.append('lng', form.lng || '0');
      fd.append('nearbyPlaces', JSON.stringify(form.nearbyPlaces ? form.nearbyPlaces.split(',').map((s) => s.trim()) : []));
      fd.append('locationSummary', form.locationSummary);
      fd.append('amenities', JSON.stringify(form.amenities));
      fd.append('rules', JSON.stringify({
        petsAllowed: form.petsAllowed,
        smokingAllowed: form.smokingAllowed,
        genderPreference: form.genderPreference,
        otherRules: form.otherRules ? form.otherRules.split('\n').filter(Boolean) : [],
      }));

      images.forEach((img) => fd.append('images', img));

      await listingService.create(fd);
      toast.success('Listing created successfully!');
      navigate('/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const inputClass = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400";
  const labelClass = "block text-sm font-medium text-muted-dark mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Listing</h1>
        <p className="text-muted mt-1">Step {step} of 3 — {['Basic Info', 'Location', 'Media & Rules'][step - 1]}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              s <= step ? 'bg-primary-600 text-white' : 'bg-surface-tertiary text-muted'
            }`}>{s}</div>
            <div className={`h-1 flex-1 rounded-full ${s < step ? 'bg-primary-600' : 'bg-border'}`} />
          </div>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl border border-border p-6 shadow-card space-y-5">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={3} value={form.description} onChange={handleChange('description')}
                placeholder="Describe your property..." className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select value={form.type} onChange={handleChange('type')} className={inputClass}>
                  {roomTypes.map((t) => <option key={t} value={t} className="capitalize">{t === 'PG' ? 'Paying Guest' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Furnishing</label>
                <select value={form.furnishing} onChange={handleChange('furnishing')} className={inputClass}>
                  {furnishingTypes.map((f) => <option key={f} value={f} className="capitalize">{f.replace('-', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rent (₹/month)</label>
                <input type="number" value={form.rent} onChange={handleChange('rent')} placeholder="15000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Deposit (₹)</label>
                <input type="number" value={form.deposit} onChange={handleChange('deposit')} placeholder="30000" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Area (sqft)</label>
                <input type="number" value={form.sqft} onChange={handleChange('sqft')} placeholder="650" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Floor</label>
                <input type="number" value={form.floor} onChange={handleChange('floor')} placeholder="2" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Floors</label>
                <input type="number" value={form.totalFloors} onChange={handleChange('totalFloors')} placeholder="5" className={inputClass} />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={form.address} onChange={handleChange('address')} placeholder="123 Main St" className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={form.city} onChange={handleChange('city')} placeholder="Mumbai" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" value={form.state} onChange={handleChange('state')} placeholder="Maharashtra" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input type="text" value={form.pincode} onChange={handleChange('pincode')} placeholder="400001" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Latitude <span className="text-muted-light">(optional)</span></label>
                <input type="text" value={form.lat} onChange={handleChange('lat')} placeholder="19.0760" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitude <span className="text-muted-light">(optional)</span></label>
                <input type="text" value={form.lng} onChange={handleChange('lng')} placeholder="72.8777" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nearby Places <span className="text-muted-light">(comma separated)</span></label>
              <input type="text" value={form.nearbyPlaces} onChange={handleChange('nearbyPlaces')} placeholder="Metro Station, Mall, Hospital" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location Summary <span className="text-muted-light">(optional)</span></label>
              <textarea rows={2} value={form.locationSummary} onChange={handleChange('locationSummary')}
                placeholder="Close to public transport, walking distance to market..." className={`${inputClass} resize-none`} />
            </div>
          </>
        )}

        {/* Step 3: Media & Rules */}
        {step === 3 && (
          <>
            <div>
              <label className={labelClass}>Images</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" id="imageUpload" />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-light" />
                  <p className="text-sm text-muted">Click to upload images</p>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center text-xs"
                        aria-label="Remove image"
                      ><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {amenityList.map((amenity) => (
                  <label key={amenity} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors capitalize ${
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
                <div>
                  <label className="text-sm text-muted-dark">Gender Preference</label>
                  <select value={form.genderPreference} onChange={handleChange('genderPreference')} className={inputClass}>
                    <option value="any">Any</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-dark">Other Rules <span className="text-muted-light">(one per line)</span></label>
                  <textarea rows={3} value={form.otherRules} onChange={handleChange('otherRules')}
                    placeholder="No parties after 10pm&#10;Visitors must register at gate" className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-dark hover:bg-surface-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div />}
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-success text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Creating...' : 'Publish Listing'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
