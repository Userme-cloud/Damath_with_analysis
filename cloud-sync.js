/* DAMATH MathLab school-managed automatic reporting for new drills.
   Enrollment notices and required institutional/guardian permissions must precede use.
   Previously private drill history is only shared on an explicit import action.
   Supabase RLS limits results to authorized trainers. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const cfg = window.DAMATH_CLOUD_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url || '') &&
    !!cfg.publishableKey && !/YOUR_|PLACEHOLDER/i.test(cfg.publishableKey);
  const queueKey = 'damath-student-pending-v1';
  const ownerKey = 'damath-student-owner-v1';
  const authStorageKey = 'damath-student-auth-v1';
  let client = null, flushing = false, rerun = false, authBlocked = false;
  let nextAttemptAt = 0, pending = {}, errorCount = 0, blockReason = '';
  try { pending = JSON.parse(localStorage.getItem(queueKey) || '{}') || {}; }
  catch (_) { pending = {}; }

  const persist = () => { try { localStorage.setItem(queueKey, JSON.stringify(pending)); } catch (_) {} };
  const count = () => Object.keys(pending).length;
  const status = (message, kind = '') => {
    for (const id of ['cloudSyncStatus','cloudReportStatus']) {
      const el = $(id); if (el) el.textContent = message;
    }
    const banner = $('cloudNotice');
    if (banner) {
      banner.textContent = message;
      banner.hidden = kind !== 'error';
      banner.style.display = kind === 'error' ? 'block' : 'none';
    }
    const retry = $('cloudRetryBtn');
    if (retry) retry.hidden = count() === 0;
  };
  const reportError = error => {
    const code = error?.code || '';
    const msg = String(error?.message || error || 'Network or permissions error');
    if (code === 'anonymous_provider_disabled' || /anonymous sign-ins are disabled/i.test(msg)) {
      authBlocked = true;
      blockReason = 'Training results are safely queued locally: Supabase is currently rejecting student sign-ins (HTTP 422). The school trainer should verify and save “Allow anonymous sign-ins” in Supabase Authentication. Automatic attempts will resume, and Retry sharing is available.';
      nextAttemptAt = Date.now() + 120000;
      status(blockReason, 'error');
      return;
    }
    if (/invalid.+apikey|api key/i.test(msg)) {
      authBlocked = true;
      blockReason = 'Online reporting is paused because the Supabase public connection key was rejected. Ask the website organizer to verify the GitHub cloud configuration. Practice is saved locally.';
      nextAttemptAt = Date.now() + 120000;
      status(blockReason, 'error');
      return;
    }
    if (/already syncs for/i.test(msg)) {
      status(msg, 'error'); return;
    }
    errorCount++;
    nextAttemptAt = Date.now() + Math.min(120000, 10000 * Math.pow(2, Math.min(errorCount, 3)));
    status('Online reporting is pending: ' + msg + '. ' + count() + ' saved session(s) remain queued. Retry sharing or reconnect later.', 'error');
  };
  if (configured && window.supabase) {
    client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: { storageKey: authStorageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    status('Trainer reporting is active: each new drill will automatically be sent to your authorized school trainer.');
  } else {
    status('Online reporting is unavailable because the cloud library or configuration is missing. Practice continues locally.', 'error');
  }
  function summarize(answers) {
    const stats = {};
    for (const a of answers || []) {
      const key = ['add','sub','mul','div','chain','endgame'].includes(a.op) ? a.op : 'other';
      const row = stats[key] || (stats[key] = { questions: 0, correct: 0, seconds: 0 });
      row.questions++;
      if (a.correct) row.correct++;
      row.seconds += Number(a.seconds) || 0;
    }
    for (const row of Object.values(stats)) row.seconds = Math.round(row.seconds * 100) / 100;
    return stats;
  }
  function buildRow(session, historic) {
    const answers = session.answers || [];
    const completed = !!(session.done || session.finished);
    return {
      id: session.cloudId, mode: session.mode || 'practice',
      started_at: session.started, finished_at: session.finished || null,
      last_activity_at: historic ? (session.finished || session.started) : new Date().toISOString(),
      target_questions: Math.max(1, Math.min(100, Number(session.config?.count) || 20)),
      answered: answers.length, correct: Number(session.correct) || 0,
      total_seconds: Math.round(answers.reduce((sum, a) => sum + (Number(a.seconds) || 0), 0) * 100) / 100,
      points: Number(session.points) || 0, best_streak: Number(session.bestStreak) || 0,
      operation_stats: summarize(answers),
      finish_reason: completed ? (session.reason || 'complete') : ''
    };
  }
  function record(session, historic = false) {
    if (!client || !session.cloudId) return;
    const name = String(session.name || '').trim();
    if (!name) return;
    let owner;
    try { owner = localStorage.getItem(ownerKey); } catch (_) { owner = null; }
    if (owner && owner.toLowerCase() !== name.toLowerCase()) {
      reportError(new Error('This browser already syncs for "' + owner + '". Each learner must use a separate browser profile.'));
      return;
    }
    if (!owner) { try { localStorage.setItem(ownerKey, name); } catch (_) {} }
    pending[session.cloudId] = { name, grade: session.cloudGrade || '', row: buildRow(session, historic) };
    persist();
    if (authBlocked) status(blockReason, 'error');
    else status(count() + ' practice session(s) are queued for automatic trainer upload.');
    flush();
  }
  async function flush(force = false) {
    if (!client || !navigator.onLine || count() === 0) return;
    if (flushing) { rerun = true; return; }
    if (authBlocked && !force && Date.now() < nextAttemptAt) return;
    if (authBlocked && Date.now() >= nextAttemptAt) { authBlocked = false; blockReason = ''; }
    if (!force && Date.now() < nextAttemptAt) return;
    if (force) { authBlocked = false; blockReason = ''; nextAttemptAt = 0; }
    flushing = true;
    try {
      let user;
      const found = await client.auth.getUser();
      if (!found.error) user = found.data?.user;
      if (!user) {
        const signedIn = await client.auth.signInAnonymously();
        if (signedIn.error) throw signedIn.error;
        user = signedIn.data?.user;
      }
      if (!user?.id) throw new Error('No student authentication session was obtained.');
      if (user.is_anonymous === false) {
        throw new Error('This browser has a regular account instead of a student anonymous login. Use a separate student browser profile.');
      }
      let uploaded = 0;
      for (const id of Object.keys(pending)) {
        const snapshot = pending[id];
        if (!snapshot) continue;
        const profile = {
          player_id: user.id, display_name: snapshot.name, grade: snapshot.grade,
          last_active_at: snapshot.row.last_activity_at
        };
        const profileResult = await client.from('damath_players').upsert(profile, { onConflict: 'player_id' });
        if (profileResult.error) throw profileResult.error;
        const sessionResult = await client.from('damath_sessions').upsert({ ...snapshot.row, player_id: user.id }, { onConflict: 'id' });
        if (sessionResult.error) throw sessionResult.error;
        if (pending[id] === snapshot) { delete pending[id]; persist(); uploaded++; }
      }
      errorCount = 0; nextAttemptAt = 0;
      status(uploaded + ' practice report(s) uploaded. ' + (count() ? count() + ' newer update(s) still queued.' : 'Your trainer can now view the results.'));
    } catch (error) {
      reportError(error);
    } finally {
      flushing = false;
      if (rerun) { rerun = false; if (!authBlocked && Date.now() >= nextAttemptAt) setTimeout(() => flush(), 500); }
    }
  }
  function uploadSavedPractice() {
    const name = $('playerName')?.value.trim();
    if (!name) { status('Enter your student name before uploading previous practice.', 'error'); return; }
    const owner = localStorage.getItem(ownerKey);
    if (owner && owner.toLowerCase() !== name.toLowerCase()) {
      reportError(new Error('This browser already syncs for "' + owner + '". Use a separate browser profile for another student.'));
      return;
    }
    let store;
    try { store = JSON.parse(localStorage.getItem('damath-mathlab-v1') || '{}'); } catch (_) { store = {}; }
    const history = (store.sessions || []).filter(s => (s.name || '').trim().toLowerCase() === name.toLowerCase()).sort((a,b)=>String(a.started).localeCompare(String(b.started)));
    if (!history.length) { status('No previous practice sessions were found locally for this player.'); return; }
    if (!window.confirm('These ' + history.length + ' earlier practice session(s) may have been created before automatic reporting was introduced. Do you have the necessary school and student/guardian permission to share these older records for "' + name + '" with the authorized trainer? Click OK only if authorized.')) return;
    for (const s of history) {
      if (!s.cloudId) s.cloudId = crypto.randomUUID();
    }
    try { localStorage.setItem('damath-mathlab-v1', JSON.stringify(store)); } catch (_) {}
    for (const s of history) {
      record({ ...s, cloudShare: true, cloudGrade: $('playerGrade')?.value || '', done: true }, true);
    }
    flush(true);
  }
  window.DAMATHCloud = {
    enabled: !!client,
    started(session) {
      session.cloudShare = true; // Legacy field retained for compatibility; all NEW school-managed drills sync automatically.
      session.cloudGrade = $('playerGrade')?.value || '';
      session.cloudId = crypto.randomUUID();
      record(session);
    },
    answered: record, finished: record,
    flush: () => flush(true),
    uploadSavedPractice
  };
  $('cloudRetryBtn')?.addEventListener('click', () => {
    status('Retrying queued training reports...');
    flush(true);
  });
  $('cloudUploadHistoryBtn')?.addEventListener('click', uploadSavedPractice);
  window.addEventListener('online', () => flush());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) flush(); });
  if (client && count()) {
    status(count() + ' saved practice report(s) are pending automatic upload.');
    flush();
  }
  if (client) window.setInterval(() => { if (navigator.onLine && !document.hidden && count()) flush(); }, 60000);
})();
