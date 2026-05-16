import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, SectionShell } from './ProfileUI';

export const PaymentSection: React.FC = () => {
  const { user, addPaymentMethod, removePaymentMethod } = useContext(AppContext);
  const { t } = useTranslation();

  if (!user) return null;

  const handleAdd = () => {
    const cardNum = prompt(t('profile.payment.prompt.cardNumber'), t('profile.payment.prompt.cardNumberDefault'));
    const expires = prompt(t('profile.payment.prompt.expiration'), t('profile.payment.prompt.expirationDefault'));
    if (cardNum && expires) {
      addPaymentMethod({
        card: cardNum,
        expires,
        isPrimary: (user.paymentMethods || []).length === 0,
        type: 'visa',
      });
    }
  };

  return (
    <SectionShell
      title={t('profile.payment.title')}
      action={<button type="button" onClick={handleAdd} className="btn btn-primary btn-sm rounded-md text-white"><i className="fa-solid fa-plus" />{t('profile.payment.add')}</button>}
    >
      {(user.paymentMethods || []).length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {user.paymentMethods.map(payment => (
            <div key={payment.id} className="rounded-lg border border-base-content/10 bg-base-100 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-black tracking-widest">{payment.card}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-base-content/45">{t('profile.payment.expiresLabel')} {payment.expires}</p>
                </div>
                <button type="button" onClick={() => removePaymentMethod(payment.id)} className="btn btn-ghost btn-xs rounded-md text-error" aria-label={t('profile.payment.remove')}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
              {payment.isPrimary && <span className="mt-4 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">{t('profile.payment.mock.primary')}</span>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="fa-credit-card" title={t('profile.payment.emptyTitle')} text={t('profile.payment.empty')} />
      )}
    </SectionShell>
  );
};
