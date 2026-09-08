import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardCheck, Lock, Search, ChevronRight } from 'lucide-react';

const defaultSections = [
  { id: '1', title: 'الدعم الموحد', category: 'الأنظمة', img: '/الدعم الموحد.jpg', bg: '#e0f2fe', color: '#0284c7' },
  { id: '2', title: 'التقويم المدرسي', category: 'التنظيم', img: '/school-logo.svg', bg: '#d1fae5', color: '#059669' },
  { id: '3', title: 'منصة عين الاثرائية', category: 'المنصات', img: '/عين.jpg', bg: '#fef3c7', color: '#d97706' },
  { id: '4', title: 'حضوري', category: 'الحضور', img: '/حضوري.png', bg: '#ccfbf1', color: '#0d9488' },
  { id: '5', title: 'نظام نور', category: 'الأنظمة', img: '/نور.jpg', bg: '#e0e7ff', color: '#4f46e5' },
  { id: '6', title: 'الصحة المدرسية', category: 'الرعاية', img: '/الصحه المدرسية.jpg', bg: '#fce7f3', color: '#db2777' },
  { id: '7', title: 'التواصل', category: 'العلاقات', img: '/التواصل.png', bg: '#dbeafe', color: '#2563eb' },
  { id: '8', title: 'التقارير والاحصائيات', category: 'التوثيق', img: '/التقارير والاحصائيات.png', bg: '#ede9fe', color: '#7c3aed' },
  { id: '9', title: 'البرامج والأنشطة', category: 'الأنشطة', img: '/البرامج والانشطة.jpg', bg: '#ffedd5', color: '#ea580c' },
  { id: '10', title: 'الانضباط المدرسي', category: 'التوجيه', img: '/الانضباط المدرسي.jpg', bg: '#cffafe', color: '#0891b2' },
  { id: '11', title: 'حماية الطفل', category: 'الطفولة', img: '/حماية الطفل.png', bg: '#ecfccb', color: '#65a30d' },
  { id: '12', title: 'الشراكة', category: 'المجتمع', img: '/الشراكه.jpg', bg: '#fef9c3', color: '#ca8a04' },
  { id: '13', title: 'النشرات والتبليغات', category: 'الإعلام', img: '/النشرات والتبليغات.jpg', bg: '#ffe4e6', color: '#e11d48' },
  { id: '14', title: 'المبادرات و التطوع', category: 'خدمة المجتمع', img: '/المبادرات و التطوع.png', bg: '#fef3c7', color: '#b45309' },
  { id: '15', title: 'منصة روضتي', category: 'المنصات', img: '/منصة روضتي.png', bg: '#d1fae5', color: '#047857' },
  { id: '16', title: 'الانشطة الحركية واللعب في الخارج', category: 'الحركة', img: '/الانشطة الحراكة واللعب في الخارج.jpg', bg: '#dcfce7', color: '#16a34a' },
  { id: '17', title: 'التطوير المهني', category: 'التدريب', img: '/التطوير المهني.webp', bg: '#e0f2fe', color: '#0284c7' },
  { id: '18', title: 'السلوك الوظيفي', category: 'الإدارة', img: '/السلوك التوظيفي.jpg', bg: '#e0e7ff', color: '#4338ca' },
  { id: '19', title: 'المجالس واللجان', category: 'الحوكمة', img: '/المجالس و اللجان.png', bg: '#f3e8ff', color: '#9333ea' },
  { id: '20', title: 'الامن والسلامة البيئية', category: 'السلامة', img: '/السلامة البيئية.jpg', bg: '#d1fae5', color: '#059669' },
  { id: '21', title: 'الخطة التشغيلية', category: 'التخطيط', img: '/الخطة التشغلية.jpg', bg: '#f1f5f9', color: '#475569' },
  { id: '22', title: 'المسابقات', category: 'التحفيز', img: '/المسابقات.png', bg: '#fef3c7', color: '#d97706' },
  { id: '23', title: 'العقد السلوكي', category: 'الإرشاد', img: '/العقد السلوكي.jpg', bg: '#e0f2fe', color: '#0284c7' },
  { id: '24', title: 'اداء المتعلمين', category: 'التقييم', img: '/اداء المتعلمين.jpg', bg: '#dcfce7', color: '#15803d' },
  { id: '25', title: 'المنهج الوطني', category: 'المناهج', img: '/المنهج الوطني.jpg', bg: '#fef3c7', color: '#b45309' },
  { id: '26', title: 'الخطط الأسبوعية التعليمية', category: 'الخطط', img: '/school-logo.svg', bg: '#dbeafe', color: '#2563eb' },
  { id: '27', title: 'الخطط الأسبوعية للبرامج والأنشطة', category: 'الخطط', img: '/school-logo.svg', bg: '#ffedd5', color: '#ea580c' },
  { id: '28', title: 'اللوائح والأنظمة', category: 'الأنظمة', img: '/ministry-official.jpg', bg: '#e0f2fe', color: '#0284c7' },
  { id: '29', title: 'الأدلة', category: 'المراجع', img: '/school-logo.svg', bg: '#ecfccb', color: '#65a30d' },
  { id: '30', title: 'متابعة السجلات', category: 'المتابعة', img: '/ministry-logo.svg', bg: '#e0f2fe', color: '#0369a1', isFollowUp: true },
];

