/* Anonymous snapshots are queued locally, then acknowledged by the shared server. */
(() => {
  const STORAGE_KEY = 'machine-sensorium.pending.v1';
  const COPY = {
    en: {
      notice: 'Your choices are saved anonymously as you make them, including if you leave early. Typed messages are excluded.',
      waiting: 'Ready to record choices',
      syncing: 'Saving choices…',
      saved: 'Choices saved centrally',
      pending: 'Waiting for connection · retrying automatically',
      unavailable: 'Central collection unavailable at this address',
      admin: 'Manage responses',
    },
    zh: {
      notice: '做出选择后，答案将匿名自动保存；中途退出的选择也会保留。输入的对话原文不会记录。',
      waiting: '做出选择后自动记录',
      syncing: '正在保存选择…',
      saved: '选择已集中保存',
      pending: '等待网络连接，将自动重试',
      unavailable: '此地址尚未连接集中收集服务',
      admin: '管理参与记录',
    },
    ko: {
      notice: '선택할 때마다 익명으로 자동 저장하며, 중간에 나가도 선택은 보관됩니다. 대화 입력 원문은 기록하지 않습니다.',
      waiting: '선택하면 자동 기록됩니다',
      syncing: '선택 저장 중…',
      saved: '중앙 저장 완료',
      pending: '연결 대기 중 · 자동 재시도',
      unavailable: '이 주소에서는 중앙 수집을 사용할 수 없습니다',
      admin: '참여 기록 관리',
    },
  };

  let entries = {};
  let activeId = null;
  let busy = false;
  let available = false;
  let language = 'en';
  let status = 'waiting';

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) entries = stored;
  } catch {
    entries = {};
  }

  function persistQueue() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const merged = {...entries};
      for (const [id, entry] of Object.entries(stored)) {
        if (!entry || typeof entry !== 'object') continue;
        const current = merged[id];
        if (!current || entry.revision > current.revision) merged[id] = entry;
      }
      entries = merged;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The in-memory queue continues to retry while this page is open.
    }
  }

  function renderStatus() {
    const copy = COPY[language];
    const notice = document.getElementById('collectionNotice');
    const label = document.getElementById('collectionStatus');
    if (notice) notice.textContent = copy.notice;
    if (label) {
      label.textContent = copy[status];
      label.dataset.state = status;
    }
    const admin = document.getElementById('manageResponses');
    if (admin) admin.textContent = copy.admin;
  }

  async function flush() {
    if (busy || !available) return;
    busy = true;
    const ids = Object.keys(entries);
    try {
      for (const id of ids) {
        const entry = entries[id];
        if (!entry?.record || entry.acknowledged >= entry.revision) continue;
        const sentRevision = entry.revision;
        if (id === activeId) {
          status = 'syncing';
          renderStatus();
        }
        const response = await fetch('/api/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + entry.token,
          },
          body: JSON.stringify({ ...entry.record, revision: sentRevision }),
          keepalive: true,
        });
        if (!response.ok) throw new Error('Collection rejected');
        const acknowledgement = await response.json();
        entry.acknowledged = Math.max(entry.acknowledged || 0, sentRevision);
        if (entry.acknowledged >= entry.revision) {
          // Keep retry credentials while releasing acknowledged snapshots from older sessions.
          if (id !== activeId) entry.record = null;
        }
        persistQueue();
        if (id === activeId) {
          status = entry.acknowledged >= entry.revision ? 'saved' : 'syncing';
          renderStatus();
        }
        window.dispatchEvent(new CustomEvent('sensorium:saved', { detail: acknowledgement }));
      }
    } catch {
      status = 'pending';
      renderStatus();
    } finally {
      busy = false;
      if (status !== 'pending' && Object.values(entries).some(entry => entry.record && entry.acknowledged < entry.revision)) {
        queueMicrotask(flush);
      }
    }
  }

  function record(snapshot) {
    if (!Number.isInteger(snapshot.before)) return;
    activeId = snapshot.id;
    let entry = entries[activeId];
    if (!entry) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      entry = entries[activeId] = {
        token: Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''),
        revision: 0,
        acknowledged: 0,
      };
    }
    const value = JSON.stringify(snapshot);
    if (entry.record && JSON.stringify(entry.record) === value) return;
    entry.record = snapshot;
    entry.revision += 1;
    persistQueue();
    status = available ? 'syncing' : 'pending';
    renderStatus();
    void flush();
  }

  async function initialise() {
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      if (!response.ok || !(await response.json()).collection) throw new Error();
      available = true;
      document.body.classList.add('central-collection');
      status = Object.values(entries).some(entry => entry.acknowledged < entry.revision) ? 'pending' : 'waiting';
      void flush();
    } catch {
      status = 'unavailable';
    }
    renderStatus();
  }

  window.SensoriumCollection = {
    record,
    flush,
    setLanguage(value) {
      language = COPY[value] ? value : 'en';
      renderStatus();
    },
    async stats() {
      if (!available) return null;
      try {
        const response = await fetch('/api/stats', { cache: 'no-store' });
        return response.ok ? response.json() : null;
      } catch {
        return null;
      }
    },
  };

  window.addEventListener('online', () => { status = 'waiting'; void initialise(); });
  function flushOnExit() {
    if (!available) return;
    for (const entry of Object.values(entries)) {
      if (!entry.record || entry.acknowledged >= entry.revision) continue;
      void fetch('/api/responses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + entry.token},
        body: JSON.stringify({...entry.record, revision: entry.revision}),
        keepalive: true,
      }).catch(() => {});
    }
  }
  window.addEventListener('pagehide', flushOnExit);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnExit();
  });
  setInterval(() => { if (available) void flush(); else void initialise(); }, 15000);
  void initialise();
})();
