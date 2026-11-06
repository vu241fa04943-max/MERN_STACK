import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  ClipboardCheck,
  Crop,
  Download,
  FileText,
  Globe2,
  GraduationCap,
  Grip,
  Lightbulb,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const freshResume = {
  personal: {
    name: "Alex Morgan",
    title: "Senior Software Engineer",
    email: "alex.morgan@email.com",
    phone: "+1 (415) 555-0184",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    photo: "",
    photoOriginal: "",
    photoCrop: { zoom: 1, x: 50, y: 50 },
    dob: "1992-08-14",
    nationality: "American",
    maritalStatus: "",
  },
  summary:
    "Product-minded software engineer with 8+ years of experience building reliable web platforms and leading cross-functional teams. Known for translating ambiguous problems into elegant, measurable solutions.",
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Northstar Labs",
      location: "San Francisco, CA",
      start: "2022-03",
      end: "Present",
      bullets: [
        "Led a 5-person team to rebuild the customer dashboard, reducing page load time by 42% and support tickets by 28%.",
        "Designed event-driven services handling 2M+ daily events with 99.95% availability.",
        "Introduced an accessible component system adopted across 4 product teams.",
      ],
    },
    {
      role: "Software Engineer",
      company: "Brightside Digital",
      location: "Oakland, CA",
      start: "2019-06",
      end: "2022-02",
      bullets: [
        "Shipped 12 customer-facing features in React and Node.js, contributing to a 17% increase in activation.",
        "Automated release checks and cut deployment time from 45 minutes to under 10.",
      ],
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "System Design", "PostgreSQL", "AWS", "Accessibility", "Team Leadership"],
  education: [
    { degree: "B.S. Computer Science", school: "University of California, Berkeley", location: "Berkeley, CA", start: "2011", end: "2015", details: "Magna Cum Laude" },
  ],
  projects: [
    { name: "Open Source Design System", link: "github.com/alexmorgan/ui-kit", bullets: ["Built a 40-component accessible React library used by 1,200+ developers."] },
  ],
  declaration: "I hereby declare that the information provided above is true and correct to the best of my knowledge.",
};

const sampleProfiles = {
  "Software Engineer": freshResume,
  "Product Manager": {
    ...freshResume,
    personal: { ...freshResume.personal, name: "Priya Shah", title: "Principal Product Manager", email: "priya.shah@email.com", phone: "+91 98765 43210", location: "Bengaluru, India", linkedin: "linkedin.com/in/priyashah", nationality: "Indian", photo: "", photoOriginal: "" },
    summary: "Strategic product leader with 9 years of experience taking data-rich products from discovery to scale. Builds high-trust teams and aligns customer insight, business goals, and engineering execution to deliver durable growth.",
    experience: [
      { role: "Principal Product Manager", company: "OrbitPay", location: "Bengaluru, India", start: "2022-01", end: "Present", bullets: ["Owned the roadmap for a payments platform serving 3.2M monthly users across 4 markets.", "Launched a risk-based onboarding flow that lifted verified sign-ups by 31% while reducing fraud by 18%.", "Built a quarterly planning rhythm connecting 6 engineering squads to measurable company outcomes."] },
      { role: "Senior Product Manager", company: "Finwise", location: "Mumbai, India", start: "2018-05", end: "2021-12", bullets: ["Led customer research and experimentation that improved first-month retention by 22%.", "Introduced a self-serve analytics suite, reducing bespoke reporting requests by 40%."] },
    ],
    skills: ["Product Strategy", "Roadmapping", "Customer Research", "SQL", "Experimentation", "Product Analytics", "Agile Delivery", "Stakeholder Leadership"],
    education: [{ degree: "MBA, Strategy & Marketing", school: "Indian Institute of Management, Bangalore", location: "Bengaluru, India", start: "2013", end: "2015", details: "Dean's List" }, { degree: "B.E. Information Science", school: "RV College of Engineering", location: "Bengaluru, India", start: "2009", end: "2013", details: "First Class Honors" }],
    projects: [{ name: "Women in Product India", link: "womenpm.in", bullets: ["Created a peer mentorship network supporting 300+ early-career product managers."] }],
  },
};

const templates = ["Corporate", "Minimalist", "Tech Split", "Executive Editorial", "India Format", "Europass"];
const initialJobDescription = "";
const phoneCountries = [
  { name: "United States", dialCode: "+1" },
  { name: "United Kingdom", dialCode: "+44" },
  { name: "India", dialCode: "+91" },
  { name: "Australia", dialCode: "+61" },
  { name: "New Zealand", dialCode: "+64" },
  { name: "Germany", dialCode: "+49" },
  { name: "France", dialCode: "+33" },
  { name: "Italy", dialCode: "+39" },
  { name: "Spain", dialCode: "+34" },
  { name: "Netherlands", dialCode: "+31" },
  { name: "Singapore", dialCode: "+65" },
  { name: "Japan", dialCode: "+81" },
  { name: "United Arab Emirates", dialCode: "+971" },
];

function normalizePersonal(personal = {}) {
  const normalized = {
    ...freshResume.personal,
    ...personal,
    photoCrop: { ...freshResume.personal.photoCrop, ...personal.photoCrop },
  };
  delete normalized.website;
  normalized.photoOriginal = normalized.photoOriginal || normalized.photo || "";

  const phone = String(normalized.phone || "").trim();
  if (phone && !phone.startsWith("+")) normalized.phone = `${personal.phoneCountry || "+1"} ${phone}`;
  delete normalized.phoneCountry;
  return normalized;
}

function formatPhone(personal) {
  const phone = String(personal.phone || "").trim();
  if (!phone || /^\+\d+$/.test(phone)) return "";
  return phone.startsWith("+") ? phone : `+1 ${phone}`;
}

function createCroppedPhoto(source, crop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const baseSize = Math.min(image.naturalWidth, image.naturalHeight);
      const cropSize = baseSize / crop.zoom;
      const maxX = image.naturalWidth - cropSize;
      const maxY = image.naturalHeight - cropSize;
      const sourceX = Math.max(0, maxX * crop.x / 100);
      const sourceY = Math.max(0, maxY * crop.y / 100);
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Could not create photo crop"));
      context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 512, 512);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    image.onerror = reject;
    image.src = source;
  });
}

