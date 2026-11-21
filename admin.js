(() => {
  const choices = ['责骂', '直接纠正', '耐心协作'];
  const intentions = ['更注意表达', '视情况而定', '保持习惯'];
  const languages = { zh: '中文', en: 'English', ko: '한국어' };
  let rows = [];
  let loading = false;

  function renderRows() {
    const filter = document.getElementById('statusFilter').value;
    const visible = rows.filter(row => filter === 'all' || Boolean(row.completed) === (filter === 'complete'));
    const target = document.getElementById('responseRows');
    target.replaceChildren();
    for (const row of visible) {
      const tr = document.createElement('tr');
      const values = [
        new Date(row.created_at).toLocaleString(),
        row.id.slice(0,8),
        languages[row.language],
        choices[row.before_choice],
        choices[row.after_choice] || '未回答',
        intentions[row.intention] || '未回答',
        row.completed ? '已完成' : row.ended ? '提前结束' : '未完成',
        row.turns.length,
      ];
      for (const value of values) {
        const td = document.createElement('td');
        td.textContent = String(value);
        tr.append(td);
      }
      target.append(tr);
    }
    document.getElementById('empty').hidden = visible.length > 0;
  }

  async function refresh() {
    if (loading) return;
    loading = true;
    const status = document.getElementById('status');
    try {
      const response = await fetch('/api/admin/responses', { cache: 'no-store' });
      if (response.status === 401) {
        status.textContent = '登录状态已失效，请刷新页面后重新登录。';
        status.dataset.error = 'true';
        return;
      }
      if (!response.ok) throw new Error();
      const data = await response.json();
      rows = data.rows;
      document.getElementById('total').textContent = data.stats.total;
      document.getElementById('completed').textContent = data.stats.completed;
      document.getElementById('incomplete').textContent = data.stats.total - data.stats.completed;
      document.getElementById('changed').textContent = data.stats.paired ? Math.round(data.stats.changed / data.stats.paired * 100) + '%' : '—';
      status.textContent = '已同步 · ' + new Date().toLocaleTimeString() + ' · 每 5 秒自动更新' +
        (data.stats.total > data.limit ? ' · 表格和导出显示最近 ' + data.limit + ' 份' : '');
      status.dataset.error = 'false';
      renderRows();
    } catch {
      status.textContent = '暂时无法连接，正在自动重试。';
      status.dataset.error = 'true';
    } finally {
      loading = false;
    }
  }

  document.getElementById('statusFilter').addEventListener('change', renderRows);
  setInterval(() => { if (!document.hidden) void refresh(); }, 5000);
  void refresh();
})();
