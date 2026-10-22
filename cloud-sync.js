/* DAMATH MathLab: optional consent-based student progress sync. */
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const cfg = window.DAMATH_CLOUD_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url||'') &&
    !!cfg.publishableKey && !/YOUR_|PLACEHOLDER/i.test(cfg.publishableKey);
  const status = message => { const target=$('cloudSyncStatus'); if(target)target.textContent=message; };
  const queueKey='damath-student-pending-v1', ownerKey='damath-student-owner-v1';
  let client=null, flushing=false, pending={};
  try{pending=JSON.parse(localStorage.getItem(queueKey)||'{}')||{};}catch(e){pending={};}
  const persist=()=>{try{localStorage.setItem(queueKey,JSON.stringify(pending));}catch(e){}};
  if(configured && window.supabase){
    client=window.supabase.createClient(cfg.url,cfg.publishableKey,{
      auth:{storageKey:'damath-student-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
    });
    status('Sharing is available if you opt in below.');
  }else status('Online trainer monitoring is not configured. Practice continues locally.');
  function calculateStats(answers){
    const stats={};
    for(const a of answers||[]){
      const key=['add','sub','mul','div','chain','endgame'].includes(a.op)?a.op:'other';
      const x=stats[key]||(stats[key]={questions:0,correct:0,seconds:0});
      x.questions++; if(a.correct)x.correct++; x.seconds+=Number(a.seconds)||0;
    }
    for(const x of Object.values(stats))x.seconds=Math.round(x.seconds*100)/100;
    return stats;
  }
  function buildRow(s){
    const answers=s.answers||[];
    return {
      id:s.cloudId,mode:s.mode,started_at:s.started,finished_at:s.finished||null,
      last_activity_at:new Date().toISOString(),target_questions:s.config.count,
      answered:answers.length,correct:s.correct||0,
      total_seconds:Math.round(answers.reduce((n,x)=>n+(Number(x.seconds)||0),0)*100)/100,
      points:s.points||0,best_streak:s.bestStreak||0,
      operation_stats:calculateStats(answers),
      finish_reason:s.done?(s.reason||'complete'):''
    };
  }
  function record(s){
    if(!client || !s.cloudShare)return;
    const name=(s.name||'').trim();
    if(!name)return;
    const owner=localStorage.getItem(ownerKey);
    if(owner && owner.toLowerCase()!==name.toLowerCase()){
      status('This browser already syncs for "'+owner+'". Use a separate browser profile for another student.');
      return;
    }
    if(!owner)localStorage.setItem(ownerKey,name);
    pending[s.cloudId]={name,grade:s.cloudGrade||'',row:buildRow(s)};
    persist(); flush();
  }
  async function flush(){
    if(!client||flushing||!navigator.onLine||!Object.keys(pending).length)return;
    flushing=true;
    try{
      let {data:{user},error}=await client.auth.getUser();
      if(error||!user){
        const response=await client.auth.signInAnonymously();
        if(response.error)throw response.error;
        user=response.data.user;
      }
      if(user.is_anonymous===false)throw new Error('Student authentication must be anonymous.');
      for(const id of Object.keys(pending)){
        const snapshot=pending[id]; if(!snapshot)continue;
        const profile={player_id:user.id,display_name:snapshot.name,grade:snapshot.grade,
          last_active_at:snapshot.row.last_activity_at};
        const p=await client.from('damath_players').upsert(profile,{onConflict:'player_id'});
        if(p.error)throw p.error;
        const q=await client.from('damath_sessions').upsert({...snapshot.row,player_id:user.id},{onConflict:'id'});
        if(q.error)throw q.error;
        // Do not erase a newer unanswered snapshot while this request was in flight.
        if(pending[id]===snapshot){delete pending[id];persist();}
      }
      status('Your opted-in training results have been sent to the trainer.');
    }catch(e){
      status('Sharing pending: '+(e.message||'connection error')+'. Local results remain saved.');
    }finally{flushing=false;}
  }
  window.DAMATHCloud={
    enabled:!!client,
    started(s){s.cloudShare=!!($('cloudConsent')&&$('cloudConsent').checked);s.cloudGrade=$('playerGrade')?.value||'';if(s.cloudShare){s.cloudId=crypto.randomUUID();record(s);}},
    answered:record,
    finished:record,
    flush
  };
  window.addEventListener('online',flush);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush();});
  if(client)flush();
})();