function formatDate(value) {
  if (!value || value === "Present") return value || "";
  const date = new Date(`${value}-02`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ContactLine({ icon: Icon, children }) {
  if (!children) return null;
  return <div className="flex items-center gap-1.5 text-[9px] leading-4 text-slate-600"><Icon size={11} className="shrink-0" />{children}</div>;
}

function ResumePhoto({ personal, className }) {
  if (!personal.photo) return null;
  return <img src={personal.photo} alt="Profile" className={`object-cover ${className}`} />;
}

function ResumeSections({ data, compact = false, showEducation = true }) {
  const heading = compact ? "mb-1.5 border-b border-current/20 pb-1 text-[9px] font-bold uppercase tracking-[0.16em]" : "mb-2 border-b border-slate-200 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-800";
  return <>
    {data.summary && <section className="mb-4"><h2 className={heading}>Profile</h2><p className="text-[10px] leading-[1.55] text-slate-700">{data.summary}</p></section>}
    {!!data.experience.length && <section className="mb-4"><h2 className={heading}>Experience</h2><div className="space-y-3">{data.experience.map((job, i) => <div key={`${job.company}-${i}`}>
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-[10px] font-bold text-slate-900">{job.role || "Role"}</h3><p className="text-[9px] font-medium text-slate-600">{job.company}{job.location ? ` · ${job.location}` : ""}</p></div><span className="shrink-0 text-[8px] text-slate-500">{formatDate(job.start)}{job.end ? ` – ${formatDate(job.end)}` : ""}</span></div>
      {!!job.bullets.length && <ul className="mt-1 list-disc space-y-0.5 pl-3 text-[9px] leading-[1.45] text-slate-700">{job.bullets.filter(Boolean).map((bullet, j) => <li key={j}>{bullet}</li>)}</ul>}
    </div>)}</div></section>}
    {!!data.projects.length && <section className="mb-4"><h2 className={heading}>Projects</h2><div className="space-y-2">{data.projects.map((project, i) => <div key={`${project.name}-${i}`}><div className="flex justify-between gap-2"><h3 className="text-[10px] font-bold">{project.name || "Project"}</h3><span className="text-[8px] text-slate-500">{project.link}</span></div><ul className="mt-1 list-disc pl-3 text-[9px] leading-[1.45] text-slate-700">{project.bullets.filter(Boolean).map((bullet, j) => <li key={j}>{bullet}</li>)}</ul></div>)}</div></section>}
    {showEducation && !!data.education.length && <section className="mb-4"><h2 className={heading}>Education</h2><div className="space-y-2">{data.education.map((school, i) => <div key={`${school.school}-${i}`} className="flex justify-between gap-3"><div><h3 className="text-[10px] font-bold">{school.degree}</h3><p className="text-[9px] text-slate-600">{school.school}{school.location ? ` · ${school.location}` : ""}</p>{school.details && <p className="text-[8px] italic text-slate-500">{school.details}</p>}</div><span className="shrink-0 text-[8px] text-slate-500">{school.start}{school.end ? ` – ${school.end}` : ""}</span></div>)}</div></section>}
  </>;
}

function CorporateTemplate({ resumeData: d, accentColor }) {
  return <div className="h-full bg-white px-[9%] py-[8%] text-slate-900"><header className="mb-5 border-b-2 pb-4" style={{ borderColor: accentColor }}><h1 className="text-[25px] font-bold tracking-tight">{d.personal.name || "Your Name"}</h1><p className="mt-0.5 text-[12px] font-medium" style={{ color: accentColor }}>{d.personal.title}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1"><ContactLine icon={Mail}>{d.personal.email}</ContactLine><ContactLine icon={Phone}>{formatPhone(d.personal)}</ContactLine><ContactLine icon={MapPin}>{d.personal.location}</ContactLine></div></header>{d.personal.photo && <div className="mb-4"><ResumePhoto personal={d.personal} className="h-16 w-16 rounded-full" /></div>}<ResumeSections data={d} /></div>;
}

function MinimalistTemplate({ resumeData: d }) {
  return <div className="h-full bg-white px-[10%] py-[9%] font-serif text-slate-900"><header className="mb-6 text-center">{d.personal.photo && <ResumePhoto personal={d.personal} className="mx-auto mb-3 h-16 w-16 rounded-full" />}<h1 className="text-[23px] font-semibold tracking-wide">{d.personal.name || "Your Name"}</h1><p className="mt-1 text-[10px] italic">{d.personal.title}</p><p className="mt-2 text-[8px] text-slate-600">{[d.personal.email, formatPhone(d.personal), d.personal.location].filter(Boolean).join("  |  ")}</p><div className="mx-auto mt-3 w-10 border-t border-slate-400" /></header><ResumeSections data={d} /></div>;
}

function TechSplitTemplate({ resumeData: d, accentColor }) {
  return <div className="flex h-full bg-white text-slate-900"><aside className="w-[34%] shrink-0 px-5 py-7 text-white" style={{ backgroundColor: accentColor }}>{d.personal.photo && <ResumePhoto personal={d.personal} className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-white/70" />}<div className="mb-5"><h1 className="text-[19px] font-bold leading-tight">{d.personal.name || "Your Name"}</h1><p className="mt-1 text-[10px] text-white/80">{d.personal.title}</p></div><h2 className="mb-2 border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-widest">Contact</h2><div className="mb-5 space-y-1.5 break-words text-[8px] text-white/90">{[d.personal.email, formatPhone(d.personal), d.personal.location, d.personal.linkedin].filter(Boolean).map((x) => <p key={x}>{x}</p>)}</div><h2 className="mb-2 border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-widest">Skills</h2><ul className="space-y-1 text-[9px] text-white/90">{d.skills.map((skill, i) => <li key={`${skill}-${i}`}>{skill}</li>)}</ul></aside><main className="min-w-0 flex-1 px-6 py-7"><ResumeSections data={d} compact /></main></div>;
}

function ExecutiveTemplate({ resumeData: d, accentColor }) {
  return <div className="h-full bg-white px-[9%] py-[8%] font-serif text-slate-900"><header className="mb-5 border-b border-slate-300 pb-4">{d.personal.photo && <ResumePhoto personal={d.personal} className="mb-3 h-16 w-16 rounded-sm" />}<p className="mb-1 text-[8px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>Professional Profile</p><h1 className="text-[24px] font-bold leading-tight">{d.personal.name || "Your Name"}</h1><div className="mt-2 flex items-center justify-between gap-4"><p className="text-[11px] italic">{d.personal.title}</p><p className="text-right font-sans text-[8px] text-slate-500">{[d.personal.email, formatPhone(d.personal), d.personal.location].filter(Boolean).join("  ·  ")}</p></div></header><ResumeSections data={d} /></div>;
}

function IndiaTemplate({ resumeData: d, accentColor }) {
  return <div className="h-full bg-white px-[7%] py-[6%] text-slate-900"><header className="mb-4 flex items-start justify-between border-b pb-3" style={{ borderColor: accentColor }}><div><h1 className="text-[21px] font-bold">{d.personal.name || "Your Name"}</h1><p className="text-[11px] font-medium" style={{ color: accentColor }}>{d.personal.title}</p><div className="mt-2 space-y-0.5 text-[8px] text-slate-600"><p>{d.personal.email} · {d.personal.phone}</p><p>{d.personal.location}{d.personal.website ? ` · ${d.personal.website}` : ""}</p></div></div>{d.personal.photo ? <img src={d.personal.photo} alt="Profile" className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UserRound size={25} /></div>}</header><div className="mb-3 grid grid-cols-3 gap-2 border border-slate-200 p-2 text-[8px]"><p><b>Date of Birth:</b> {d.personal.dob || "—"}</p><p><b>Nationality:</b> {d.personal.nationality || "—"}</p><p><b>Marital Status:</b> {d.personal.maritalStatus || "—"}</p></div><ResumeSections data={d} showEducation={false} /><section className="mb-4"><h2 className="mb-1 border-b border-slate-200 pb-1 text-[9px] font-bold uppercase tracking-widest">Education</h2><table className="w-full border-collapse text-left text-[8px]"><thead><tr className="bg-slate-50"><th className="border border-slate-200 p-1.5">Qualification</th><th className="border border-slate-200 p-1.5">Institution</th><th className="border border-slate-200 p-1.5">Year</th></tr></thead><tbody>{d.education.map((school, i) => <tr key={`${school.school}-${i}`}><td className="border border-slate-200 p-1.5">{school.degree}{school.details ? `, ${school.details}` : ""}</td><td className="border border-slate-200 p-1.5">{school.school}{school.location ? `, ${school.location}` : ""}</td><td className="border border-slate-200 p-1.5">{school.start}{school.end ? ` – ${school.end}` : ""}</td></tr>)}</tbody></table></section><section className="mt-2"><h2 className="mb-1 border-b border-slate-200 pb-1 text-[9px] font-bold uppercase tracking-widest">Declaration</h2><p className="text-[8px] leading-relaxed text-slate-600">{d.declaration}</p><p className="mt-3 text-right text-[8px]">{d.personal.location}{d.personal.name ? `, ${d.personal.name}` : ""}</p></section></div>;
}

function EuropassTemplate({ resumeData: d, accentColor }) {
  const label = "w-[26%] shrink-0 pt-0.5 text-[8px] font-bold uppercase tracking-wider";
  return <div className="h-full bg-white px-[8%] py-[7%] text-slate-900"><header className="mb-5 flex gap-4 border-b pb-4" style={{ borderColor: accentColor }}>{d.personal.photo && <img src={d.personal.photo} alt="Profile" className="h-16 w-16 rounded-sm object-cover" />}<div><p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: accentColor }}>Curriculum Vitae</p><h1 className="mt-1 text-[22px] font-bold">{d.personal.name || "Your Name"}</h1><p className="text-[10px] text-slate-600">{d.personal.title}</p><p className="mt-1 text-[8px] text-slate-500">{[d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).join("  ·  ")}</p></div></header><div className="space-y-3"><div className="flex gap-3"><h2 className={label}>Profile</h2><p className="text-[9px] leading-relaxed text-slate-700">{d.summary}</p></div><div className="flex gap-3"><h2 className={label}>Work Experience</h2><div className="min-w-0 flex-1 space-y-3">{d.experience.map((job, i) => <div key={i}><p className="text-[9px] font-bold">{job.role}</p><p className="text-[8px] text-slate-600">{job.company} · {formatDate(job.start)} – {formatDate(job.end)}</p><ul className="mt-1 list-disc pl-3 text-[8px] leading-relaxed text-slate-700">{job.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</div></div><div className="flex gap-3"><h2 className={label}>Education</h2><div className="flex-1 space-y-2">{d.education.map((e, i) => <p key={i} className="text-[9px]"><b>{e.degree}</b><br /><span className="text-slate-600">{e.school} · {e.start} – {e.end}</span></p>)}</div></div><div className="flex gap-3"><h2 className={label}>Skills</h2><p className="flex-1 text-[9px] leading-relaxed">{d.skills.join(" · ")}</p></div><div className="flex gap-3"><h2 className={label}>Projects</h2><div className="flex-1">{d.projects.map((p, i) => <p key={i} className="text-[9px]"><b>{p.name}</b> {p.bullets.join(" ")}</p>)}</div></div></div></div>;
}

const templateComponents = {
  Corporate: CorporateTemplate,
  Minimalist: MinimalistTemplate,
  "Tech Split": TechSplitTemplate,
  "Executive Editorial": ExecutiveTemplate,
  "India Format": IndiaTemplate,
  Europass: EuropassTemplate,
};

function Field({ label, value, onChange, placeholder, type = "text" }) {
  if (label === "Phone") {
    const country = phoneCountries.find(({ dialCode }) => value?.startsWith(`${dialCode} `) || value === dialCode) || phoneCountries[0];
    const nationalNumber = value?.startsWith(country.dialCode) ? value.slice(country.dialCode.length).trim() : value || "";
    return <label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-600">Phone number</span><div className="flex gap-2"><select aria-label="Phone country code" value={country.dialCode} onChange={(event) => onChange(`${event.target.value} ${nationalNumber}`.trim())} className="w-[45%] min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-[11px] outline-none focus:border-teal-600"><option value="" disabled>Country</option>{phoneCountries.map((option) => <option key={option.dialCode} value={option.dialCode}>{option.name} ({option.dialCode})</option>)}</select><input aria-label="Phone number" type="tel" value={nationalNumber} placeholder="555 000 0000" onChange={(event) => onChange(`${country.dialCode} ${event.target.value}`.trim())} className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" /></div></label>;
  }
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-600">{label}</span><input type={type} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" /></label>;
}

function App() {
  const [resume, setResume] = useState(() => structuredClone(freshResume));
  const [activeTab, setActiveTab] = useState("Editor");
  const [openSection, setOpenSection] = useState("Personal Details");
  const [template, setTemplate] = useState("Corporate");
  const [accent, setAccent] = useState("#0f766e");
  const [font, setFont] = useState("Sans");
  const [region, setRegion] = useState("US");
  const [zoom, setZoom] = useState(0.82);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [audit, setAudit] = useState(null);
  const [toast, setToast] = useState("");
  const [exampleMenu, setExampleMenu] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPhotoCropOpen, setIsPhotoCropOpen] = useState(false);
  const importRef = useRef(null);
  const photoRef = useRef(null);
  const resumePaperRef = useRef(null);
  const photoCropRequestRef = useRef(0);
  const photoCropDraftRef = useRef(resume.personal.photoCrop);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setToast(""), 2600);
  };
  const updatePersonal = (key, value) => setResume((r) => ({ ...r, personal: { ...r.personal, [key]: value } }));
  const updateItem = (section, index, key, value) => setResume((r) => ({ ...r, [section]: r[section].map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const updateBullet = (section, index, bulletIndex, value) => setResume((r) => ({ ...r, [section]: r[section].map((item, i) => i === index ? { ...item, bullets: item.bullets.map((bullet, j) => j === bulletIndex ? value : bullet) } : item) }));
  const addItem = (section, item) => setResume((r) => ({ ...r, [section]: [...r[section], item] }));
  const removeItem = (section, index) => setResume((r) => ({ ...r, [section]: r[section].filter((_, i) => i !== index) }));
  const selectedTemplate = useMemo(() => templateComponents[template] || CorporateTemplate, [template]);
  const ResumeView = selectedTemplate;

  const loadExample = (name) => {
    setResume(structuredClone(sampleProfiles[name]));
    photoCropDraftRef.current = sampleProfiles[name].personal.photoCrop;
    setExampleMenu(false);
    notify(`${name} example loaded`);
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(resume.personal.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-resume.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Resume JSON exported");
  };
  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !parsed.personal || !Array.isArray(parsed.experience)) throw new Error("Invalid resume format");
      const personal = normalizePersonal(parsed.personal);
      photoCropDraftRef.current = personal.photoCrop;
      setResume({ ...structuredClone(freshResume), ...parsed, personal, experience: parsed.experience, education: parsed.education || [], projects: parsed.projects || [], skills: parsed.skills || [] });
      notify("Resume JSON imported");
    } catch {
      notify("Could not read that resume JSON");
    }
    event.target.value = "";
  };
  const photoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const source = reader.result;
        const crop = { zoom: 1, x: 50, y: 50 };
        photoCropDraftRef.current = crop;
        setResume((r) => ({ ...r, personal: { ...r.personal, photo: source, photoOriginal: source, photoCrop: crop } }));
        setIsPhotoCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const updatePhotoCrop = async (key, value) => {
    const crop = { ...photoCropDraftRef.current, [key]: Number(value) };
    photoCropDraftRef.current = crop;
    const source = resume.personal.photoOriginal || resume.personal.photo;
    const requestId = ++photoCropRequestRef.current;
    setResume((r) => ({ ...r, personal: { ...r.personal, photoCrop: crop } }));
    if (!source) return;

    try {
      const photo = await createCroppedPhoto(source, crop);
      if (requestId === photoCropRequestRef.current) {
        setResume((r) => ({ ...r, personal: { ...r.personal, photo, photoCrop: crop } }));
      }
    } catch {
      notify("Could not crop that photo");
    }
  };
  const generateSummary = () => {
    const lead = resume.experience[0];
    const skills = resume.skills.slice(0, 3).join(", ");
    const years = resume.experience.length > 1 ? "seasoned" : "motivated";
    setResume((r) => ({ ...r, summary: `${years} ${r.personal.title || "professional"} with experience at ${lead?.company || "high-performing teams"}. Combines strengths in ${skills || "collaboration and problem-solving"} to deliver measurable outcomes and build lasting value.` }));
    notify("Professional summary generated");
  };
  const enhanceBullet = (section, itemIndex, bulletIndex) => {
    const current = resume[section][itemIndex].bullets[bulletIndex];
    if (!current.trim()) return notify("Add a bullet point first");
    const enhanced = current.replace(/^\s*(Built|Created|Worked on|Helped|Responsible for|Improved|Led)?\s*/i, "").replace(/[.!?]*$/, "");
    updateBullet(section, itemIndex, bulletIndex, `Delivered ${enhanced.charAt(0).toLowerCase()}${enhanced.slice(1)}, driving measurable impact through focused execution and cross-functional collaboration.`);
    notify("Bullet enhanced using the STAR framework");
  };
  const runAudit = () => {
    const words = (jobDescription.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || []).filter((word) => !["the", "and", "with", "for", "our", "you", "your", "are", "will", "this", "that", "from", "have", "has", "work", "team", "role", "job", "who", "all", "about", "their", "into", "what", "can"].includes(word));
    const content = [resume.summary, resume.personal.title, ...resume.skills, ...resume.experience.flatMap((x) => [x.role, x.company, ...x.bullets]), ...resume.education.map((x) => `${x.degree} ${x.school}`)].join(" ").toLowerCase();
    const unique = [...new Set(words)];
    const matched = unique.filter((word) => content.includes(word));
    const missing = unique.filter((word) => !content.includes(word)).slice(0, 12);
    const score = Math.min(98, Math.round(35 + (unique.length ? matched.length / unique.length * 52 : 15) + Math.min(resume.experience.length * 3, 9)));
    setAudit({ score, matched: matched.slice(0, 8), missing, recommendations: [resume.summary.length < 100 ? "Expand your summary with role-specific outcomes." : "Your summary has useful detail; tailor its opening to the target role.", resume.experience.some((x) => !x.bullets.length || x.bullets.every((b) => !/\d/.test(b))) ? "Add measurable results to more experience bullets." : "Keep outcomes and metrics prominent in experience bullets.", missing.length ? `Consider adding relevant terms naturally: ${missing.slice(0, 3).join(", ")}.` : "Use consistent section headings and keep formatting easy to parse."] });
    notify("ATS review complete");
  };
  const handlePrint = () => {
    window.print();
    notify("Print dialog opened");
  };
  const downloadPdf = async () => {
    const element = resumePaperRef.current;
    if (!element || isExportingPdf) return;

    setIsExportingPdf(true);
    const originalTransform = element.style.transform;
    const originalMarginBottom = element.style.marginBottom;
    element.style.transform = "none";
    element.style.marginBottom = "0";

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollY: 0,
      });
      const filename = `${(resume.personal.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-resume.pdf`;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = canvas.height * pageWidth / canvas.width;
      const image = canvas.toDataURL("image/jpeg", 0.98);
      let remainingHeight = imageHeight;
      let imageTop = 0;

      pdf.addImage(image, "JPEG", 0, imageTop, pageWidth, imageHeight);
      remainingHeight -= pageHeight;
      while (remainingHeight > 0) {
        imageTop -= pageHeight;
        pdf.addPage();
        pdf.addImage(image, "JPEG", 0, imageTop, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }
      const pdfUrl = URL.createObjectURL(pdf.output("blob"));
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      notify("PDF downloaded");
    } catch (error) {
      console.error("PDF export failed", error);
      notify("PDF export failed. Please try again.");
    } finally {
      element.style.transform = originalTransform;
      element.style.marginBottom = originalMarginBottom;
      setIsExportingPdf(false);
    }
  };

  const tabs = [
    { label: "Editor", icon: FileText },
    { label: "Design", icon: Grip },
    { label: "AI Optimize", icon: Sparkles },
    { label: "ATS Score", icon: Award },
  ];
  const contactKeys = ["email", "phone", "location", "linkedin"];
  const sections = ["Personal Details", "Summary", "Experience", "Skills", "Education", "Projects"];
  const fontClass = font === "Serif" ? "font-serif" : font === "Mono" ? "font-mono" : "font-sans";
  const updateList = (value) => setResume((r) => ({ ...r, skills: value.split(",").map((x) => x.trim()).filter(Boolean) }));

  return <div className={`min-h-screen bg-[#f2f5f4] text-slate-900 ${fontClass}`}>
    <style>{`@media print { @page { size: A4; margin: 0; } body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .app-shell { display: block !important; } .no-print { display: none !important; } .resume-stage { display: block !important; overflow: visible !important; padding: 0 !important; background: white !important; } .resume-paper { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; margin: 0 !important; box-shadow: none !important; border: 0 !important; transform: none !important; } }`}</style>
    <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white"><FileText size={19} /></div><div className="hidden sm:block"><p className="text-[14px] font-bold tracking-tight">folio<span className="text-teal-700">/</span>AI</p><p className="text-[10px] text-slate-500">Resume Studio</p></div><div className="mx-2 hidden h-8 border-l border-slate-200 lg:block" />
        <label className="hidden items-center gap-2 text-[11px] text-slate-500 md:flex"><Globe2 size={14} /><select value={region} onChange={(e) => setRegion(e.target.value)} className="cursor-pointer bg-transparent font-semibold text-slate-700 outline-none"><option value="US">United States</option><option value="IN">India</option><option value="EU">European Union</option></select></label>
      </div>
      <div className="flex items-center gap-2"><div className="relative hidden sm:block"><button onClick={() => setExampleMenu((v) => !v)} className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"><ChevronDown size={14} /> Load example</button>{exampleMenu && <div className="absolute right-0 top-10 z-40 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">{Object.keys(sampleProfiles).map((name) => <button key={name} onClick={() => loadExample(name)} className="w-full rounded-md px-3 py-2 text-left text-xs hover:bg-slate-50">{name}</button>)}</div>}</div><input ref={importRef} type="file" accept="application/json,.json" onChange={importJson} className="hidden" /><button title="Import JSON" onClick={() => importRef.current?.click()} className="hidden rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 sm:inline-flex"><ArrowUpFromLine size={15} /></button><button title="Export JSON" onClick={exportJson} className="hidden rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 sm:inline-flex"><ArrowDownToLine size={15} /></button><button onClick={downloadPdf} disabled={isExportingPdf} className="flex items-center gap-2 rounded-md bg-teal-800 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-teal-900 disabled:cursor-wait disabled:opacity-70"><Download size={14} /><span className="hidden sm:inline">{isExportingPdf ? "Creating PDF..." : "Download PDF"}</span><span className="sm:hidden">{isExportingPdf ? "..." : "PDF"}</span></button></div>
    </div></header>
    {resume.personal.photo && <button onClick={() => setIsPhotoCropOpen(true)} className="no-print fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-700 shadow-lg transition hover:border-teal-700 hover:text-teal-800"><Crop size={15} />Crop photo</button>}
    {isPhotoCropOpen && <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setIsPhotoCropOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="photo-crop-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><h2 id="photo-crop-title" className="text-[15px] font-bold">Crop profile photo</h2><p className="mt-1 text-[10px] text-slate-500">Adjust the crop used throughout your resume.</p></div><button onClick={() => setIsPhotoCropOpen(false)} aria-label="Close photo crop" className="rounded p-2 text-slate-500 hover:bg-slate-100"><ChevronDown size={16} /></button></div><div className="mx-auto mb-5 h-48 w-48 overflow-hidden rounded-lg bg-slate-100"><img src={resume.personal.photoOriginal || resume.personal.photo} alt="Photo crop preview" className="h-full w-full object-cover" style={{ objectPosition: `${resume.personal.photoCrop.x}% ${resume.personal.photoCrop.y}%`, transform: `scale(${resume.personal.photoCrop.zoom})` }} /></div><div className="space-y-4">{[{ key: "zoom", label: "Zoom", min: 1, max: 3, step: 0.05, value: resume.personal.photoCrop.zoom, suffix: `${resume.personal.photoCrop.zoom.toFixed(1)}x` }, { key: "x", label: "Horizontal position", min: 0, max: 100, step: 1, value: resume.personal.photoCrop.x, suffix: `${resume.personal.photoCrop.x}%` }, { key: "y", label: "Vertical position", min: 0, max: 100, step: 1, value: resume.personal.photoCrop.y, suffix: `${resume.personal.photoCrop.y}%` }].map((control) => <label key={control.key} className="block"><span className="mb-1 flex justify-between text-[11px] font-medium text-slate-700"><span>{control.label}</span><span className="text-slate-500">{control.suffix}</span></span><input aria-label={control.label} type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={(event) => updatePhotoCrop(control.key, event.target.value)} className="w-full accent-teal-700" /></label>)}</div><div className="mt-5 flex justify-between"><button onClick={() => { updatePhotoCrop("zoom", 1); updatePhotoCrop("x", 50); updatePhotoCrop("y", 50); }} className="rounded-md px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100">Reset crop</button><button onClick={() => setIsPhotoCropOpen(false)} className="rounded-md bg-teal-800 px-4 py-2 text-[11px] font-semibold text-white hover:bg-teal-900">Done</button></div></section></div>}
    <main className="app-shell mx-auto grid min-h-[calc(100vh-68px)] max-w-[1600px] grid-cols-1 lg:grid-cols-[minmax(400px,0.88fr)_minmax(540px,1.12fr)]">
      <section className="no-print min-h-[calc(100vh-68px)] border-r border-slate-200 bg-white">
        <div className="flex h-[60px] items-center justify-between border-b border-slate-100 px-5"><div><h1 className="text-[14px] font-bold">Resume builder</h1><p className="text-[10px] text-slate-500">Make every detail count.</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Autosaved</span></div>
        <nav className="flex border-b border-slate-200 px-4">{tabs.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActiveTab(label)} className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-3 text-[10px] font-semibold transition sm:text-[11px] ${activeTab === label ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}><Icon size={14} />{label}</button>)}</nav>
        <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-4 sm:p-5">
          {activeTab === "Editor" && <div className="space-y-2">{sections.map((section) => <div key={section} className="overflow-hidden rounded-lg border border-slate-200"><button onClick={() => setOpenSection((s) => s === section ? "" : section)} className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition hover:bg-slate-50"><span className="flex items-center gap-2 text-[12px] font-semibold"><span className="text-teal-700">{section === "Personal Details" ? <UserRound size={15} /> : section === "Experience" ? <BriefcaseBusiness size={15} /> : section === "Education" ? <GraduationCap size={15} /> : section === "Skills" ? <Award size={15} /> : section === "Summary" ? <ClipboardCheck size={15} /> : <Lightbulb size={15} />}</span>{section}</span>{openSection === section ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}</button>
            {openSection === section && <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4">
              {section === "Personal Details" && <><div className="flex items-center gap-3"><button onClick={() => photoRef.current?.click()} className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-teal-600">{resume.personal.photo ? <img src={resume.personal.photo} alt="Profile" className="h-full w-full object-cover" /> : <Plus size={19} />}</button><input ref={photoRef} type="file" accept="image/*" onChange={photoUpload} className="hidden" /><div><p className="text-[11px] font-semibold">Profile photo</p><p className="text-[10px] text-slate-500">Click the circle to upload</p></div></div><div className="grid grid-cols-2 gap-3"><Field label="Full name" value={resume.personal.name} onChange={(v) => updatePersonal("name", v)} placeholder="Your name" /><Field label="Professional title" value={resume.personal.title} onChange={(v) => updatePersonal("title", v)} placeholder="e.g. Product Designer" />{contactKeys.map((key) => <Field key={key} label={key === "linkedin" ? "LinkedIn" : key[0].toUpperCase() + key.slice(1)} value={resume.personal[key]} onChange={(v) => updatePersonal(key, v)} placeholder={key === "phone" ? "+1 555 000 0000" : key === "email" ? "name@email.com" : key === "location" ? "City, Country" : key === "website" ? "yourwebsite.com" : "linkedin.com/in/you"} type={key === "phone" ? "tel" : "text"} />)}<Field label="Date of birth" value={resume.personal.dob} onChange={(v) => updatePersonal("dob", v)} type="date" /><Field label="Nationality" value={resume.personal.nationality} onChange={(v) => updatePersonal("nationality", v)} placeholder="Nationality" /><Field label="Marital status" value={resume.personal.maritalStatus} onChange={(v) => updatePersonal("maritalStatus", v)} placeholder="Optional" /></div></>}
              {section === "Summary" && <><label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-600">Professional summary</span><textarea rows={5} value={resume.summary} onChange={(e) => setResume((r) => ({ ...r, summary: e.target.value }))} placeholder="A short, compelling introduction..." className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] leading-relaxed outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" /></label><button onClick={generateSummary} className="flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-[11px] font-semibold text-teal-800 transition hover:bg-teal-100"><WandSparkles size={14} />Generate with AI</button></>}
              {section === "Experience" && <>{resume.experience.map((job, index) => <div key={index} className="space-y-3 rounded-md border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600">Experience {index + 1}</span><button onClick={() => removeItem("experience", index)} title="Delete experience" className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button></div><div className="grid grid-cols-2 gap-2"><Field label="Job title" value={job.role} onChange={(v) => updateItem("experience", index, "role", v)} placeholder="Job title" /><Field label="Company" value={job.company} onChange={(v) => updateItem("experience", index, "company", v)} placeholder="Company" /><Field label="Location" value={job.location} onChange={(v) => updateItem("experience", index, "location", v)} placeholder="City" /><Field label="Start date" value={job.start} onChange={(v) => updateItem("experience", index, "start", v)} placeholder="YYYY-MM" /><Field label="End date" value={job.end} onChange={(v) => updateItem("experience", index, "end", v)} placeholder="Present" /></div><div><p className="mb-2 text-[10px] font-semibold text-slate-600">Impact bullets</p><div className="space-y-2">{job.bullets.map((bullet, j) => <div key={j} className="flex items-start gap-1.5"><textarea rows={2} value={bullet} onChange={(e) => updateBullet("experience", index, j, e.target.value)} placeholder="Describe a result or achievement..." className="min-w-0 flex-1 resize-y rounded border border-slate-200 px-2.5 py-2 text-[11px] outline-none focus:border-teal-600" /><button onClick={() => enhanceBullet("experience", index, j)} title="Enhance bullet" className="mt-1 rounded p-1.5 text-teal-700 hover:bg-teal-50"><WandSparkles size={14} /></button><button onClick={() => updateItem("experience", index, "bullets", job.bullets.filter((_, n) => n !== j))} title="Delete bullet" className="mt-1 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Minus size={14} /></button></div>)}</div><button onClick={() => updateItem("experience", index, "bullets", [...job.bullets, ""])} className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-teal-800 hover:text-teal-950"><CirclePlus size={13} />Add bullet</button></div></div>)}<button onClick={() => addItem("experience", { role: "", company: "", location: "", start: "", end: "Present", bullets: [""] })} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-teal-600 hover:text-teal-800"><Plus size={14} />Add experience</button></>}
              {section === "Skills" && <><label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-600">Skills, separated by commas</span><textarea rows={4} value={resume.skills.join(", ")} onChange={(e) => updateList(e.target.value)} placeholder="e.g. Research, Strategy, SQL" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:border-teal-600" /></label><p className="text-[10px] text-slate-500">{resume.skills.length} skills listed</p></>}
              {section === "Education" && <>{resume.education.map((school, index) => <div key={index} className="space-y-2 rounded-md border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600">Education {index + 1}</span><button onClick={() => removeItem("education", index)} title="Delete education" className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button></div><div className="grid grid-cols-2 gap-2"><Field label="Degree" value={school.degree} onChange={(v) => updateItem("education", index, "degree", v)} placeholder="Degree or qualification" /><Field label="School" value={school.school} onChange={(v) => updateItem("education", index, "school", v)} placeholder="Institution" /><Field label="Location" value={school.location} onChange={(v) => updateItem("education", index, "location", v)} placeholder="City" /><Field label="Start year" value={school.start} onChange={(v) => updateItem("education", index, "start", v)} placeholder="2018" /><Field label="End year" value={school.end} onChange={(v) => updateItem("education", index, "end", v)} placeholder="2022" /><Field label="Details" value={school.details} onChange={(v) => updateItem("education", index, "details", v)} placeholder="Honors, coursework" /></div></div>)}<button onClick={() => addItem("education", { degree: "", school: "", location: "", start: "", end: "", details: "" })} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 py-2.5 text-[11px] font-semibold text-slate-600 hover:border-teal-600 hover:text-teal-800"><Plus size={14} />Add education</button></>}
              {section === "Projects" && <>{resume.projects.map((project, index) => <div key={index} className="space-y-2 rounded-md border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-600">Project {index + 1}</span><button onClick={() => removeItem("projects", index)} title="Delete project" className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button></div><div className="grid grid-cols-2 gap-2"><Field label="Project name" value={project.name} onChange={(v) => updateItem("projects", index, "name", v)} placeholder="Project name" /><Field label="Link" value={project.link} onChange={(v) => updateItem("projects", index, "link", v)} placeholder="project.com" /></div><div className="space-y-2">{project.bullets.map((bullet, j) => <div key={j} className="flex gap-1"><textarea rows={2} value={bullet} onChange={(e) => updateBullet("projects", index, j, e.target.value)} placeholder="What did you build or achieve?" className="min-w-0 flex-1 rounded border border-slate-200 px-2.5 py-2 text-[11px] outline-none focus:border-teal-600" /><button onClick={() => updateItem("projects", index, "bullets", project.bullets.filter((_, n) => n !== j))} title="Delete bullet" className="p-1.5 text-slate-400 hover:text-rose-600"><Minus size={14} /></button></div>)}</div><button onClick={() => updateItem("projects", index, "bullets", [...project.bullets, ""])} className="text-[10px] font-semibold text-teal-800">+ Add bullet</button></div>)}<button onClick={() => addItem("projects", { name: "", link: "", bullets: [""] })} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 py-2.5 text-[11px] font-semibold text-slate-600 hover:border-teal-600 hover:text-teal-800"><Plus size={14} />Add project</button><label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-600">Declaration (India format)</span><textarea rows={2} value={resume.declaration} onChange={(e) => setResume((r) => ({ ...r, declaration: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-[11px] outline-none focus:border-teal-600" /></label></>}
            </div>}</div>)}</div>}
          {activeTab === "Design" && <div className="space-y-6"><div><h2 className="text-[12px] font-bold">Choose a template</h2><p className="mt-1 text-[10px] text-slate-500">Pick a layout that fits your next move.</p><div className="mt-3 grid grid-cols-2 gap-2">{templates.map((name, i) => <button key={name} onClick={() => setTemplate(name)} className={`rounded-lg border p-3 text-left transition ${template === name ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700/10" : "border-slate-200 bg-white hover:border-slate-300"}`}><div className="mb-2 flex h-16 items-center justify-center rounded bg-slate-100"><div className={`h-11 w-8 border border-slate-300 bg-white shadow-sm ${i === 2 ? "flex" : "p-1"}`}><div className={`h-1 w-full ${i === 2 ? "bg-teal-700" : "bg-slate-300"}`} /><div className="mt-1 h-0.5 w-3/4 bg-slate-200" /><div className="mt-1 h-0.5 w-full bg-slate-200" /><div className="mt-1 h-0.5 w-2/3 bg-slate-200" /></div></div><span className="text-[10px] font-semibold">{name}</span></button>)}</div></div><div><h2 className="text-[12px] font-bold">Accent color</h2><p className="mt-1 text-[10px] text-slate-500">Use a color with enough contrast for print.</p><div className="mt-3 flex items-center gap-2"><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><input value={accent} onChange={(e) => setAccent(e.target.value)} className="w-28 rounded-md border border-slate-200 px-3 py-2 font-mono text-[11px] uppercase" /><div className="flex gap-1.5">{["#0f766e", "#2563eb", "#b45309", "#334155", "#9f1239"].map((color) => <button key={color} title={color} onClick={() => setAccent(color)} className="h-6 w-6 rounded-full ring-offset-2 transition hover:ring-2 hover:ring-slate-300" style={{ backgroundColor: color }} />)}</div></div></div><div><h2 className="text-[12px] font-bold">Typography</h2><div className="mt-2 flex rounded-md border border-slate-200 bg-white p-1">{["Sans", "Serif", "Mono"].map((option) => <button key={option} onClick={() => setFont(option)} className={`flex-1 rounded px-3 py-2 text-[11px] transition ${font === option ? "bg-slate-900 font-semibold text-white" : "text-slate-600 hover:bg-slate-50"}`}>{option}</button>)}</div></div></div>}
          {activeTab === "AI Optimize" && <div><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800"><Sparkles size={19} /></div><h2 className="text-[15px] font-bold">Tailor your resume</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Add a job description to spot relevant language and shape your summary. This demo runs locally and does not send your data anywhere.</p><label className="mt-5 block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Target job description</span><textarea rows={12} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the role description here..." className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-[12px] leading-relaxed outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" /></label><div className="mt-3 flex flex-wrap gap-2"><button onClick={runAudit} disabled={!jobDescription.trim()} className="flex items-center gap-2 rounded-md bg-teal-800 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-40"><WandSparkles size={14} />Find matching keywords</button><button onClick={generateSummary} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"><Sparkles size={14} />Draft summary</button></div>{audit && <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50/50 p-4"><p className="text-[11px] font-bold">Keyword snapshot</p><p className="mt-1 text-[10px] text-slate-600">{audit.matched.length} relevant terms found in your resume.</p><div className="mt-3 flex flex-wrap gap-1.5">{audit.matched.map((word) => <span key={word} className="rounded bg-white px-2 py-1 text-[9px] text-teal-800 ring-1 ring-teal-200">{word}</span>)}</div></div>}</div>}
          {activeTab === "ATS Score" && <div><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Award size={19} /></div><h2 className="text-[15px] font-bold">ATS readiness</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Run a local review against a job description to see keyword alignment and practical next steps.</p><button onClick={() => { if (!jobDescription.trim()) { setActiveTab("AI Optimize"); notify("Paste a job description to run the review"); } else runAudit(); }} className="mt-4 flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-700"><ClipboardCheck size={14} />Run ATS review</button>{audit ? <div className="mt-5 space-y-4"><div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"><div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border-[6px] border-teal-100 text-[22px] font-bold text-teal-800" style={{ borderTopColor: accent }}>{audit.score}</div><div><p className="text-[12px] font-bold">Good foundation</p><p className="mt-1 text-[10px] leading-relaxed text-slate-500">Keyword relevance is an estimate, not a guarantee of how a specific ATS will rank your application.</p></div></div><div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="text-[11px] font-bold">Strengths</h3><p className="mt-2 text-[10px] text-slate-600">Relevant terms present: {audit.matched.length ? audit.matched.join(", ") : "No exact matches yet"}</p></div><div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="text-[11px] font-bold">Possible keywords to add</h3><div className="mt-2 flex flex-wrap gap-1.5">{audit.missing.length ? audit.missing.map((word) => <span key={word} className="rounded bg-amber-50 px-2 py-1 text-[9px] text-amber-800">{word}</span>) : <span className="text-[10px] text-slate-500">No obvious gaps from the pasted description.</span>}</div></div><div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="text-[11px] font-bold">Recommendations</h3><ul className="mt-2 space-y-2">{audit.recommendations.map((text) => <li key={text} className="flex gap-2 text-[10px] leading-relaxed text-slate-600"><Check size={13} className="mt-0.5 shrink-0 text-teal-700" />{text}</li>)}</ul></div></div> : <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-7 text-center"><Award size={23} className="mx-auto text-slate-300" /><p className="mt-2 text-[11px] font-semibold text-slate-600">Your report will appear here</p><p className="mt-1 text-[10px] text-slate-400">Paste a job description in AI Optimize first.</p></div>}</div>}
        </div>
      </section>
      <section className="resume-stage flex min-h-[calc(100vh-68px)] flex-col overflow-hidden bg-[#edf1ef]"><div className="no-print flex h-[60px] shrink-0 items-center justify-between border-b border-slate-200/80 px-5 sm:px-7"><div><p className="text-[11px] font-semibold text-slate-700">Live preview</p><p className="text-[9px] text-slate-500">A4 · {template}</p></div><div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1"><button title="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.08).toFixed(2)))} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><ZoomOut size={14} /></button><span className="w-10 text-center text-[10px] text-slate-600">{Math.round(zoom * 100)}%</span><button title="Zoom in" onClick={() => setZoom((z) => Math.min(1.1, +(z + 0.08).toFixed(2)))} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><ZoomIn size={14} /></button><span className="mx-1 h-4 border-l border-slate-200" /><button title="Print resume" onClick={handlePrint} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Printer size={14} /></button></div></div><div className="resume-stage flex flex-1 items-start justify-center overflow-auto px-4 py-8 sm:px-8"><div ref={resumePaperRef} className="resume-paper origin-top shadow-[0_8px_35px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition-transform duration-200" style={{ width: "210mm", minHeight: "297mm", transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 297}mm` }}><ResumeView resumeData={resume} accentColor={accent} /></div></div><div className="no-print flex h-9 shrink-0 items-center justify-between border-t border-slate-200/80 px-5 text-[9px] text-slate-500"><span>Changes update your preview instantly</span><span>{region} format · A4</span></div></section>
    </main>
    {toast && <div role="status" className="no-print fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[11px] font-medium text-white shadow-xl"><Check size={14} className="text-emerald-400" />{toast}</div>}
  </div>;
}

export default App;
