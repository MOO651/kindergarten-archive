import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Trash2, Lock, FileText, ShieldCheck, Download, Database } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { deleteFile, downloadFile, getAllFiles, makeFileRecord, saveFile, updateFile } from '../storage';

const fileToDataUrl = async (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export default function Admin() {
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [notice, setNotice] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    getAllFiles()
      .then(setAllFiles)
      .catch(() => setNotice('تعذر قراءة الملفات المخزنة.'));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '14311431') {
      setIsAuthenticated(true);
      setNotice('');
    } else {
      setNotice('رمز المرور غير صحيح. حاول مرة أخرى.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setNotice('يرجى اختيار ملف أو مستند من جهازك أولاً.');
      return;
    }

    setIsUploading(true);
    try {
      const originalSize = selectedFile.size;
      const uploadFile = selectedFile.type.startsWith('image/')
        ? await imageCompression(selectedFile, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 2400,
          initialQuality: 0.78,
          useWebWorker: true,
        })
        : selectedFile;
      const newFile = makeFileRecord(uploadFile, selectedSection, description.trim());
      await saveFile(newFile);
      setAllFiles((files) => [newFile, ...files]);
      setSelectedFile(null);
      setDescription('');
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      const savedSize = (uploadFile.size / (1024 * 1024)).toFixed(2);
      const originalSizeMb = (originalSize / (1024 * 1024)).toFixed(2);
      setNotice(uploadFile.size < originalSize
        ? `تم ضغط الصورة ورفعها: ${originalSizeMb} إلى ${savedSize} ميجابايت.`
        : `تم رفع الملف «${newFile.name}» بنجاح.`);
    } catch {
      setNotice('تعذر حفظ الملف. قد تكون مساحة تخزين المتصفح ممتلئة.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند نهائياً؟')) {
      try {
        await deleteFile(file.id);
        setAllFiles((files) => files.filter((item) => item.id !== file.id));
        setNotice('تم حذف المستند.');
      } catch {
        setNotice('تعذر حذف المستند. حاول مرة أخرى.');
      }
    }
  };

  const handleEdit = async (file) => {
    const name = window.prompt('اسم الملف:', file.name);
    if (!name?.trim()) return;
    const nextDescription = window.prompt('وصف الملف:', file.description || '') ?? (file.description || '');
    const updatedFile = { ...file, name: name.trim(), description: nextDescription.trim() };
    try {
      await updateFile(updatedFile);
      setAllFiles((files) => files.map((item) => item.id === file.id ? updatedFile : item));
      setNotice('تم تحديث بيانات المستند.');
    } catch {
      setNotice('تعذر تحديث بيانات المستند.');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !window.confirm('هل تريد حذف المستندات المحددة؟')) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteFile(id)));
      setAllFiles((files) => files.filter((file) => !selectedIds.includes(file.id)));
      setSelectedIds([]);
      setNotice('تم حذف المستندات المحددة.');
    } catch {
      setNotice('تعذر حذف بعض المستندات المحددة.');
    }
  };

  const handleBackup = async () => {
    try {
      const backupFiles = await Promise.all(allFiles.map(async (file) => ({
        ...file,
        blob: await fileToDataUrl(await downloadFile(file)),
      })));
      const backup = { version: 1, createdAt: new Date().toISOString(), files: backupFiles };
      const backupUrl = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = backupUrl;
      link.download = `نسخة-احتياطية-الروضة-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(backupUrl);
      setNotice('تم تنزيل النسخة الاحتياطية بكل الملفات.');
    } catch {
      setNotice('تعذر إنشاء النسخة الاحتياطية.');
    }
  };

  const handleRestore = async (event) => {
    const backupFile = event.target.files?.[0];
    if (!backupFile) return;
    setIsRestoring(true);
    try {
      const backup = JSON.parse(await backupFile.text());
      if (!Array.isArray(backup.files)) throw new Error('Invalid backup');
      const restoredFiles = backup.files.map((file) => {
        const [header, data] = file.blob.split(',');
        const binary = atob(data);
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
        return { ...file, blob: new Blob([bytes], { type: mimeType }) };
      });
      await Promise.all(restoredFiles.map(saveFile));
      setAllFiles(await getAllFiles());
      setNotice(`تم استرجاع ${restoredFiles.length} ملف بنجاح.`);
    } catch {
      setNotice('ملف النسخة الاحتياطية غير صالح.');
    } finally {
      setIsRestoring(false);
    }
    event.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', direction: 'rtl' }}>
        <div className="official-card" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid #bfdbfe' }}>
            <Lock style={{ width: '28px', height: '28px', color: '#2563eb' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>لوحة تحكم المشرفين</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '25px' }}>يرجى إدخال رمز المرور للمتابعة</p>

          <form onSubmit={handleLogin}>
            {notice && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '700' }}>{notice}</div>}
            <input 
              type="password" 
              placeholder="أدخل رمز المرور..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '16px', outline: 'none', fontSize: '14px', textAlign: 'center', fontFamily: 'inherit', letterSpacing: '3px' }}
            />
            <button 
              type="submit" 
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
            >
              دخول اللوحة
            </button>
          </form>

          <button 
            type="button" 
            onClick={() => navigate('/')} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', marginTop: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* الهيدر العلوي */}
        <div className="official-header" style={{ padding: '20px 25px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowRight style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            </button>
            <div>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>لوحة الإدارة والتحكم</span>
              <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>إدارة مستندات وسجلات الروضة</h1>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
          >
            تسجيل خروج
          </button>
        </div>

        {/* قسم رفع ملف حقيقي */}
        <div className="official-card" style={{ padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <span>رفع ملف أو مستند جديد (PDF, Word, صور...)</span>
          </h2>

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {notice && <div role="status" style={{ background: '#ecfdf5', color: '#047857', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>{notice}</div>}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>اختر القسم المستهدف:</label>
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', fontWeight: '600', background: '#ffffff', fontFamily: 'inherit' }}
              >
                {[...Array(29)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    القسم رقم ({i + 1}) - {
                      [
                        'الدعم الموحد', 'التقويم المدرسي', 'منصة عين الاثرائية', 'حضوري', 'نظام نور',
                        'الصحة المدرسية', 'التواصل', 'التقارير والاحصائيات', 'البرامج والأنشطة', 'الانضباط المدرسي',
                        'حماية الطفل', 'الشراكة', 'النشرات والتبليغات', 'المبادرات و التطوع', 'منصة روضتي',
                        'الانشطة الحركية واللعب في الخارج', 'التطوير المهني', 'السلوك الوظيفي', 'المجالس واللجان', 'الامن والسلامة البيئية',
                        'الخطة التشغيلية', 'المسابقات', 'العقد السلوكي', 'اداء المتعلمين', 'المنهج الوطني',
                        'الخطط الأسبوعية التعليمية', 'الخطط الأسبوعية للبرامج والأنشطة', 'اللوائح والأنظمة', 'الأدلة'
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>اختر الملف من جهازك:</label>
              <input 
                id="file-upload-input"
                type="file" 
                accept="*/*"
                disabled={isUploading}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #94a3b8', background: '#f8fafc', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
              />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: '600' }}>يمكنك اختيار أي نوع ملف وبأي حجم تسمح به مساحة جهازك.</span>
                {selectedFile && <div role="status" style={{ background: '#eff6ff', color: '#1d4ed8', padding: '10px 12px', borderRadius: '9px', marginTop: '10px', fontSize: '12px', fontWeight: '700' }}>الملف المحدد: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت)</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>وصف مختصر (اختياري):</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: خطة النشاط للفصل الدراسي الأول" rows="3" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <button 
              type="submit" 
              disabled={isUploading}
              style={{ background: '#059669', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.2)' }}
            >
              <Upload style={{ width: '16px', height: '16px' }} />
              <span>{isUploading ? 'جارٍ حفظ الملف...' : 'رفع الملف وتحديث السجل'}</span>
            </button>
          </form>
        </div>

        {/* قائمة المستندات المرفوعة */}
        <div className="official-card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck style={{ width: '18px', height: '18px', color: '#059669' }} />
            <span>جميع المستندات المرفوعة بالنظام</span>
          </h2>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '800' }}>إجمالي الملفات: {allFiles.length}</span>
            <span style={{ background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '800' }}>الأقسام المستخدمة: {new Set(allFiles.map((file) => file.sectionId)).size}</span>
            <button type="button" onClick={handleBulkDelete} disabled={!selectedIds.length} style={{ background: selectedIds.length ? '#fee2e2' : '#f1f5f9', color: selectedIds.length ? '#dc2626' : '#94a3b8', border: 'none', padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '800', cursor: selectedIds.length ? 'pointer' : 'not-allowed' }}>حذف المحدد ({selectedIds.length})</button>
            <button type="button" onClick={handleBackup} style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Download size={14} /> تنزيل نسخة احتياطية</button>
            <label style={{ background: isRestoring ? '#f1f5f9' : '#e0f2fe', color: isRestoring ? '#94a3b8' : '#0369a1', border: 'none', padding: '8px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '800', cursor: isRestoring ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Database size={14} /> {isRestoring ? 'جارٍ الاسترجاع...' : 'استرجاع نسخة'}<input type="file" accept="application/json,.json" onChange={handleRestore} disabled={isRestoring} style={{ display: 'none' }} /></label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allFiles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '13px', fontWeight: '600' }}>لا توجد أي مستندات مرفوعة حالياً في النظام.</p>
            ) : (
              [...new Set(allFiles.map((file) => file.sectionId))].map((secId) => {
                const filesList = allFiles.filter((file) => file.sectionId === secId);
                return (
                  <div key={secId} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '14px', background: '#f8fafc' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      السجل / القسم رقم ({secId})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filesList.map(file => (
                        <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="checkbox" checked={selectedIds.includes(file.id)} onChange={() => setSelectedIds((ids) => ids.includes(file.id) ? ids.filter((id) => id !== file.id) : [...ids, file.id])} aria-label={`تحديد ${file.name}`} />
                            <FileText style={{ width: '18px', height: '18px', color: '#059669' }} />
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{file.name}</h4>
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>الحجم: {(file.size / (1024 * 1024)).toFixed(2)} ميجابايت | تاريخ الرفع: {file.date}</span>
                              {file.description && <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{file.description}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button type="button" onClick={() => handleEdit(file)} style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>تعديل</button>
                            <button type="button" onClick={() => handleDelete(file)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700' }} title="حذف المستند"><Trash2 style={{ width: '14px', height: '14px' }} /><span>حذف</span></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}