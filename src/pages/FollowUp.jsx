import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteFollowUpForm, getFollowUpForms, saveFollowUpForm, updateFollowUpForm } from '../storage';

const emptyForm = { title: '', date: new Date().toISOString().split('T')[0], responsible: '', status: 'قيد المتابعة', notes: '' };

export default function FollowUp() {
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  const loadForms = () => getFollowUpForms()
    .then(setForms)
    .catch(() => setNotice('تعذر تحميل استمارات المتابعة. شغّل جدول المتابعة في Supabase.'));

  useEffect(() => {
    loadForms();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) {
      setNotice('اكتب اسم السجل والتاريخ أولًا.');
      return;
    }

    const record = {
      ...form,
      title: form.title.trim(),
      responsible: form.responsible.trim(),
      notes: form.notes.trim(),
      id: editingId || `${Date.now()}-${crypto.randomUUID()}`,
      createdAt: editingId ? forms.find((item) => item.id === editingId)?.createdAt || Date.now() : Date.now(),
    };

    try {
      if (editingId) await updateFollowUpForm(record);
      else await saveFollowUpForm(record);
      setForm(emptyForm);
      setEditingId(null);
      setNotice(editingId ? 'تم تحديث الاستمارة.' : 'تمت إضافة استمارة المتابعة.');
      await loadForms();
    } catch {
      setNotice('تعذر حفظ الاستمارة. تأكد من إعداد Supabase.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, date: item.date, responsible: item.responsible || '', status: item.status, notes: item.notes || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف استمارة المتابعة؟')) return;
    try {
      await deleteFollowUpForm(id);
      setForms((current) => current.filter((item) => item.id !== id));
      setNotice('تم حذف الاستمارة.');
    } catch {
      setNotice('تعذر حذف الاستمارة.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '30px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header className="official-header" style={{ padding: '20px 25px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button type="button" onClick={() => window.history.back()} aria-label="العودة" style={{ background: '#eff6ff', color: '#2563eb', border: 0, padding: '10px', borderRadius: '10px', cursor: 'pointer' }}><ArrowRight size={18} /></button>
            <div>
              <span style={{ color: '#0369a1', fontSize: '11px', fontWeight: '800' }}>روضة آل مشول الحكومية</span>
              <h1 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>متابعة السجلات</h1>
            </div>
          </div>
          <ClipboardCheck size={34} color="#0369a1" />
        </header>

        <section className="official-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '17px', fontWeight: '900', marginBottom: '18px' }}><Plus size={19} color="#059669" /> {editingId ? 'تعديل استمارة' : 'إضافة استمارة متابعة'}</h2>
          {notice && <div role="status" style={{ background: '#eff6ff', color: '#1d4ed8', padding: '10px 12px', borderRadius: '9px', marginBottom: '16px', fontSize: '13px', fontWeight: '700' }}>{notice}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: '800' }}>اسم السجل<input name="title" value={form.title} onChange={handleChange} placeholder="مثال: متابعة الانضباط المدرسي" required style={inputStyle} /></label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: '800' }}>التاريخ<input name="date" type="date" value={form.date} onChange={handleChange} required style={inputStyle} /></label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: '800' }}>المسؤول عن المتابعة<input name="responsible" value={form.responsible} onChange={handleChange} placeholder="اسم المسؤول" style={inputStyle} /></label>
            <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: '800' }}>الحالة<select name="status" value={form.status} onChange={handleChange} style={inputStyle}><option>قيد المتابعة</option><option>مكتمل</option><option>يحتاج إجراء</option></select></label>
            <label style={{ gridColumn: '1 / -1', display: 'grid', gap: '6px', fontSize: '13px', fontWeight: '800' }}>الملاحظات<textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="اكتب ملاحظات المتابعة" style={{ ...inputStyle, resize: 'vertical' }} /></label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}><button type="submit" style={primaryButton}>{editingId ? 'حفظ التعديل' : 'إضافة الاستمارة'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} style={secondaryButton}>إلغاء</button>}</div>
          </form>
        </section>

        <section className="official-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}><h2 style={{ color: '#0f172a', fontSize: '17px', fontWeight: '900' }}>الاستمارات المضافة</h2><span style={{ color: '#64748b', fontSize: '12px', fontWeight: '800' }}>الإجمالي: {forms.length}</span></div>
          {forms.length === 0 ? <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>لا توجد استمارات متابعة حتى الآن.</div> : <div style={{ display: 'grid', gap: '12px' }}>{forms.map((item) => <article key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><div><h3 style={{ color: '#0f172a', fontSize: '15px', fontWeight: '900', marginBottom: '6px' }}>{item.title}</h3><p style={{ color: '#64748b', fontSize: '12px' }}>التاريخ: {item.date} {item.responsible && `| المسؤول: ${item.responsible}`}</p></div><span style={{ color: item.status === 'مكتمل' ? '#047857' : '#b45309', background: item.status === 'مكتمل' ? '#d1fae5' : '#fef3c7', borderRadius: '8px', padding: '5px 9px', height: 'fit-content', fontSize: '11px', fontWeight: '800' }}>{item.status}</span></div>{item.notes && <p style={{ color: '#475569', fontSize: '13px', margin: '10px 0' }}>{item.notes}</p>}<div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}><button type="button" onClick={() => handleEdit(item)} style={secondaryButton}><Pencil size={14} /> تعديل</button><button type="button" onClick={() => handleDelete(item.id)} style={dangerButton}><Trash2 size={14} /> حذف</button></div></article>)}</div>}
        </section>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '9px', padding: '10px 12px', background: '#fff', color: '#1e293b' };
const primaryButton = { border: 0, borderRadius: '9px', padding: '10px 16px', background: '#059669', color: '#fff', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' };
const secondaryButton = { border: '1px solid #cbd5e1', borderRadius: '9px', padding: '9px 13px', background: '#fff', color: '#334155', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' };
const dangerButton = { ...secondaryButton, color: '#dc2626', borderColor: '#fecaca' };
