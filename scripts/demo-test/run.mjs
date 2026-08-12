import { api } from '../../lib/api.ts';

let failures = 0;

function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
}

const session0 = await api.getSession();
check('no session before login', session0 === null);

const bad = await api.signIn('nobody@x.com', 'wrong1');
check('bad login rejected', bad.error !== null);

const up = await api.signUp('demo@test.com', 'secret1');
check('signUp creates session', up.session !== null && up.error === null);
check('demo mode active', api.configured === false);

const session = await api.getSession();
check('session persists across getSession', session !== null && session.user.email === 'demo@test.com');

const dup = await api.signUp('demo@test.com', 'secret1');
check('duplicate signUp rejected', dup.error !== null);

let profile = await api.getProfile(session.user.id);
check('profile empty before save', profile !== null && profile.username === null);

const err = await api.upsertProfile({ id: session.user.id, username: 'explorer', full_name: 'Demo Tester' });
check('save profile ok', err === null);

profile = await api.getProfile(session.user.id);
check('profile persisted', profile.username === 'explorer' && profile.full_name === 'Demo Tester');

const dupErr = await api.upsertProfile({ id: 'no-such-user', username: 'x', full_name: 'x' });
check('upsert for unknown user errors', dupErr !== null);

await api.signOut();
const after = await api.getSession();
check('session cleared after signOut', after === null);

const back = await api.signIn('demo@test.com', 'secret1');
check('signIn with saved creds works', back.session !== null);

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
