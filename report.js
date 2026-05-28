// NaijaVoice - Report/Flag System
// Include this script on feed.html and problem.html

function showReportModal(problemId, problemTitle) {
  const existing = document.getElementById('report-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'report-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1.5rem;';

  const reasons = [
    { value: 'false_info', label: '❌ False information', desc: 'Content is untrue or misleading' },
    { value: 'harassment', label: '😡 Harassment', desc: 'Targeting or attacking an individual' },
    { value: 'hate_speech', label: '🚫 Hate or abuse', desc: 'Hate speech or discriminatory content' },
    { value: 'harmful', label: '⚠️ Harmful content', desc: 'Graphic, violent or dangerous content' },
    { value: 'privacy', label: '🔒 Privacy violation', desc: 'Exposes private personal information' },
    { value: 'spam', label: '📢 Spam', desc: 'Irrelevant or promotional content' },
    { value: 'other', label: '📋 Other', desc: 'Another reason not listed above' },
  ];

  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:2rem;max-width:420px;width:100%;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;">
        <h3 style="font-family:Syne,sans-serif;font-size:1.1rem;font-weight:800;color:#0d1f0f;">🚩 Report This Post</h3>
        <button onclick="document.getElementById('report-modal').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#5a7a5e;">✕</button>
      </div>
      <p style="font-size:0.85rem;color:#5a7a5e;margin-bottom:1.2rem;line-height:1.5;">Help keep NaijaVoice safe. Select why you are reporting this post.</p>
      <div id="report-reasons" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.2rem;">
        ${reasons.map(r => `
          <label style="display:flex;align-items:flex-start;gap:0.8rem;padding:0.8rem;border:1.5px solid #d4e8d6;border-radius:10px;cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#008751'" onmouseout="if(!this.querySelector('input').checked)this.style.borderColor='#d4e8d6'">
            <input type="radio" name="report-reason" value="${r.value}" style="margin-top:3px;accent-color:#008751;flex-shrink:0;"/>
            <div>
              <div style="font-size:0.88rem;font-weight:600;color:#1a2e1c;">${r.label}</div>
              <div style="font-size:0.75rem;color:#5a7a5e;">${r.desc}</div>
            </div>
          </label>`).join('')}
      </div>
      <textarea id="report-details" placeholder="Additional details (optional)..." style="width:100%;padding:0.75rem;border:1.5px solid #d4e8d6;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.88rem;resize:vertical;min-height:70px;outline:none;margin-bottom:1rem;" onfocus="this.style.borderColor='#008751'" onblur="this.style.borderColor='#d4e8d6'"></textarea>
      <div style="display:flex;gap:0.8rem;">
        <button onclick="document.getElementById('report-modal').remove()" style="flex:1;padding:0.8rem;border:1.5px solid #d4e8d6;border-radius:10px;background:transparent;font-size:0.9rem;cursor:pointer;color:#5a7a5e;font-family:'DM Sans',sans-serif;">Cancel</button>
        <button onclick="submitReport('${problemId}','${(problemTitle||'').replace(/'/g,"\\'")}',this)" style="flex:2;padding:0.8rem;border:none;border-radius:10px;background:#e53e3e;color:#fff;font-family:Syne,sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;">🚩 Submit Report</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

async function submitReport(problemId, problemTitle, btn) {
  const reason = document.querySelector('input[name="report-reason"]:checked')?.value;
  if (!reason) {
    alert('Please select a reason for reporting.');
    return;
  }
  const details = document.getElementById('report-details')?.value?.trim() || '';
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    // Save report to Supabase reports table
    const { error } = await _sb.from('reports').insert({
      problem_id: problemId,
      reason,
      details,
      status: 'pending',
      reported_at: new Date().toISOString()
    });

    // Increment report count on the problem
    if (!error) {
      await _sb.rpc('increment_report_count', { problem_id: problemId });
    }

    document.getElementById('report-modal').remove();

    // Show success toast
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerHTML = '🚩 Report submitted. Thank you for keeping NaijaVoice safe!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    } else {
      alert('Report submitted. Thank you!');
    }
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🚩 Submit Report';
    alert('Failed to submit report. Please try again.');
  }
}