export default function Home() {
  const navigate = useNavigate();

  const [years, setYears] = useState(() => {
    const saved = localStorage.getItem('kindergarten_admin_years');
    return saved ? JSON.parse(saved) : ['2028', '2027', '2026', '2025', '2024', '2023'];
  });

  const [selectedYear, setSelectedYear] = useState(years[0] || '2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  useEffect(() => {
    const handleStorageChange = () => {
      const savedYears = localStorage.getItem('kindergarten_admin_years');
      if (savedYears) {
        const parsedYears = JSON.parse(savedYears);
        setYears(parsedYears);
        if (!parsedYears.includes(selectedYear)) {
          setSelectedYear(parsedYears[0] || '2026');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedYear]);

  const [sections] = useState(() => {
    const saved = localStorage.getItem('kindergarten_admin_sections');
    return saved ? JSON.parse(saved) : defaultSections;
  });

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'الكل' || sec.category === selectedCategory)
  );
  
  const categories = ['الكل', ...new Set(sections.map((section) => section.category))];

  return (
    <div className="home-shell" style={{ minHeight: '100vh', backgroundColor: '#fdfbf7', color: '#1e293b', direction: 'rtl' }}>
      
      {/* الهيدر العلوي الرسمي */}
      <header className="home-header" style={{ padding: '16px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', borderBottom: '2px solid #e7dfd5' }}>
        <div className="brand-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="brand-logos" aria-label="شعار وزارة التعليم وشعار روضة آل مشول" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="brand-logo ministry-logo-frame"><img src="/ministry-logo.svg" alt="شعار وزارة التعليم" style={{ width: '35px', height: '35px', objectFit: 'contain' }} /></span>
            <span className="brand-logo school-logo-frame"><img src="/school-logo.svg" alt="شعار روضة آل مشول" style={{ width: '35px', height: '35px', objectFit: 'contain' }} /></span>
          </div>
          <div className="brand-copy">
            <span className="ministry-label" style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>وزارة التعليم</span>
            <span className="school-label" style={{ display: 'block', fontSize: '12px', color: '#0f172a', fontWeight: '800' }}>روضة آل مشول الحكومية</span>
            <h1 style={{ fontSize: '15px', fontWeight: '900', color: '#1e3a8a', margin: 0 }}>سجلات الروضة - أداء الروضة</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '15px', height: '15px', color: '#0369a1' }} />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ background: 'transparent', color: '#1e293b', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}
            >
              {years.map(yr => (
                <option key={yr} value={yr}>عام {yr}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => navigate('/admin')}
            style={{ background: '#1e3a8a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}
          >
            <Lock style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
            <span>لوحة التحكم</span>
          </button>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="home-main" style={{ maxWidth: '1350px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* الترويسة الرئيسية */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', marginBottom: '8px', border: '1px solid #bfdbfe' }}>
            اداء الروضة (العام: {selectedYear})
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '5px' }}>
            سجلات الروضة
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>روضة آل مشول الحكومية</p>
        </div>

        {/* شريط البحث */}
        <div className="search-tools" style={{ maxWidth: '620px', margin: '0 auto 35px auto', position: 'relative' }}>
          <Search style={{ position: 'absolute', right: '14px', top: '12px', width: '16px', height: '16px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="ابحث عن السجل المطلوب..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 18px 10px 42px', borderRadius: '12px', color: '#1e293b', outline: 'none', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', fontFamily: 'inherit' }}
          />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="تصفية الأقسام حسب التصنيف" style={{ width: '100%', marginTop: '10px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '12px', color: '#1e293b', outline: 'none', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>
            {categories.map((category) => <option key={category} value={category}>{category === 'الكل' ? 'كل التصنيفات' : category}</option>)}
          </select>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontWeight: '700' }}>عرض {filteredSections.length} من {sections.length} سجل</p>
        </div>

        {/* شبكة أقسام الأرشيف */}
        <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '18px' }}>
          {filteredSections.map((sec) => (
            <div 
              key={sec.id}
              onClick={() => navigate(sec.isFollowUp ? '/follow-up' : `/section/${sec.id}`)}
              style={{ 
                background: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '16px', 
                padding: '18px', 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = sec.color || '#2563eb';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: sec.bg || '#e0f2fe', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)' }}>
                  {sec.isFollowUp ? (
                    <ClipboardCheck style={{ width: '38px', height: '38px', color: sec.color || '#0369a1' }} />
                  ) : (
                    <img 
                      src={sec.img || '/school-logo.svg'} 
                      alt={sec.title} 
                      style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px' }} 
                      onError={(e) => { e.target.src = '/school-logo.svg'; }} 
                    />
                  )}
                  <span style={{ fontSize: '10px', color: '#475569', background: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {sec.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>{sec.title}</h3>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#000000', fontWeight: '800' }}>
                <span>استعراض السجل</span>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}