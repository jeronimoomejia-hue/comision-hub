// Shared cover image maps for all categories

// Service covers
import insuranceImg from "@/assets/service-covers/insurance-ai.jpg";
import legalImg from "@/assets/service-covers/legal-ai.jpg";
import marketingImg from "@/assets/service-covers/marketing-ai.jpg";
import salesImg from "@/assets/service-covers/sales-ai.jpg";
import supportImg from "@/assets/service-covers/support-ai.jpg";
import accountingImg from "@/assets/service-covers/accounting-ai.jpg";
import hrImg from "@/assets/service-covers/hr-ai.jpg";
import securityImg from "@/assets/service-covers/security-ai.jpg";
import gymImg from "@/assets/service-covers/gym.jpg";
import yogaImg from "@/assets/service-covers/yoga.jpg";
import wellnessImg from "@/assets/service-covers/wellness.jpg";
import salonImg from "@/assets/service-covers/salon.jpg";

// Company covers
import insuranceCover from "@/assets/company-covers/insurance-ai.jpg";
import legalCover from "@/assets/company-covers/legal-ai.jpg";
import marketingCover from "@/assets/company-covers/marketing-ai.jpg";
import salesCover from "@/assets/company-covers/sales-ai.jpg";
import supportCover from "@/assets/company-covers/support-ai.jpg";
import accountingCover from "@/assets/company-covers/accounting-ai.jpg";
import hrCover from "@/assets/company-covers/hr-ai.jpg";
import securityCover from "@/assets/company-covers/security-ai.jpg";
import gymCover from "@/assets/company-covers/gym.jpg";
import yogaCover from "@/assets/company-covers/yoga.jpg";
import wellnessCover from "@/assets/company-covers/wellness.jpg";
import salonCover from "@/assets/company-covers/salon.jpg";

export const categoryCovers: Record<string, string> = {
  'IA para Seguros': insuranceImg,
  'IA Legal': legalImg,
  'IA para Marketing': marketingImg,
  'IA para Ventas': salesImg,
  'IA para Atención': supportImg,
  'IA para Contabilidad': accountingImg,
  'IA para RRHH': hrImg,
  'IA para Ciberseguridad': securityImg,
  'Gimnasio': gymImg,
  'Yoga & Bienestar': yogaImg,
  'Spa & Wellness': wellnessImg,
  'Peluquería & Estética': salonImg,
};

export const industryCover: Record<string, string> = {
  'IA para Seguros': insuranceCover,
  'IA Legal': legalCover,
  'IA para Marketing': marketingCover,
  'IA para Ventas': salesCover,
  'IA para Atención': supportCover,
  'IA para Contabilidad': accountingCover,
  'IA para RRHH': hrCover,
  'IA para Ciberseguridad': securityCover,
  'Gimnasio': gymCover,
  'Yoga & Bienestar': yogaCover,
  'Spa & Wellness': wellnessCover,
  'Peluquería & Estética': salonCover,
};
