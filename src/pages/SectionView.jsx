import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Download, Eye, Lock } from 'lucide-react';
import { downloadFile, getFiles } from '../storage';

export default function SectionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // قائمة أسماء الأقسام الرسمية
  const sectionNames = {
    '1': 'الدعم الموحد',
    '2': 'التقويم المدرسي',
    '3': 'منصة عين الاثرائية',
    '4': 'حضوري',
    '5': 'نظام نور',
    '6': 'الصحة المدرسية',
    '7': 'التواصل',
    '8': 'التقارير والاحصائيات',
    '9': 'البرامج والأنشطة',
    '10': 'الانضباط المدرسي',
    '11': 'حماية الطفل',
    '12': 'الشراكة',
    '13': 'النشرات والتبليغات',
    '14': 'المبادرات و التطوع',
    '15': 'منصة روضتي',
    '16': 'الانشطة الحركية واللعب في الخارج',
    '17': 'التطوير المهني',
    '18': 'السلوك الوظيفي',
    '19': 'المجالس واللجان',
    '20': 'الامن والسلامة البيئية',
    '21': 'الخطة التشغيلية',
    '22': 'المسابقات',
    '23': 'العقد السلوكي',
    '24': 'اداء المتعلمين',
    '25': 'المنهج الوطني',
    '26': 'الخطط الأسبوعية التعليمية',
    '27': 'الخطط الأسبوعية للبرامج والأنشطة',
    '28': 'اللوائح والأنظمة',
    '29': 'الأدلة'
    , '30': 'متابعة السجلات'
  };

  const currentSectionTitle = sectionNames[id] || `القسم رقم (${id})`;
  const [files, setFiles] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    getFiles(id)
      .then((savedFiles) => {
        if (active) setFiles(savedFiles);
      })
      .catch(() => {
        if (active) setNotice('تعذر تحميل الملفات. حاول تحديث الصفحة.');
      });

    return () => { active = false; };
  }, [id]);

  // دالة معاينة الملف الحقيقي (فتح الملف في تبويب جديد لو متاح كـ Data URL أو رابط)
  const handlePreview = async (file) => {
    try {
      const blob = await downloadFile(file);
      const fileUrl = URL.createObjectURL(blob);
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } catch {
      setNotice('تعذر معاينة الملف. تأكد من اتصال الإنترنت وصلاحية التخزين.');
    }
  };

  // دالة تحميل الملف الحقيقي
  const handleDownload = async (file) => {
    try {
      const blob = await downloadFile(file);
      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileUrl);
    } catch {
      setNotice('تعذر تحميل الملف. تأكد من اتصال الإنترنت وصلاحية التخزين.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', padding: '30px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* الهيدر العلوي وزر العودة */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#ffffff', padding: '20px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowRight style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            </button>
            <div>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>روضة آل مشول الحكومية</span>
              <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>سجل: {currentSectionTitle}</h1>
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin')}
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}
          >
            <Lock style={{ width: '13px', height: '13px', color: '#2563eb' }} />
            <span>لوحة التحكم (الإدارة)</span>
          </button>
        </div>

        {/* قائمة الملفات والمستندات الخاصة بالقسم */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {notice && <div role="status" style={{ background: '#fff7ed', color: '#c2410c', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '700' }}>{notice}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>المستندات والملفات المعتمدة للاطلاع</h3>
            <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              إجمالي الملفات: {files.length}
            </span>
          </div>
          
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>لا توجد ملفات مرفوعة في هذا السجل حالياً.</p>
              <button 
                onClick={() => navigate('/admin')}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                انتقل للوحة التحكم لرفع ملف جديد
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {files.map(file => (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#dbeafe', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
                      <FileText style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{file.name}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>الحجم: {(file.size / (1024 * 1024)).toFixed(2)} ميجابايت | تاريخ الرفع: {file.date}</span>
                      {file.description && <p style={{ fontSize: '12px', color: '#475569', marginTop: '5px' }}>{file.description}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handlePreview(file)} 
                      style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700' }}
                    >
                      <Eye style={{ width: '14px', height: '14px' }} />
                      <span>معاينة</span>
                    </button>
                    <button 
                      onClick={() => handleDownload(file)} 
                      style={{ background: '#d1fae5', color: '#059669', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700' }}
                    >
                      <Download style={{ width: '14px', height: '14px' }} />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}