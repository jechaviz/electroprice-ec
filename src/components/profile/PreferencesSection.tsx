import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import ToggleSwitch from '../common/ToggleSwitch';
import { SectionShell } from './ProfileUI';

export const PreferencesSection: React.FC = () => {
  const { user, setToast } = useContext(AppContext);
  const { t } = useTranslation();
  const storageKey = user ? `electroprice.preferences.${user.id}` : 'electroprice.preferences.guest';
  const [preferences, setPreferences] = useState({ newsletter: true, promos: false });

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      setPreferences({ ...preferences, ...JSON.parse(stored) });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const preferenceOptions = useMemo(() => ([
    {
      id: 'newsletter' as const,
      title: t('profile.preferences.newsletter.title'),
      description: t('profile.preferences.newsletter.description'),
      icon: 'fa-envelope-open-text',
      tone: 'text-primary',
      checked: preferences.newsletter,
    },
    {
      id: 'promos' as const,
      title: t('profile.preferences.promos.title'),
      description: t('profile.preferences.promos.description'),
      icon: 'fa-tag',
      tone: 'text-secondary',
      checked: preferences.promos,
    },
  ]), [preferences.newsletter, preferences.promos, t]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
    setToast({ message: t('profile.preferences.savedToast'), type: 'success' });
  };

  return (
    <SectionShell title={t('profile.preferences.title')}>
      <form onSubmit={handleSave} className="max-w-3xl space-y-3">
        {preferenceOptions.map(option => (
          <label key={option.title} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-base-content/10 bg-base-100 p-4">
            <span className="flex gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-base-200 ${option.tone}`}>
                <i className={`fa-solid ${option.icon}`} />
              </span>
              <span>
                <span className="block font-bold">{option.title}</span>
                <span className="mt-1 block text-sm text-base-content/50">{option.description}</span>
              </span>
            </span>
            <ToggleSwitch
              checked={option.checked}
              onChange={(event) => setPreferences((current) => ({ ...current, [option.id]: event.target.checked }))}
              tone={option.checked ? 'primary' : 'secondary'}
              size="lg"
            />
          </label>
        ))}
        <button type="submit" className="btn btn-primary rounded-md text-white">{t('profile.preferences.save')}</button>
      </form>
    </SectionShell>
  );
};
