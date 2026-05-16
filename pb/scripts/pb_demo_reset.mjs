/**
 * Resets demo user passwords and enables the demo UI flag.
 *
 * Environment overrides:
 * - PB_URL or VITE_POCKETBASE_URL
 * - PB_SUPERUSER_EMAIL or PB_ADMIN_EMAIL
 * - PB_SUPERUSER_PASSWORD or PB_ADMIN_PASSWORD
 * - PB_DEMO_PASSWORD
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL || 'admin@electroprice.com';
const SUPERUSER_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD || 'test1234';
const DEMO_PASSWORD = process.env.PB_DEMO_PASSWORD || 'test1234';

const DEMO_USERS = [
  'admin.user@electroprice.com',
  'user@electroprice.com',
  'retailer@electroprice.com',
  'suspended@electroprice.com',
];

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const getFirstRecord = async (collection, filter) => {
  try {
    return await pb.collection(collection).getFirstListItem(filter);
  } catch (error) {
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
};

const setDemoFlag = async () => {
  const page = await pb.collection('system_settings').getList(1, 1);
  const existing = page.items[0];
  if (existing) {
    await pb.collection('system_settings').update(existing.id, { test_mode: true });
    return;
  }

  await pb.collection('system_settings').create({ test_mode: true, maintenance: false });
};

const main = async () => {
  console.log(`connecting to ${PB_URL}`);
  await pb.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASSWORD);
  console.log('authenticated as superuser');

  await pb.settings.update({ meta: { passwordMinLength: Math.max(8, DEMO_PASSWORD.length) } }).catch((error) => {
    console.warn('could not update password policy:', error.message);
  });

  await setDemoFlag().catch((error) => {
    console.warn('could not enable system_settings.test_mode; run pb_setup.mjs first:', error.message);
  });

  for (const email of DEMO_USERS) {
    const user = await getFirstRecord('users', pb.filter('email = {:email}', { email }));
    if (!user) {
      console.warn(`user ${email} not found; skipping`);
      continue;
    }

    await pb.collection('users').update(user.id, {
      password: DEMO_PASSWORD,
      passwordConfirm: DEMO_PASSWORD,
      verified: true,
    });
    console.log(`reset ${email}`);
  }

  console.log('Demo reset complete.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
