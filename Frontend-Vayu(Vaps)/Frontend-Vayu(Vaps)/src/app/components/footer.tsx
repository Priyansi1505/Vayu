import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative py-12 px-6 backdrop-blur-[15px] bg-white/10 border-t border-white/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A5C7E9] to-[#F4D7DA] flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-2xl font-semibold text-[#333333] dark:text-white">VAYU</span>
            </div>
            <p className="text-sm text-[#333333]/70 dark:text-white/70 mb-4">
              {t("footerDesc")}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                <Facebook className="w-4 h-4 text-[#333333] dark:text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                <Twitter className="w-4 h-4 text-[#333333] dark:text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                <Instagram className="w-4 h-4 text-[#333333] dark:text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                <Linkedin className="w-4 h-4 text-[#333333] dark:text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all">
                <Github className="w-4 h-4 text-[#333333] dark:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#333333] dark:text-white">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-[#333333]/70 dark:text-white/70">
              <li><a href="#aqi-graph" className="hover:text-[#A5C7E9] transition-colors">{t("aqiTrends")}</a></li>
              <li><a href="#health-tips" className="hover:text-[#A5C7E9] transition-colors">{t("healthTips")}</a></li>
              <li><a href="#news" className="hover:text-[#A5C7E9] transition-colors">{t("latestNews")}</a></li>
              <li><a href="#faqs" className="hover:text-[#A5C7E9] transition-colors">{t("faqs")}</a></li>
              <li><a href="#aqi-map" className="hover:text-[#A5C7E9] transition-colors">AQI Map</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-[#333333] dark:text-white">{t("resources")}</h3>
            <ul className="space-y-2 text-sm text-[#333333]/70 dark:text-white/70">
              <li><a href="#" className="hover:text-[#A5C7E9] transition-colors">{t("apiDocs")}</a></li>
              <li><a href="#" className="hover:text-[#A5C7E9] transition-colors">{t("dataPolicy")}</a></li>
              <li><a href="#" className="hover:text-[#A5C7E9] transition-colors">{t("healthGuide")}</a></li>
              <li><a href="#" className="hover:text-[#A5C7E9] transition-colors">{t("privacyPolicy")}</a></li>
              <li><a href="#" className="hover:text-[#A5C7E9] transition-colors">{t("blog")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-[#333333] dark:text-white">{t("contactUs")}</h3>
            <ul className="space-y-3 text-sm text-[#333333]/70 dark:text-white/70 mb-6">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@vayu.com" className="hover:text-[#A5C7E9] transition-colors">info@vayu.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 (123) 456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Indore, India</span>
              </li>
            </ul>
            <h4 className="font-semibold mb-2 text-sm text-[#333333] dark:text-white">Data Sources</h4>
            <ul className="space-y-1 text-xs text-[#333333]/60 dark:text-white/60">
              <li>• CPCB India</li>
              <li>• OpenAQ</li>
              <li>• EPA (US)</li>
              <li>• World Air Quality Index</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-[#333333]/60 dark:text-white/60">
            © 2026 VAYU. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}