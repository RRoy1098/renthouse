import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { aiService } from '../../api/aiService';

const INTENTS = [
  'Ask about availability',
  'Negotiate price',
  'Ask about pet policy',
  'Schedule a visit',
  'Ask about move-in date',
  'General inquiry',
];

export default function AiMessageDraft({ listing, onUseDraft }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(INTENTS[0]);
  const [note, setNote] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDraft = async () => {
    if (!selectedIntent) return;
    setLoading(true);
    try {
      const res = await aiService.draftMessage({
        intent: selectedIntent,
        note: note || undefined,
        listing: {
          title: listing?.description?.slice(0, 60) || 'Room',
          price: listing?.rent,
          location: listing?.location?.city || '',
        },
      });
      if (res.success) {
        setDraft(res.data.draft);
      }
    } catch {
      setDraft('Sorry, unable to generate a draft right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!draft) generateDraft();
  };

  const handleUse = () => {
    if (onUseDraft) {
      onUseDraft(draft);
    }
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Draft with AI
        </button>
      ) : (
        <div className="border border-primary-200 rounded-xl p-4 bg-primary-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-gray-900">AI Draft</span>
              <span className="text-[10px] bg-primary-200 text-primary-700 px-1.5 py-0.5 rounded font-medium">AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted hover:text-muted-dark"
            >
              Close
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-dark mb-1">Intent</label>
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            >
              {INTENTS.map((intent) => (
                <option key={intent} value={intent}>{intent}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-dark mb-1">
              Optional note <span className="text-muted-light">(extra details)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. I'm a student looking for long-term..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-dark mb-1">Draft</label>
            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                <span className="text-sm text-muted">Generating draft...</span>
              </div>
            ) : (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none bg-white"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUse}
              disabled={loading || !draft}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              Use Message
            </button>
            <button
              onClick={generateDraft}
              disabled={loading}
              className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-dark hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </>
  );
}
