import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SectionShell } from './ProfileUI';

export const SettingsSection: React.FC = () => {
  const { user, updateUserContactInfo } = useContext(AppContext);
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [phone] = useState(user?.phone ?? '');
  const [emailSecondary1, setEmailSecondary1] = useState(user?.emailSecondary1 ?? '');
  const [emailSecondary2, setEmailSecondary2] = useState(user?.emailSecondary2 ?? '');
  const [phoneSecondary1, setPhoneSecondary1] = useState(user?.phoneSecondary1 ?? '');
  const [phoneSecondary2, setPhoneSecondary2] = useState(user?.phoneSecondary2 ?? '');

  if (!user) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateUserContactInfo({
      name,
      emailSecondary1,
      emailSecondary2,
      phoneSecondary1,
      phoneSecondary2,
    });
  };

  return (
    <SectionShell title={t('profile.settings.title')}>
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.name')}</span>
            <input value={name} onChange={event => setName(event.target.value)} className="input input-bordered rounded-md bg-base-100" />
          </label>
          {email && (
            <label className="form-control">
              <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.email')}</span>
              <input value={email} readOnly disabled className="input input-bordered rounded-md bg-base-300/50 text-base-content/50" />
            </label>
          )}
          {phone && (
            <label className="form-control">
              <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.phone')}</span>
              <input value={phone} readOnly disabled className="input input-bordered rounded-md bg-base-300/50 text-base-content/50" />
            </label>
          )}
          <label className="form-control">
            <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.emailSecondary1')}</span>
            <input type="email" value={emailSecondary1} onChange={event => setEmailSecondary1(event.target.value)} className="input input-bordered rounded-md bg-base-100" placeholder={t('profile.settings.emailSecondary1Placeholder')} />
          </label>
          <label className="form-control">
            <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.emailSecondary2')}</span>
            <input type="email" value={emailSecondary2} onChange={event => setEmailSecondary2(event.target.value)} className="input input-bordered rounded-md bg-base-100" />
          </label>
          <label className="form-control">
            <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.phoneSecondary1')}</span>
            <input type="tel" value={phoneSecondary1} onChange={event => setPhoneSecondary1(event.target.value)} className="input input-bordered rounded-md bg-base-100" />
          </label>
          <label className="form-control">
            <span className="label-text mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">{t('profile.settings.phoneSecondary2')}</span>
            <input type="tel" value={phoneSecondary2} onChange={event => setPhoneSecondary2(event.target.value)} className="input input-bordered rounded-md bg-base-100" />
          </label>
        </div>
        <button type="submit" className="btn btn-primary rounded-md text-white">{t('profile.settings.save')}</button>
      </form>
    </SectionShell>
  );
};
