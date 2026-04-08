// src/data/resources.js
// Centralized immigration resources

import { PROCESSING_TIMES_META } from "./processingTimes";

export const RESOURCES_META = {
    get lastUpdated() {
      return PROCESSING_TIMES_META.lastUpdated;
    },
    disclaimer:
      "Listings are for informational purposes only and do not constitute legal advice.",
  };
  
  export const RESOURCE_CATEGORIES = [
    { id: "all", name: "All Resources", icon: "📋" },
    { id: "government", name: "Government", icon: "🏛️" },
    { id: "legal", name: "Legal Help", icon: "⚖️" },
    { id: "nonprofit", name: "Nonprofits", icon: "🤝" },
    { id: "education", name: "Education", icon: "🎓" },
  ];
  
  export const RESOURCES = [
    {
      id: "uscis",
      name: "U.S. Citizenship and Immigration Services (USCIS)",
      category: "government",
      official: true,
      description: "Official U.S. immigration agency",
      phone: "1-800-375-5283",
      website: "https://www.uscis.gov",
      services: ["Forms", "Case status", "Appointments"],
    },
    {
      id: "dos_visa",
      name: "Department of State — Visa Services",
      category: "government",
      official: true,
      description: "Visa Bulletin, embassy appointments, consular processing",
      website: "https://travel.state.gov",
      services: ["Visa Bulletin", "Embassy info", "DS-160"],
    },
    {
      id: "doj_eoir",
      name: "EOIR Immigration Court",
      category: "government",
      official: true,
      website: "https://www.justice.gov/eoir",
      services: ["Court information", "Hearing notices"],
    },
    {
      id: "dol_flag",
      name: "Department of Labor — FLAG System",
      category: "government",
      official: true,
      description: "Labor certification, prevailing wages, LCA filings",
      website: "https://flag.dol.gov",
      services: ["PERM", "LCA", "Prevailing wages"],
    },
    {
      id: "imm_advocates",
      name: "Immigration Advocates Network",
      category: "legal",
      description: "Free and low-cost immigration legal help directory",
      website: "https://www.immigrationadvocates.org/legaldirectory/",
      services: ["Pro bono legal services", "Know your rights"],
    },
    {
      id: "lawhelp",
      name: "LawHelp.org",
      category: "legal",
      description: "Find free legal aid in your state",
      website: "https://www.lawhelp.org",
      services: ["Legal aid directory", "State-by-state resources"],
    },
    {
      id: "aila",
      name: "AILA Lawyer Referral",
      category: "legal",
      description: "American Immigration Lawyers Association — find an attorney",
      website: "https://www.aila.org/find-an-attorney",
      services: ["Attorney referrals", "Immigration law updates"],
    },
    {
      id: "catholic_charities",
      name: "Catholic Charities",
      category: "nonprofit",
      description: "Immigration legal services and refugee assistance",
      website: "https://www.catholiccharitiesusa.org",
      services: ["Legal aid", "Refugee services"],
    },
    {
      id: "raices",
      name: "RAICES",
      category: "nonprofit",
      description:
        "Refugee and Immigrant Center for Education and Legal Services",
      website: "https://www.raicestexas.org",
      services: ["Legal representation", "Bond assistance"],
    },
    {
      id: "clinic",
      name: "CLINIC — Catholic Legal Immigration Network",
      category: "nonprofit",
      description: "Network of nonprofit immigration legal services programs",
      website: "https://cliniclegal.org",
      services: ["Legal services network", "Training", "Advocacy"],
    },
    {
      id: "usa_hello",
      name: "USAHello",
      category: "education",
      description: "Free classes and resources for immigrants",
      website: "https://usahello.org",
      services: ["English classes", "Citizenship prep", "GED prep"],
    },
    {
      id: "uscis_civics",
      name: "USCIS Citizenship Resource Center",
      category: "education",
      official: true,
      description: "Official citizenship test study materials",
      website: "https://www.uscis.gov/citizenship/find-study-materials-and-resources",
      services: ["Civics test prep", "Study materials", "Practice tests"],
    },
  ];
  
  export const EMERGENCY_RESOURCES = [
    {
      name: "Human Trafficking Hotline",
      phone: "1-888-373-7888",
    },
    {
      name: "Domestic Violence Hotline",
      phone: "1-800-799-7233",
    },
    {
      name: "USCIS Contact Center",
      phone: "1-800-375-5283",
    },
  ];