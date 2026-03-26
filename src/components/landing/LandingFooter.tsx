import { Link } from "react-router-dom";
import logoMensualista from "@/assets/logo.png";
import { Instagram, Twitter, Linkedin, Youtube, Mail, MessageCircle } from "lucide-react";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    producto: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Planes y precios", href: "#planes" },
      { label: "FAQ", href: "#faq" },
    ],
    empresa: [
      { label: "Registrar empresa", href: "/auth?mode=register&role=company" },
      { label: "Iniciar sesión", href: "/auth" },
      { label: "Contacto B2B", href: "#" },
    ],
    legal: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Política de cookies", href: "#" },
    ],
    soporte: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Contacto", href: "#" },
      { label: "WhatsApp", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer style={{ background: "#0F0A1A" }} className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
             <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logoMensualista} alt="Mensualista" className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl text-white">Mensualista</span>
            </Link>
            <p className="text-[#524D63] text-sm mb-4">
              El software para que tu empresa tenga su propia red de vendedores independientes.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors text-[#524D63] hover:text-white" style={{ background: "rgba(255,255,255,0.06)" }} aria-label={social.label}>
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4 text-sm text-[#9B94AD] capitalize">{key}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-[#524D63] hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm text-[#524D63]">© {currentYear} Mensualista. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:hola@mensualista.com" className="flex items-center gap-2 text-sm text-[#524D63] hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              hola@mensualista.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
