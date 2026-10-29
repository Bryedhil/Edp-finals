import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Users, Wallet, ReceiptText, ArrowLeftRight, Search, Bell, ChevronDown, Menu, X, ArrowUpRight, ArrowDownRight, CircleDollarSign, UserRound, Download, RefreshCw, CircleHelp, AlertCircle, CheckCircle2, CalendarDays, Filter, Plus, Pencil, Eye, Trash2, MoreHorizontal, GraduationCap, PiggyBank, Landmark, MessageCircle, Sparkles, Send, Bot, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts';
import './styles.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const money = n => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(Number(n || 0));
const dateText = d => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function AdminDashboard({ token, user, onLogout }) {
  const [page, setPage] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [recordEditor, setRecordEditor] = useState(null);
  const [studentEditor, setStudentEditor] = useState(null);
  const [recordMessage, setRecordMessage] = useState('');
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const paths = ['/dashboard', '/students', '/contributions', '/expenses', '/transactions', '/charges'];
      const results = await Promise.all(paths.map(async p => {
        const r = await fetch(`${API}${p}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) throw new Error(`${p} returned HTTP ${r.status}`);
        return r.json();
      }));
      setDashboard(results[0]); setStudents(results[1].data || []); setContributions(results[2].data || []); setExpenses(results[3].data || []); setTransactions(results[4].data || []); setCharges(results[5].data || []); setLastUpdated(new Date());
    } catch (e) {
      setError(`Could not connect to the backend. ${e.message}. Make sure MongoDB and your Express server are running.`);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filteredStudents = useMemo(() => students.filter(s => `${s.name} ${s.studentId} ${s.section} ${s.course || ''} ${s.yearLevel || ''} ${s.status}`.toLowerCase().includes(search.toLowerCase())), [students, search]);
  const filteredContributions = useMemo(() => contributions.filter(c => `${c.studentId?.name || ''} ${c.studentId?.studentId || ''} ${c.description || ''}`.toLowerCase().includes(search.toLowerCase())), [contributions, search]);
  const filteredExpenses = useMemo(() => expenses.filter(e => `${e.description} ${e.category} ${e.recordedBy}`.toLowerCase().includes(search.toLowerCase())), [expenses, search]);
  const filteredTransactions = useMemo(() => transactions.filter(t => `${t.type} ${t.description || ''} ${t.studentId?.name || ''} ${t.category || ''}`.toLowerCase().includes(search.toLowerCase())), [transactions, search]);

  async function deleteRecord(collection, record, label) {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    setRecordMessage('');
    try {
      const response = await fetch(`${API}/${collection}/${record._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Could not delete ${label}.`);
      setRecordMessage(`${label[0].toUpperCase() + label.slice(1)} deleted successfully.`);
      await load();
    } catch (e) { setRecordMessage(e.message); }
  }
  async function toggleExpenseStatus(record) {
    const paymentStatus = (record.paymentStatus || 'unpaid') === 'paid' ? 'unpaid' : 'paid';
    setRecordMessage('');
    try {
      const response = await fetch(`${API}/expenses/${record._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paymentStatus }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not update payment status.');
      setRecordMessage(`Expense marked ${paymentStatus}.`);
      await load();
    } catch (e) { setRecordMessage(e.message); }
  }

  const nav = [
    { name: 'Overview', icon: LayoutDashboard, group: 'WORKSPACE' },
    { name: 'Students', icon: Users },
    { name: 'Student Balances', icon: CircleDollarSign },
    { name: 'Contributions', icon: Wallet },
    { name: 'Expenses', icon: ReceiptText },
    { name: 'Transactions', icon: ArrowLeftRight },
    { name: 'AI Assistant', icon: MessageCircle },
    { name: 'AI Financial Summary', icon: Sparkles },
  ];
  const choosePage = name => { setPage(name); setSearch(''); setMobileOpen(false); };

  return <div className="app-shell">
    {showHelpCenter && <HelpCenterModal role={user.role || 'admin'} onClose={() => setShowHelpCenter(false)} />}
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><PiggyBank size={23} /></div><div><strong>ClassFunds</strong><span>STUDENT EXPENSES</span></div><button className="close-sidebar" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="section-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.name} onClick={() => choosePage(item.name)} className={`nav-item ${page === item.name ? 'active' : ''}`}><item.icon size={19} /><span>{item.name}</span>{item.name === 'Transactions' && <span className="nav-count">{transactions.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Need a hand?</strong><p>Keep your class funds organized and transparent.</p><button onClick={() => setShowHelpCenter(true)}>Help center <ArrowUpRight size={14} /></button></div><div className="profile"><div className="avatar">TR</div><div className="profile-text"><strong>Class Treasurer</strong><span>Administrator</span></div><MoreHorizontal size={19} className="muted-icon" /></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div></div><div className="topbar-right"><div className="connection"><span className={`status-dot ${error ? 'offline' : loading ? 'pending' : 'online'}`}></span>{error ? 'Disconnected' : loading ? 'Connecting…' : 'Live data'}</div><button className="icon-button" title="Refresh data" onClick={load}><RefreshCw size={18} /></button><div className="top-divider" /><button className="user-mini" onClick={onLogout} title="Sign out"><div className="avatar small">{(user.username || "U").slice(0, 2).toUpperCase()}</div><span>{user.username}</span><span>Sign out</span></button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">YOUR CLASS, AT A GLANCE</div><h1>{page === 'Overview' ? 'Financial overview' : page}</h1><p>{page === 'Overview' ? 'A clear picture of your section’s contributions, expenses, and balance.' : page === 'Students' ? 'Keep track of students in your section.' : page === 'Contributions' ? 'Review money collected from students.' : page === 'Expenses' ? 'Track purchases and class spending.' : page === 'AI Assistant' ? 'Ask questions about authorized financial records.' : page === 'AI Financial Summary' ? 'Generate an AI explanation of current student charges and payments.' : 'A combined timeline of money in and money out.'}</p></div><div className="heading-actions"><button className="button secondary" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="button primary" onClick={() => choosePage('Student Balances')}><Plus size={17} /> Manage balances</button></div></div>
        {error && <div className="error-banner"><AlertCircle size={19} /><div><strong>Backend connection issue</strong><p>{error}</p></div><button onClick={load}>Try again</button></div>}
        {page === 'Overview' && <Overview dashboard={dashboard} students={students} contributions={contributions} expenses={expenses} transactions={transactions} loading={loading} choosePage={choosePage} />}
        {page === 'Student Balances' && <StudentBalances token={token} students={students} charges={charges} contributions={contributions} refresh={load} search={search} setSearch={setSearch} />}
        {page === 'Students' && <><SearchBar value={search} onChange={setSearch} placeholder="Search name, student ID, course, year, or section…" /><div className="student-summary-strip"><div><span>Total students</span><strong>{students.length}</strong></div><div><span>Active students</span><strong>{students.filter(s => s.status !== 'inactive').length}</strong></div><div><span>Sections represented</span><strong>{new Set(students.map(s => s.section).filter(Boolean)).size}</strong></div><div><span>Courses represented</span><strong>{new Set(students.map(s => s.course).filter(Boolean)).size}</strong></div></div><div className="table-card"><TableHeader title="Student directory" subtitle={`${filteredStudents.length} of ${students.length} students`} action={<button className="button primary small-button" onClick={() => { setRecordMessage(''); setStudentEditor({}); }}><Plus size={15} /> Add student</button>} />{recordMessage && <div className="record-notice">{recordMessage}</div>}{studentEditor && <StudentEditor key={studentEditor.record?._id || 'new-student'} record={studentEditor.record} token={token} onClose={() => setStudentEditor(null)} onSaved={async message => { setStudentEditor(null); setRecordMessage(message); setSearch(''); await load(); }} />}{loading ? <Loading /> : <StudentsTable rows={filteredStudents} onEdit={record => setStudentEditor({ record })} />}</div></>}
        {page === 'Contributions' && <><SearchBar value={search} onChange={setSearch} placeholder="Search student or contribution…" /><div className="table-card"><TableHeader title="Contribution records" subtitle={`${filteredContributions.length} records`} action={<button className="button secondary small-button" onClick={() => { setRecordMessage(''); setRecordEditor({ type: 'contribution' }); }}><Plus size={15} /> Record contribution</button>} />{recordMessage && <div className="record-notice">{recordMessage}</div>}{recordEditor?.type === 'contribution' && <RecordEditor type="contribution" record={recordEditor.record} students={students} token={token} onClose={() => setRecordEditor(null)} onSaved={async () => { setRecordEditor(null); setRecordMessage('Contribution saved successfully.'); await load(); }} />} {loading ? <Loading /> : <ContributionsTable rows={filteredContributions} onEdit={record => setRecordEditor({ type: 'contribution', record })} onDelete={record => deleteRecord('contributions', record, 'contribution')} />}</div></>}
        {page === 'Expenses' && <><SearchBar value={search} onChange={setSearch} placeholder="Search expense, category, or recorder…" /><div className="table-card"><TableHeader title="Expense records" subtitle={`${filteredExpenses.length} records`} action={<button className="button secondary small-button" onClick={() => { setRecordMessage(''); setRecordEditor({ type: 'expense' }); }}><Plus size={15} /> Add expense</button>} />{recordMessage && <div className="record-notice">{recordMessage}</div>}{recordEditor?.type === 'expense' && <RecordEditor type="expense" record={recordEditor.record} students={students} token={token} onClose={() => setRecordEditor(null)} onSaved={async () => { setRecordEditor(null); setRecordMessage('Expense saved successfully.'); await load(); }} />} {loading ? <Loading /> : <ExpensesTable rows={filteredExpenses} onEdit={record => setRecordEditor({ type: 'expense', record })} onDelete={record => deleteRecord('expenses', record, 'expense')} onTogglePaid={toggleExpenseStatus} />}</div></>}
        {page === 'AI Assistant' && <ChatAssistant token={token} role={user.role} />}
        {page === 'AI Financial Summary' && <AdminFinancialSummary token={token} />}
        {page === 'Transactions' && <><SearchBar value={search} onChange={setSearch} placeholder="Search transactions…" /><div className="table-card"><TableHeader title="All transactions" subtitle={`${filteredTransactions.length} records across contributions and expenses`} action={<button className="button secondary small-button" onClick={() => downloadCSV(filteredTransactions)}><Download size={15} /> Export CSV</button>} />{loading ? <Loading /> : <TransactionsTable rows={filteredTransactions} />}</div></>}
        <footer><span>© 2026 ClassFunds · Student Expense List System</span><span>{lastUpdated ? `Last synced ${lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data'} <span className="footer-dot">●</span></span></footer>
      </div>
    </main>
  </div>;
}

function HelpCenterModal({ role, onClose }) {
  const isStudent = role === 'student';
  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return <div className="help-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <header className="help-modal-header"><div className="help-modal-symbol"><CircleHelp size={22} /></div><div><span className="help-modal-eyebrow">CLASSFUNDS SUPPORT</span><h2 id="help-modal-title">Help center</h2><p>{isStudent ? 'A quick guide to your student portal.' : 'A quick guide to managing your section finances.'}</p></div><button className="help-modal-close" onClick={onClose} aria-label="Close help center"><X size={19} /></button></header>
      {isStudent ? <div className="help-guide-list">
        <article className="help-guide-item"><span>1</span><div><h3>Review your balance</h3><p>The summary cards show your total assigned expenses, total payments recorded, and remaining unpaid balance.</p></div></article>
        <article className="help-guide-item"><span>2</span><div><h3>Check assigned expenses</h3><p>Look at the Assigned expenses section for the items, amounts, and due dates recorded for your account.</p></div></article>
        <article className="help-guide-item"><span>3</span><div><h3>Review payment history</h3><p>Use Payment history to check payments or contributions the administrator has recorded. If something looks wrong, contact your class treasurer.</p></div></article>
        <article className="help-guide-item"><span>4</span><div><h3>Ask Cathrine</h3><p>Use the Cathrine — Expense Assistant section to ask about your own recorded charges, payments, or balance.</p></div></article>
        <article className="help-guide-item"><span>5</span><div><h3>Keep your account safe</h3><p>Never share your password. Sign out when using a shared computer. Use Forgot password on the login screen if you cannot sign in.</p></div></article>
      </div> : <div className="help-guide-list">
        <article className="help-guide-item"><span>1</span><div><h3>Check the Overview</h3><p>Start with the dashboard to review totals and the latest financial activity. Select Refresh if you need to reload the data.</p></div></article>
        <article className="help-guide-item"><span>2</span><div><h3>Manage students</h3><p>Open Students to search the student directory and review student details. Confirm student information before recording charges or payments.</p></div></article>
        <article className="help-guide-item"><span>3</span><div><h3>Manage balances and payments</h3><p>Use Student Balances to assign charges and record payments. Check the student, description, and amount before saving; the remaining balance is calculated from recorded charges and payments.</p></div></article>
        <article className="help-guide-item"><span>4</span><div><h3>Record expenses and contributions</h3><p>Use Contributions to record money received and Expenses to record class spending. Edit or delete records carefully because they affect the financial history.</p></div></article>
        <article className="help-guide-item"><span>5</span><div><h3>Use reports and Cathrine</h3><p>Open Transactions for a combined activity history. AI Financial Summary and Cathrine can help explain the records available to your account; verify important totals against the source records.</p></div></article>
        <article className="help-guide-item"><span>6</span><div><h3>Protect accounts and data</h3><p>Keep admin credentials private, sign out on shared computers, and check records before making changes. If data does not load, check that the backend and MongoDB are running, then select Refresh.</p></div></article>
      </div>}
      <footer className="help-modal-footer"><p>Still need help? Contact your class treasurer or system administrator.</p><button className="button primary" onClick={onClose}>Got it</button></footer>
    </section>
  </div>;
}

function StudentBalances({ token, students, charges, contributions, refresh, search, setSearch }) {
  const [mode, setMode] = useState('charge');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ studentId: '', description: '', amount: '', dueDate: '' });
  const [payment, setPayment] = useState({ studentId: '', amount: '', description: 'Student payment', date: new Date().toISOString().slice(0, 10) });
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const summaries = useMemo(() => students.map(student => {
    const studentCharges = charges.filter(c => (c.student?._id || c.student) === student._id);
    const studentPayments = contributions.filter(c => (c.studentId?._id || c.studentId) === student._id);
    const charged = studentCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const paid = studentPayments.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    return { student, studentCharges, charged, paid, balance: Math.max(0, charged - paid) };
  }).filter(row => `${row.student.name} ${row.student.studentId}`.toLowerCase().includes(search.toLowerCase())), [students, charges, contributions, search]);
  const resetCharge = () => { setEditing(null); setForm({ studentId: '', description: '', amount: '', dueDate: '' }); };
  async function saveCharge(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const url = editing ? `${API}/charges/${editing._id}` : `${API}/charges`;
      const response = await fetch(url, { method: editing ? 'PUT' : 'POST', headers, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not save expense.');
      setMessage(editing ? 'Expense updated successfully.' : 'Expense assigned successfully.'); resetCharge(); await refresh();
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  async function savePayment(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch(`${API}/contributions`, { method: 'POST', headers, body: JSON.stringify(payment) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not record payment.');
      setMessage('Payment recorded. The student balance has been recalculated.'); setPayment({ studentId: '', amount: '', description: 'Student payment', date: new Date().toISOString().slice(0, 10) }); await refresh();
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  async function deleteCharge(charge) {
    if (!window.confirm(`Delete the expense “${charge.description}” for ${charge.student?.name || 'this student'}?`)) return;
    setBusy(true); setMessage('');
    try { const response = await fetch(`${API}/charges/${charge._id}`, { method: 'DELETE', headers }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not delete expense.'); setMessage('Expense deleted.'); if (editing?._id === charge._id) resetCharge(); await refresh(); }
    catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  function editCharge(charge) { setMode('charge'); setEditing(charge); setForm({ studentId: charge.student?._id || '', description: charge.description || '', amount: String(charge.amount || ''), dueDate: charge.dueDate ? new Date(charge.dueDate).toISOString().slice(0, 10) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  return <div className="balance-manager">
    <p className="balance-intro">Assign individual expenses and record payments. Remaining balances are calculated automatically from expenses minus payments.</p>
    <div className="balance-mode-tabs"><button className={mode === 'charge' ? 'selected' : ''} onClick={() => setMode('charge')}><Plus size={15} /> Assign expense</button><button className={mode === 'payment' ? 'selected' : ''} onClick={() => setMode('payment')}><Wallet size={15} /> Record payment</button></div>
    {message && <div className={message.toLowerCase().includes('success') || message.toLowerCase().includes('recorded') || message.toLowerCase().includes('deleted') ? 'balance-message success' : 'balance-message'}>{message}</div>}
    {mode === 'charge' ? <form className="balance-form" onSubmit={saveCharge}>
      <h2>{editing ? 'Edit assigned expense' : 'Assign an expense to a student'}</h2>
      <label>Student<select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}><option value="">Select student</option>{students.map(s => <option key={s._id} value={s._id}>{s.name} · {s.studentId}</option>)}</select></label>
      <label>Expense description<input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Class activity fee" /></label>
      <label>Amount (PHP)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></label>
      <label>Due date (optional)<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label>
      <div className="balance-form-actions"><button className="button primary" disabled={busy} type="submit">{busy ? 'Saving…' : editing ? 'Save changes' : 'Assign expense'}</button>{editing && <button type="button" className="button secondary" onClick={resetCharge}>Cancel edit</button>}</div>
    </form> : <form className="balance-form" onSubmit={savePayment}>
      <h2>Record a student payment</h2>
      <label>Student<select required value={payment.studentId} onChange={e => setPayment({ ...payment, studentId: e.target.value })}><option value="">Select student</option>{students.map(s => <option key={s._id} value={s._id}>{s.name} · {s.studentId}</option>)}</select></label>
      <label>Amount paid (PHP)<input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} placeholder="0.00" /></label>
      <label>Payment description<input value={payment.description} onChange={e => setPayment({ ...payment, description: e.target.value })} placeholder="e.g. Partial payment" /></label>
      <label>Payment date<input required type="date" value={payment.date} onChange={e => setPayment({ ...payment, date: e.target.value })} /></label>
      <div className="balance-form-actions"><button className="button primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Record payment'}</button></div>
    </form>}
    <div className="table-card balance-table-card"><SearchBar value={search} onChange={setSearch} placeholder="Search student by name or ID…" /><TableHeader title="Student balances" subtitle={`${summaries.length} students`} />
      <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>TOTAL EXPENSES</th><th>TOTAL PAID</th><th>REMAINING BALANCE</th><th>STATUS</th></tr></thead><tbody>{summaries.map(row => <tr key={row.student._id}><td><div className="person-cell"><div className="person-avatar">{(row.student.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div><div><strong>{row.student.name}</strong><span>{row.student.studentId}</span></div></div></td><td className="amount">{money(row.charged)}</td><td className="amount positive-text">{money(row.paid)}</td><td className={`amount ${row.balance > 0 ? 'negative-text' : 'positive-text'}`}>{money(row.balance)}</td><td><span className={`status-badge ${row.balance > 0 ? 'inactive' : 'active'}`}><i />{row.charged === 0 ? 'No expenses' : row.balance === 0 ? 'Paid' : row.paid > 0 ? 'Partially paid' : 'Unpaid'}</span></td></tr>)}</tbody></table></div>
    </div>
    <div className="table-card balance-table-card"><TableHeader title="Assigned expense records" subtitle={`${charges.length} individual expenses`} />{charges.length ? <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>EXPENSE</th><th>DUE DATE</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>{charges.map(c => <tr key={c._id}><td>{c.student?.name || 'Unknown student'}</td><td>{c.description}</td><td>{dateText(c.dueDate)}</td><td className="amount">{money(c.amount)}</td><td><button className="row-action" title="Edit expense" onClick={() => editCharge(c)}><Pencil size={15} /></button><button className="row-action danger-action" title="Delete expense" onClick={() => deleteCharge(c)}><X size={15} /></button></td></tr>)}</tbody></table></div> : <Empty label="No individual expenses assigned yet" />}</div>
  </div>;
}

function Overview({ dashboard, students, contributions, expenses, transactions, loading, choosePage }) {
  const balance = dashboard?.remainingBalance ?? 0;
  const chartData = useMemo(() => {
    const all = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    const grouped = {};
    all.forEach(t => { const key = new Date(t.date || Date.now()).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }); running += t.type === 'expense' ? -Number(t.amount) : Number(t.amount); grouped[key] = running; });
    const result = Object.entries(grouped).map(([date, total]) => ({ date, total }));
    if (result.length === 1) result.unshift({ date: 'Start', total: 0 });
    return result.length ? result : [{ date: 'Mon', total: 0 }, { date: 'Tue', total: 0 }, { date: 'Wed', total: 0 }, { date: 'Thu', total: 0 }, { date: 'Fri', total: 0 }];
  }, [transactions]);
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  return <>
    <div className="stats-grid">
      <StatCard label="Total balance" value={money(balance)} note="Contributions minus expenses" icon={CircleDollarSign} tone="violet" trend={balance >= 0 ? 'Funds available' : 'Overspent'} positive={balance >= 0} />
      <StatCard label="Total contributions" value={money(dashboard?.totalContributions)} note="Money collected so far" icon={ArrowDownRight} tone="green" trend={`${contributions.length} records`} positive />
      <StatCard label="Total expenses" value={money(dashboard?.totalExpenses)} note="Money spent by the class" icon={ArrowUpRight} tone="orange" trend={`${expenses.length} records`} positive={false} />
      <StatCard label="Active students" value={dashboard?.studentCount ?? students.length} note="Students in this section" icon={GraduationCap} tone="blue" trend="Section directory" positive />
    </div>
    <div className="overview-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>Balance activity</h2><p>Running balance from recorded transactions</p></div><div className="period-pill"><CalendarDays size={14} /> All time <ChevronDown size={13} /></div></div><div className="chart-summary"><strong>{money(balance)}</strong><span className={balance >= 0 ? 'positive-text' : 'negative-text'}>{balance >= 0 ? 'Available balance' : 'Balance below zero'}</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6b61e8" stopOpacity={0.22} /><stop offset="100%" stopColor="#6b61e8" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f6" /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#98a1b3' }} dy={9} /><Tooltip formatter={v => money(v)} contentStyle={{ borderRadius: 12, border: '1px solid #edf0f6', boxShadow: '0 8px 30px #24365c12' }} /><Area type="monotone" dataKey="total" stroke="#6b61e8" strokeWidth={2.6} fill="url(#balanceFill)" activeDot={{ r: 5, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot" /> Running balance</span><span className="chart-footnote">Based on available transaction history</span></div></section>
      <section className="panel breakdown-panel"><div className="panel-heading"><div><h2>Fund breakdown</h2><p>Where your class funds stand</p></div><div className="round-icon"><Landmark size={17} /></div></div><div className="breakdown-balance"><span>Remaining balance</span><strong>{money(balance)}</strong></div><div className="breakdown-row"><div className="breakdown-label"><span className="break-dot collected" /> <span>Contributions collected</span></div><strong>{money(dashboard?.totalContributions)}</strong></div><div className="mini-track"><span className="track-green" style={{ width: `${dashboard?.totalContributions ? Math.max(0, Math.min(100, (dashboard.totalContributions / Math.max(dashboard.totalContributions, dashboard.totalExpenses, 1)) * 100)) : 0}%` }} /></div><div className="breakdown-row"><div className="breakdown-label"><span className="break-dot spent" /> <span>Total expenses</span></div><strong>{money(dashboard?.totalExpenses)}</strong></div><div className="mini-track"><span className="track-orange" style={{ width: `${dashboard?.totalExpenses ? Math.max(0, Math.min(100, (dashboard.totalExpenses / Math.max(dashboard.totalContributions, dashboard.totalExpenses, 1)) * 100)) : 0}%` }} /></div><div className="breakdown-note"><CheckCircle2 size={16} /><span>{balance >= 0 ? 'Your section currently has funds available.' : 'Expenses are currently higher than contributions.'}</span></div><button className="text-link" onClick={() => choosePage('Transactions')}>View all transactions <ArrowUpRight size={15} /></button></section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest contributions and expenses</p></div><button className="text-link" onClick={() => choosePage('Transactions')}>View all <ArrowUpRight size={15} /></button></div>{loading ? <Loading /> : <TransactionsTable rows={recent} compact />}</section>
    <div className="quick-grid"><button className="quick-card" onClick={() => choosePage('Students')}><div className="quick-icon quick-purple"><Users size={19} /></div><div><strong>Student directory</strong><span>View students and section details</span></div><ArrowUpRight size={17} /></button><button className="quick-card" onClick={() => choosePage('Contributions')}><div className="quick-icon quick-green"><Wallet size={19} /></div><div><strong>Contributions</strong><span>Review collection records</span></div><ArrowUpRight size={17} /></button><button className="quick-card" onClick={() => choosePage('Expenses')}><div className="quick-icon quick-orange"><ReceiptText size={19} /></div><div><strong>Expense tracker</strong><span>See how class funds are spent</span></div><ArrowUpRight size={17} /></button></div>
  </>;
}
function StatCard({ label, value, note, icon: Icon, tone, trend, positive }) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={19} /></div></div><div className="stat-value">{value === undefined || value === null ? '—' : value}</div><div className="stat-bottom"><span>{note}</span><span className={`stat-trend ${positive ? 'good' : 'caution'}`}>{trend}</span></div></div>; }
function SearchBar({ value, onChange, placeholder }) { return <div className="search-row"><div className="search-field"><Search size={18} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></button>}</div><button className="button secondary filter-button" onClick={() => alert('Search filters are available. More advanced filters can be added with backend support.')}><Filter size={16} /> Filters</button></div>; }
function TableHeader({ title, subtitle, action }) { return <div className="table-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>; }
function Loading() { return <div className="loading-state"><div className="spinner" /><span>Loading your data…</span></div>; }
function Empty({ label = 'No records found' }) { return <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><strong>{label}</strong><span>Try another search or refresh your data.</span></div>; }
function StudentsTable({ rows, onEdit }) { return !rows.length ? <Empty label="No students found" /> : <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>COURSE</th><th>YEAR LEVEL</th><th>SECTION</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(s => <tr key={s._id}><td><div className="person-cell"><div className="person-avatar">{(s.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div><div><strong>{s.name}</strong><span>Student profile</span></div></div></td><td><span className="id-chip">{s.studentId}</span></td><td>{s.course || '—'}</td><td>{s.yearLevel || '—'}</td><td>{s.section || '—'}</td><td><span className={`status-badge ${s.status === 'inactive' ? 'inactive' : 'active'}`}><i />{s.status || 'active'}</span></td><td><button className="row-action" title="Edit student" onClick={() => onEdit(s)}><Pencil size={15} /></button></td></tr>)}</tbody></table></div>; }

function StudentEditor({ record, token, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ studentId: record?.studentId || '', name: record?.name || '', course: record?.course || 'BSIT', yearLevel: record?.yearLevel || '1st Year', section: record?.section || '', status: record?.status || 'active' }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/students${record ? `/${record._id}` : ''}`, { method: record ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not save student.');
      await onSaved(record ? 'Student details updated successfully.' : 'Student added successfully.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form className="student-editor" onSubmit={submit}>
    <div className="student-editor-heading"><div><span className="eyebrow">{record ? 'UPDATE STUDENT PROFILE' : 'NEW STUDENT PROFILE'}</span><h3>{record ? 'Edit student details' : 'Add a student'}</h3><p>Students can belong to different courses, year levels, and sections.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close student form"><X size={17}/></button></div>
    <div className="student-form-grid">
      <label>Student ID *<input required value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})} placeholder="e.g. 2026-001"/></label>
      <label>Full name *<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Enter student's full name"/></label>
      <label>Course / program *<input required value={form.course} onChange={e => setForm({...form, course:e.target.value})} placeholder="e.g. BSIT, BSBA, BSED"/></label>
      <label>Year level *<select required value={form.yearLevel} onChange={e => setForm({...form, yearLevel:e.target.value})}>{['1st Year','2nd Year','3rd Year','4th Year','5th Year','Graduate','Other'].map(y => <option key={y}>{y}</option>)}</select></label>
      <label>Section *<input required value={form.section} onChange={e => setForm({...form, section:e.target.value})} placeholder="e.g. BSIT 3-C"/></label>
      <label>Status<select value={form.status} onChange={e => setForm({...form, status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    </div>
    {error && <div className="record-notice error-notice">{error}</div>}
    <div className="student-editor-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : record ? 'Save changes' : 'Add student'}</button><button type="button" className="button secondary" onClick={onClose}>Cancel</button></div>
  </form>;
}
function ContributionsTable({ rows, onEdit, onDelete }) { return !rows.length ? <Empty label="No contributions found" /> : <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>DESCRIPTION</th><th>DATE</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(c => <tr key={c._id}><td><div className="person-cell"><div className="person-avatar green-avatar">{(c.studentId?.name || '??').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div><div><strong>{c.studentId?.name || 'Unknown student'}</strong><span>{c.studentId?.studentId || 'No student ID'}</span></div></div></td><td>{c.description || 'Section contribution'}</td><td>{dateText(c.date)}</td><td className="amount positive-text">+{money(c.amount)}</td><td><div className="row-actions"><button className="row-action" title="Edit contribution" onClick={() => onEdit(c)}><Pencil size={15} /></button><button className="row-action danger-action" title="Delete contribution" onClick={() => onDelete(c)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>; }
function ExpensesTable({ rows, onEdit, onDelete, onTogglePaid }) { return !rows.length ? <Empty label="No expenses found" /> : <div className="table-scroll"><table><thead><tr><th>EXPENSE</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT STATUS</th><th>RECORDED BY</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>{rows.map(e => { const paid = (e.paymentStatus || 'unpaid') === 'paid'; return <tr key={e._id}><td><div className="expense-cell"><div className="expense-symbol"><ReceiptText size={17} /></div><strong>{e.description}</strong></div></td><td><span className="category-chip">{e.category}</span></td><td>{dateText(e.date)}</td><td><button className={`payment-status ${paid ? 'paid' : 'unpaid'}`} onClick={() => onTogglePaid(e)} title="Click to change payment status"><i />{paid ? 'Paid' : 'Unpaid'}</button></td><td>{e.recordedBy || 'Treasurer'}</td><td className="amount negative-text">−{money(e.amount)}</td><td><div className="row-actions"><button className="row-action" title="Edit expense" onClick={() => onEdit(e)}><Pencil size={15} /></button><button className="row-action danger-action" title="Delete expense" onClick={() => onDelete(e)}><Trash2 size={15} /></button></div></td></tr>; })}</tbody></table></div>; }
function RecordEditor({ type, record, students, token, onClose, onSaved }) {
  const contribution = type === 'contribution';
  const [form, setForm] = useState(() => contribution ? { studentId: record?.studentId?._id || '', description: record?.description || 'Section contribution', amount: record ? String(record.amount) : '', date: record?.date ? new Date(record.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10) } : { description: record?.description || '', category: record?.category || 'General', amount: record ? String(record.amount) : '', date: record?.date ? new Date(record.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), recordedBy: record?.recordedBy || 'Administrator', paymentStatus: record?.paymentStatus || 'unpaid' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { const url = `${API}/${contribution ? 'contributions' : 'expenses'}${record ? `/${record._id}` : ''}`; const response = await fetch(url, { method: record ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not save record.'); await onSaved(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <form className="balance-form record-editor" onSubmit={submit}><h2>{record ? 'Edit' : 'Add'} {contribution ? 'contribution' : 'expense'}</h2>{contribution && <label>Student<select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}><option value="">Select student</option>{students.map(s => <option key={s._id} value={s._id}>{s.name} · {s.studentId}</option>)}</select></label>}<label>Description<input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={contribution ? 'e.g. Monthly class contribution' : 'e.g. Printing materials'} /></label>{!contribution && <><label>Category<input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label><label>Payment status<select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })}><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></label></>}<label>Amount (PHP)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></label><label>Date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>{error && <div className="balance-message">{error}</div>}<div className="balance-form-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : record ? 'Save changes' : 'Add record'}</button><button type="button" className="button secondary" onClick={onClose}>Cancel</button></div></form>;
}
function TransactionsTable({ rows, compact = false }) { return !rows.length ? <Empty label="No transactions found" /> : <div className="table-scroll"><table><thead><tr><th>TRANSACTION</th><th>TYPE</th><th>DATE</th><th>AMOUNT</th>{!compact && <th>DETAIL</th>}</tr></thead><tbody>{rows.map((t, i) => { const contribution = t.type === 'contribution'; return <tr key={t._id || i}><td><div className="transaction-cell"><div className={`transaction-symbol ${contribution ? 'in' : 'out'}`}>{contribution ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}</div><div><strong>{contribution ? (t.studentId?.name || 'Student contribution') : (t.description || 'Class expense')}</strong><span>{contribution ? (t.description || 'Contribution received') : (t.category || 'Expense recorded')}</span></div></div></td><td><span className={`type-chip ${contribution ? 'type-in' : 'type-out'}`}>{contribution ? 'Contribution' : 'Expense'}</span></td><td>{dateText(t.date)}</td><td className={`amount ${contribution ? 'positive-text' : 'negative-text'}`}>{contribution ? '+' : '−'}{money(t.amount)}</td>{!compact && <td>{contribution ? (t.studentId?.studentId || '—') : (t.recordedBy || 'Treasurer')}</td>}</tr> })}</tbody></table></div>; }
function downloadCSV(rows) { const columns = ['type', 'date', 'description', 'category', 'amount']; const text = [columns.join(','), ...rows.map(r => columns.map(k => JSON.stringify(k === 'date' ? dateText(r[k]) : r[k] ?? '')).join(','))].join('\n'); const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'class-transactions.csv'; a.click(); URL.revokeObjectURL(url); }


function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to sign in.');
      onLogin(result, remember);
    } catch (e) {
      setError(e.message || 'Could not connect to the server. Check that the backend is running.');
    } finally { setBusy(false); }
  }

  if (forgotMode) return <ForgotPasswordScreen onBack={() => setForgotMode(false)} />;
  if (registerMode) return <RegisterScreen onBack={() => setRegisterMode(false)} onRegistered={() => setRegisterMode(false)} />;

  return <main className="auth-page">
    <section className="auth-card">
      <div className="auth-brand"><div className="auth-brand-mark"><PiggyBank size={27} /></div><h1>ClassFunds</h1><p>STUDENT EXPENSE LIST SYSTEM</p></div>
      <div className="auth-heading"><h2>Welcome back</h2><p>Sign in to check your class expense records.</p></div>
      <form onSubmit={submit}>
        <label htmlFor="login-username">Username or student ID</label>
        <input id="login-username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Enter your username or student ID" required />
        <label htmlFor="login-password">Password</label>
        <div className="auth-password"><input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button></div>
        <label className="auth-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me on this device</label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <button type="button" className="auth-link-button" onClick={() => { setError(''); setForgotMode(true); }}>Forgot password?</button>
      <button type="button" className="auth-link-button" onClick={() => { setError(''); setRegisterMode(true); }}>Create a student account</button>
      <div className="auth-footer">Secure access to your class financial records.</div>
    </section>
  </main>
}


function RegisterScreen({ onBack, onRegistered }) {
  const [form, setForm] = useState({ studentId: '', name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  async function submit(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (form.password.length < 10) return setError('Use at least 10 characters for your password.');
    if (form.password !== form.confirmPassword) return setError('The passwords do not match.');
    setBusy(true);
    try {
      const response = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: form.studentId, name: form.name, username: form.username, email: form.email, password: form.password }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not create account.');
      setMessage(data.message || 'Account created. You can now sign in.');
      setTimeout(() => onRegistered(), 1200);
    } catch (e) { setError(e.message || 'Could not connect to the server.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><GraduationCap size={27} /></div><h1>ClassFunds</h1><p>STUDENT REGISTRATION</p></div><div className="auth-heading"><h2>Create your account</h2><p>Register with the student ID and full name already recorded by your school. New registrations are student accounts only.</p></div><form onSubmit={submit}>
    <label htmlFor="register-student-id">Student ID</label><input id="register-student-id" value={form.studentId} onChange={e => update('studentId', e.target.value)} placeholder="Enter your official student ID" autoComplete="off" required />
    <label htmlFor="register-name">Full name (as recorded by school)</label><input id="register-name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your full name" autoComplete="name" required />
    <label htmlFor="register-username">Choose a username</label><input id="register-username" value={form.username} onChange={e => update('username', e.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9._-]+" placeholder="Letters, numbers, dot, underscore, hyphen" autoComplete="username" required />
    <label htmlFor="register-email">School email</label><input id="register-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@school.edu" autoComplete="email" required />
    <label htmlFor="register-password">Password (at least 10 characters)</label><input id="register-password" type="password" value={form.password} onChange={e => update('password', e.target.value)} minLength={10} autoComplete="new-password" required />
    <label htmlFor="register-confirm-password">Confirm password</label><input id="register-confirm-password" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} minLength={10} autoComplete="new-password" required />
    {error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-success" role="status">{message}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
  </form><button type="button" className="auth-link-button" onClick={onBack}>← Back to sign in</button><div className="auth-footer">Your student record must already exist in the school system.</div></section></main>;
}

function ForgotPasswordScreen({ onBack }) {
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch(`${API}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not request a password reset.');
      setMessage(result.message || 'If the details match an account, a reset link has been sent.');
    } catch (e) { setError(e.message || 'Could not connect to the server.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><PiggyBank size={27} /></div><h1>ClassFunds</h1><p>ACCOUNT RECOVERY</p></div><div className="auth-heading"><h2>Forgot your password?</h2><p>Enter your student ID, full name, and the email already linked to your account. A secure reset link will be sent to that email.</p></div><form onSubmit={submit}>
    <label htmlFor="reset-student-id">Student ID</label><input id="reset-student-id" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} autoComplete="off" required />
    <label htmlFor="reset-student-name">Full name</label><input id="reset-student-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
    <label htmlFor="reset-email">Email linked to your account</label><input id="reset-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
    {error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-success" role="status">{message}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Sending link…' : 'Send reset link'}</button>
  </form><button type="button" className="auth-link-button" onClick={onBack}>← Back to sign in</button><div className="auth-footer">Reset links expire after 30 minutes. Student ID and name alone cannot reset a password.</div></section></main>;
}

function ResetPasswordScreen({ token }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  async function resetToDefault(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const response = await fetch(`${API}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not reset password.');
      setResult(data);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) { setError(e.message || 'Could not connect to the server.'); }
    finally { setBusy(false); }
  }
  async function copyPassword() {
    try { await navigator.clipboard.writeText(result.defaultPassword); setCopied(true); }
    catch { setCopied(false); }
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><PiggyBank size={27} /></div><h1>ClassFunds</h1><p>ACCOUNT RECOVERY</p></div>
    {!result ? <><div className="auth-heading"><h2>Reset to default password?</h2><p>Use this one-time link to reset your password to the temporary default configured by your administrator. You will need to change it after signing in.</p></div><form onSubmit={resetToDefault}>{error && <div className="auth-error" role="alert">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Resetting password…' : 'Reset to default password'}</button></form><div className="auth-footer">This one-time reset link expires after 30 minutes.</div></> : <><div className="auth-heading"><h2>Password reset complete</h2><p>{result.message}</p></div><label htmlFor="default-reset-password">Temporary default password</label><div className="auth-password"><input id="default-reset-password" type="text" value={result.defaultPassword || ''} readOnly autoComplete="off"/><button type="button" onClick={copyPassword}>{copied ? 'Copied' : 'Copy'}</button></div><div className="auth-success" role="status">Sign in with this temporary password. ClassFunds will require you to change it before continuing.</div><button type="button" className="auth-submit" onClick={() => { window.location.href = window.location.pathname; }}>Back to sign in</button></>}
  </section></main>;
}

function ChatAssistant({ token, role, compact = false }) {
  const welcome = role === 'student'
    ? 'Hi! I’m Cathrine, your ClassFunds assistant. I can help you understand your own recorded charges, contributions, and remaining balance. What would you like to know?'
    : 'Hi! I’m Cathrine, your ClassFunds assistant. I can help you review recorded contributions, assigned student balances, class expenses, and paid or unpaid expense status.';
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcome, time: new Date() }]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showTips, setShowTips] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);

  async function sendMessage(e) {
    e?.preventDefault();
    const message = question.trim();
    if (!message || busy) return;
    const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
    setQuestion(''); setError(''); setBusy(true);
    setMessages(prev => [...prev, { role: 'user', content: message, time: new Date() }]);
    try {
      const response = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, history })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Cathrine could not answer just now. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer || 'I couldn’t form a response from the available records. Please try asking another way.', time: new Date() }]);
    } catch (err) { setError(err.message || 'Could not reach the AI service. Check your connection and try again.'); }
    finally { setBusy(false); inputRef.current?.focus(); }
  }
  const quickQuestions = role === 'student'
    ? ['What is my remaining balance?', 'Summarize my recent payments', 'Explain my assigned charges']
    : ['How much is still unpaid?', 'Summarize recorded contributions', 'Which class expenses are unpaid?'];
  const usePrompt = prompt => { setQuestion(prompt); setShowTips(false); inputRef.current?.focus(); };
  const resetChat = () => { setMessages([{ role: 'assistant', content: welcome, time: new Date() }]); setError(''); setQuestion(''); };
  const timeText = time => new Date(time || Date.now()).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

  return <section className={`ai-chat-card messenger-chat ${compact ? 'ai-chat-compact' : ''}`}>
    <div className="messenger-header">
      <div className="messenger-avatar"><Bot size={21} /><span className="messenger-online" /></div>
      <div className="messenger-title"><h2>Cathrine</h2><p><span className="messenger-live-dot" /> AI financial assistant · {role === 'student' ? 'Private student view' : 'Admin assistant'}</p></div>
      <button className="messenger-header-action" type="button" onClick={() => setShowTips(v => !v)} title="Suggested questions"><Sparkles size={17} /><span>Suggestions</span></button>
      <button className="messenger-header-action messenger-new-chat" type="button" onClick={resetChat} title="Start a new chat"><RefreshCw size={16} /><span>New chat</span></button>
    </div>
    <div className="messenger-chat-body">
      <div className="messenger-date-divider"><span>YOUR CLASSFUNDS CHAT</span></div>
      {showTips && <div className="messenger-suggestions"><div className="messenger-suggestions-title">What can I help with?</div>{quickQuestions.map(q => <button type="button" key={q} onClick={() => usePrompt(q)}>{q}<ArrowUpRight size={14} /></button>)}</div>}
      <div className="ai-chat-messages messenger-messages" aria-live="polite" aria-relevant="additions text">
        {messages.map((m, i) => <div key={`${i}-${m.role}`} className={`ai-chat-message messenger-message ${m.role}`}>
          {m.role === 'assistant' && <div className="ai-message-avatar messenger-bot-avatar"><Bot size={15} /></div>}
          <div className="ai-message-content messenger-bubble-wrap"><div className={`messenger-bubble ${m.role}`}><p>{m.content}</p></div><span className="messenger-message-meta">{m.role === 'assistant' ? 'Cathrine' : 'You'} · {timeText(m.time)}</span></div>
          {m.role === 'user' && <div className="ai-message-avatar messenger-user-avatar"><UserRound size={15} /></div>}
        </div>)}
        {busy && <div className="ai-chat-message messenger-message assistant"><div className="ai-message-avatar messenger-bot-avatar"><Bot size={15} /></div><div className="ai-message-content messenger-bubble-wrap"><div className="messenger-bubble assistant typing-bubble"><span/><span/><span/></div><span className="messenger-message-meta">Cathrine is typing…</span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="ai-error messenger-error" role="alert"><AlertCircle size={16} /> <span>{error}</span><button type="button" onClick={() => { setError(''); inputRef.current?.focus(); }}>Dismiss</button></div>}
      <div className="messenger-compose-area">
        <form className="ai-chat-form messenger-compose" onSubmit={sendMessage}>
          <textarea ref={inputRef} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} placeholder={role === 'student' ? 'Message Cathrine about your balance…' : 'Message Cathrine about class finances…'} maxLength={1500} disabled={busy} rows={1} aria-label="Message Cathrine" />
          <button className="messenger-send" type="submit" disabled={busy || !question.trim()} aria-label="Send message" title="Send message"><Send size={18} /></button>
        </form>
        <div className="messenger-compose-hint"><span>Enter to send · Shift + Enter for a new line</span><span>{question.length}/1500</span></div>
      </div>
    </div>
    <p className="ai-disclaimer messenger-disclaimer">Cathrine uses the records your account is authorized to access. AI can make mistakes; confirm important totals in ClassFunds. She cannot change records or record payments.</p>
  </section>;
}

function AdminFinancialSummary({ token }) {
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function generate() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/ai/admin-summary`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not generate the financial summary.');
      setReport(result);
    } catch (err) { setError(err.message || 'Could not reach the AI service.'); }
    finally { setBusy(false); }
  }
  const metrics = report?.metrics;
  return <div className="ai-summary-page">
    <section className="ai-summary-hero"><div className="ai-heading-icon"><Sparkles size={23} /></div><div className="ai-summary-hero-copy"><h2>AI Financial Summary</h2><p>Generate a plain-language overview of the recorded individual student expenses, payments, and unpaid balances.</p></div><button className="button primary" onClick={generate} disabled={busy}><Sparkles size={16} />{busy ? 'Generating…' : report ? 'Refresh summary' : 'Generate summary'}</button></section>
    {error && <div className="ai-error" role="alert">{error}</div>}
    {busy && <div className="ai-summary-placeholder"><Sparkles size={20} /> Reviewing verified MongoDB totals and writing your summary…</div>}
    {report && metrics && <>
      <div className="ai-metric-grid"><div className="ai-metric-card"><span>Assigned expenses</span><strong>{money(metrics.totalAssignedExpenses)}</strong></div><div className="ai-metric-card"><span>Payments recorded</span><strong className="positive-text">{money(metrics.totalPaymentsRecorded)}</strong></div><div className="ai-metric-card"><span>Outstanding balance</span><strong className={metrics.totalOutstandingBalance > 0 ? 'negative-text' : 'positive-text'}>{money(metrics.totalOutstandingBalance)}</strong></div><div className="ai-metric-card"><span>Students with unpaid balances</span><strong>{metrics.studentsWithUnpaidBalances} / {metrics.activeStudentCount}</strong></div></div>
      <section className="ai-summary-report"><div className="ai-summary-report-heading"><div className="ai-heading-icon"><Bot size={20} /></div><div><h2>AI-generated insights</h2><p>Generated {new Date(report.generatedAt).toLocaleString('en-PH')}</p></div></div><div className="ai-summary-text">{report.summary.split('\n').map((line, i) => line.trim() ? <p key={i}>{line}</p> : null)}</div><div className="ai-summary-footnote">This is a snapshot of assigned individual student charges and recorded payment records. Confirm figures against the source records before making financial decisions.</div></section>
      <section className="ai-summary-small-stats"><div><strong>{metrics.studentsPartiallyPaid}</strong><span>Partially paid</span></div><div><strong>{metrics.studentsFullyPaid}</strong><span>Fully paid</span></div><div><strong>{metrics.studentsWithoutAssignedExpenses}</strong><span>No assigned expenses</span></div></section>
    </>}
    {!report && !busy && !error && <div className="ai-summary-placeholder">Select <strong>Generate summary</strong> to analyze the current records. Cathrine uses Gemini configured in the backend.</div>}
  </div>;
}

function StudentPortal({ token, user, onLogout, onPasswordChanged }) {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/student-portal/me`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not load student records.');
      setData(result);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, [token]);

  async function changePassword(event) {
    event.preventDefault(); setMessage(''); setError('');
    if (newPassword.length < 10) return setError('Your new password must be at least 10 characters.');
    if (newPassword !== confirmPassword) return setError('The new passwords do not match.');
    try {
      const response = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Password update failed.');
      setMessage('Password changed. Please sign in again with your new password.');
      setTimeout(() => onPasswordChanged(), 900);
    } catch (e) { setError(e.message); }
  }

  if (user.mustChangePassword) return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><PiggyBank size={27} /></div><h1>Change your password</h1><p>Required before viewing your records</p></div><form onSubmit={changePassword}><label>Temporary password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required /><label>New password (at least 10 characters)</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required minLength={10} /><label>Confirm new password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required minLength={10} />{error && <div className="auth-error">{error}</div>}{message && <div className="auth-success">{message}</div>}<button className="auth-submit">Change password</button><button type="button" className="auth-logout" onClick={onLogout}>Sign out</button></form></section></main>;

  return <div className="student-portal">
    {showHelpCenter && <HelpCenterModal role="student" onClose={() => setShowHelpCenter(false)} />}
    <header className="student-topbar"><div className="student-logo"><div className="auth-brand-mark"><PiggyBank size={22} /></div><div><strong>ClassFunds</strong><span>STUDENT EXPENSES</span></div></div><div className="student-top-actions"><button className="student-help-button" onClick={() => setShowHelpCenter(true)}><CircleHelp size={16} /> Help center</button><button className="auth-logout" onClick={onLogout}>Sign out</button></div></header>
    <main className="student-content">
      <div className="student-welcome"><div><span className="student-eyebrow">STUDENT PORTAL</span><h1>Hello, {data?.student?.name || user.username}</h1><p>Here is your personal expense and payment summary.</p></div></div>
      {error && <div className="auth-error">{error}<button onClick={load}>Try again</button></div>}
      {busy ? <div className="student-panel">Loading your records…</div> : data && <>
        <div className="student-stats">
          <div className="student-stat"><span>Total assigned</span><strong>{money(data.summary.totalCharged)}</strong></div>
          <div className="student-stat"><span>Total paid</span><strong className="positive-text">{money(data.summary.totalPaid)}</strong></div>
          <div className="student-stat"><span>Unpaid balance</span><strong className={data.summary.unpaidBalance > 0 ? 'negative-text' : 'positive-text'}>{money(data.summary.unpaidBalance)}</strong></div>
        </div>
        <section className="student-panel"><div className="student-panel-head"><div><h2>Assigned expenses</h2><p>Expenses assigned to you by the class treasurer.</p></div></div>{data.charges.length ? <div className="student-table-wrap"><table><thead><tr><th>Expense</th><th>Due date</th><th>Amount</th></tr></thead><tbody>{data.charges.map(c => <tr key={c._id}><td>{c.description}</td><td>{dateText(c.dueDate)}</td><td>{money(c.amount)}</td></tr>)}</tbody></table></div> : <p className="student-empty">No individual expenses have been assigned to your account yet. Your treasurer can add them.</p>}</section>
        <section className="student-panel"><div className="student-panel-head"><div><h2>Class expense updates</h2><p>Shared expenses recorded by the administrator. These are informational and do not automatically change your personal balance.</p></div></div>{(data.classExpenses || []).length ? <div className="student-table-wrap"><table><thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.classExpenses.map(e => <tr key={e._id}><td>{dateText(e.date)}</td><td>{e.description}</td><td>{e.category}</td><td className="negative-text">{money(e.amount)}</td><td><span className={`payment-status ${e.paymentStatus === 'paid' ? 'paid' : 'unpaid'}`}><i />{e.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</span></td></tr>)}</tbody></table></div> : <p className="student-empty">No class expenses have been recorded yet.</p>}</section>
        <section className="student-panel"><div className="student-panel-head"><div><h2>Payment history</h2><p>Your recorded contributions and payments.</p></div></div>{data.payments.length ? <div className="student-table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Amount paid</th></tr></thead><tbody>{data.payments.map(p => <tr key={p._id}><td>{dateText(p.date)}</td><td>{p.description || 'Contribution'}</td><td className="positive-text">{money(p.amount)}</td></tr>)}</tbody></table></div> : <p className="student-empty">No payments recorded yet.</p>}</section>
      </>}
      <section className="student-ai-section"><div className="student-panel-head"><div><h2>Cathrine — Expense Assistant</h2><p>Ask questions about your own recorded expenses and payments.</p></div></div><ChatAssistant token={token} role="student" compact /></section>
      <p className="student-privacy">You are only viewing records linked to your own student account.</p>
    </main>
  </div>;
}

function RequiredPasswordChange({ token, onLogout, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError('');
    if (newPassword.length < 10) return setError('Use at least 10 characters for your new password.');
    if (newPassword !== confirmPassword) return setError('The passwords do not match.');
    setBusy(true);
    try {
      const response = await fetch(`${API}/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password change failed.');
      onPasswordChanged();
    } catch (e) { setError(e.message || 'Could not connect to the server.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><PiggyBank size={27} /></div><h1>ClassFunds</h1><p>SECURITY CHECK</p></div><div className="auth-heading"><h2>Change your temporary password</h2><p>For your security, set a new password before continuing.</p></div><form onSubmit={submit}><label htmlFor="required-current-password">Temporary/default password</label><input id="required-current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required/><label htmlFor="required-new-password">New password (at least 10 characters)</label><input id="required-new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" minLength={10} required/><label htmlFor="required-confirm-password">Confirm new password</label><input id="required-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={10} required/>{error && <div className="auth-error" role="alert">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Updating password…' : 'Save new password'}</button><button type="button" className="auth-link-button" onClick={onLogout}>Sign out</button></form></section></main>;
}

function App() {
  const [session, setSession] = useState(() => {
    for (const store of [window.localStorage, window.sessionStorage]) {
      try { const raw = store.getItem('student-expense-session'); if (raw) return JSON.parse(raw); } catch { }
    }
    return null;
  });
  function login(result, remember) {
    const next = { token: result.token, user: result.user };
    window.localStorage.removeItem('student-expense-session');
    window.sessionStorage.removeItem('student-expense-session');
    (remember ? window.localStorage : window.sessionStorage).setItem('student-expense-session', JSON.stringify(next));
    setSession(next);
  }
  function logout() {
    window.localStorage.removeItem('student-expense-session');
    window.sessionStorage.removeItem('student-expense-session');
    setSession(null);
  }
  const resetToken = new URLSearchParams(window.location.search).get('resetToken');
  if (resetToken) return <ResetPasswordScreen token={resetToken} />;
  if (!session?.token || !session?.user) return <LoginScreen onLogin={login} />;
  if (session.user.mustChangePassword) return <RequiredPasswordChange token={session.token} onLogout={logout} onPasswordChanged={logout} />;
  if (session.user.role === 'student') return <StudentPortal token={session.token} user={session.user} onLogout={logout} onPasswordChanged={logout} />;
  return <AdminDashboard token={session.token} user={session.user} onLogout={logout} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

