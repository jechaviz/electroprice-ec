import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, SectionShell } from './ProfileUI';

export const AddressesSection: React.FC = () => {
  const { user, addAddress, removeAddress } = useContext(AppContext);
  const { t } = useTranslation();

  if (!user) return null;

  const handleAdd = () => {
    const line1 = prompt(t('profile.addresses.prompt.line1'));
    const line2 = prompt(t('profile.addresses.prompt.line2'));
    if (line1 && line2) {
      addAddress({ line1, line2, isPrimary: (user.addresses || []).length === 0 });
    }
  };

  return (
    <SectionShell
      title={t('profile.addresses.title')}
      action={<button type="button" onClick={handleAdd} className="btn btn-primary btn-sm rounded-md text-white"><i className="fa-solid fa-plus" />{t('profile.addresses.add')}</button>}
    >
      {(user.addresses || []).length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {user.addresses.map(address => (
            <div key={address.id} className="rounded-lg border border-base-content/10 bg-base-100 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold text-base-content/75">
                  <p>{address.line1}</p>
                  <p className="mt-1 text-base-content/50">{address.line2}</p>
                </div>
                <button type="button" onClick={() => removeAddress(address.id)} className="btn btn-ghost btn-xs rounded-md text-error" aria-label={t('profile.addresses.remove')}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
              {address.isPrimary && <span className="mt-4 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">{t('profile.addresses.mock.primary')}</span>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="fa-map-location-dot" title={t('profile.addresses.emptyTitle')} text={t('profile.addresses.empty')} />
      )}
    </SectionShell>
  );
};
