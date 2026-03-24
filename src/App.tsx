import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { BookOpen, Calendar, FileText, HelpCircle, GraduationCap, Upload, Loader2, Send, Library } from 'lucide-react';
import { generateCourseList, generateStudySchedule, summarizeDocument, generateQuiz, explainConcept } from './services/gemini';
import { cn } from './lib/utils';

type TabType = 'courses' | 'schedule' | 'summary' | 'quiz' | 'chat' | 'extra';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-primary">
          <GraduationCap className="w-8 h-8" />
          <h1 className="text-xl font-bold">المساعد الجامعي</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<BookOpen />} label="حصر الكورسات" isActive={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
          <NavItem icon={<Calendar />} label="تنظيم الوقت" isActive={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem icon={<FileText />} label="مراجعة الكتب" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <NavItem icon={<Library />} label="الكتب الإضافية" isActive={activeTab === 'extra'} onClick={() => setActiveTab('extra')} />
          <NavItem icon={<HelpCircle />} label="توليد امتحانات" isActive={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
          <NavItem icon={<Send />} label="شرح الأسئلة" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[80vh]">
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'summary' && <SummaryTab isExtra={false} />}
          {activeTab === 'extra' && <SummaryTab isExtra={true} />}
          {activeTab === 'quiz' && <QuizTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right",
        isActive 
          ? "bg-blue-50 text-blue-700 font-semibold" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// --- Tab Components ---

function CoursesTab() {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [major, setMajor] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!country || !city || !major) return;
    setLoading(true);
    try {
      const res = await generateCourseList(country, city, major, freeOnly);
      setResult(res);
    } catch (error) {
      setResult('حدث خطأ أثناء جلب البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">حصر الكورسات</h2>
        <p className="text-slate-500">ابحث عن الكورسات الحضورية والأونلاين المناسبة لتخصصك ومنطقتك.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="الدولة (مثال: مصر)" className="input-field" value={country} onChange={e => setCountry(e.target.value)} />
        <input type="text" placeholder="المحافظة/المدينة" className="input-field" value={city} onChange={e => setCity(e.target.value)} />
        <input type="text" placeholder="التخصص (مثال: حاسبات)" className="input-field" value={major} onChange={e => setMajor(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="freeOnly" 
          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          checked={freeOnly}
          onChange={e => setFreeOnly(e.target.checked)}
        />
        <label htmlFor="freeOnly" className="text-slate-700 font-medium cursor-pointer select-none">
          عرض الكورسات المجانية فقط (غير المدفوعة)
        </label>
      </div>
      
      <button onClick={handleGenerate} disabled={loading || !country || !city || !major} className="btn-primary w-full md:w-auto">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'البحث عن الكورسات'}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div className="markdown-body"><Markdown>{result}</Markdown></div>
        </div>
      )}
    </div>
  );
}

function ScheduleTab() {
  const [courses, setCourses] = useState('');
  const [hours, setHours] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!courses || !hours) return;
    setLoading(true);
    try {
      const res = await generateStudySchedule(courses, hours);
      setResult(res);
    } catch (error) {
      setResult('حدث خطأ أثناء توليد الجدول.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">تنظيم الوقت وجدول المذاكرة</h2>
        <p className="text-slate-500">أدخل موادك وساعات فراغك لنقوم بإنشاء جدول مذاكرة مخصص لك.</p>
      </div>
      
      <div className="space-y-4">
        <textarea 
          placeholder="أدخل أسماء الكورسات أو المواد (مفصولة بفاصلة)..." 
          className="input-field min-h-[100px] resize-y" 
          value={courses} 
          onChange={e => setCourses(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="عدد ساعات المذاكرة المتاحة يومياً" 
          className="input-field w-full md:w-1/2" 
          value={hours} 
          onChange={e => setHours(e.target.value)} 
        />
      </div>
      
      <button onClick={handleGenerate} disabled={loading || !courses || !hours} className="btn-primary w-full md:w-auto">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'إنشاء الجدول'}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div className="markdown-body"><Markdown>{result}</Markdown></div>
        </div>
      )}
    </div>
  );
}

function SummaryTab({ isExtra }: { isExtra: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await summarizeDocument(base64Data, file.type, isExtra);
          setResult(res);
        } catch (err) {
          setResult('حدث خطأ أثناء تلخيص المستند. تأكد من أن حجم الملف مناسب.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setResult('حدث خطأ في قراءة الملف.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isExtra ? 'تلخيص الكتب الإضافية (الجمعية)' : 'مراجعة الكتب الجامعية'}
        </h2>
        <p className="text-slate-500">
          ارفع ملف PDF للكتاب وسنقوم بتلخيصه وتقسيمه لأجزاء يسهل مذاكرتها.
        </p>
      </div>
      
      <div 
        className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">{file ? file.name : 'اضغط هنا لرفع ملف PDF'}</p>
        <p className="text-slate-400 text-sm mt-2">الحد الأقصى للملفات يعتمد على المتصفح</p>
      </div>
      
      <button onClick={handleGenerate} disabled={loading || !file} className="btn-primary w-full md:w-auto">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تلخيص الكتاب'}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div className="markdown-body"><Markdown>{result}</Markdown></div>
        </div>
      )}
    </div>
  );
}

function QuizTab() {
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const res = await generateQuiz(context);
      setResult(res);
    } catch (error) {
      setResult('حدث خطأ أثناء توليد الامتحان.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">توليد أسئلة وامتحانات</h2>
        <p className="text-slate-500">أدخل ملخص الفصل أو المحتوى الذي تريد التدرب عليه.</p>
      </div>
      
      <textarea 
        placeholder="الصق المحتوى أو الملخص هنا لتوليد الأسئلة..." 
        className="input-field min-h-[200px] resize-y" 
        value={context} 
        onChange={e => setContext(e.target.value)} 
      />
      
      <button onClick={handleGenerate} disabled={loading || !context} className="btn-primary w-full md:w-auto">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'توليد الامتحان'}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div className="markdown-body"><Markdown>{result}</Markdown></div>
        </div>
      )}
    </div>
  );
}

function ChatTab() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;
    
    const userMsg = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    try {
      const res = await explainConcept(userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', content: res }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'حدث خطأ أثناء محاولة الشرح.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">شرح الأسئلة الصعبة</h2>
        <p className="text-slate-500">اسأل عن أي مفهوم أو سؤال صعب وسأقوم بشرحه خطوة بخطوة.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[400px]">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            ابدأ بطرح سؤالك هنا...
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-start" : "justify-end")}>
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
              )}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="markdown-body !text-sm"><Markdown>{msg.content}</Markdown></div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="اكتب سؤالك هنا..." 
          className="input-field flex-1" 
          value={question} 
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !question.trim()} 
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
        >
          <Send className="w-6 h-6 rotate-180" />
        </button>
      </div>
    </div>
  );
}
