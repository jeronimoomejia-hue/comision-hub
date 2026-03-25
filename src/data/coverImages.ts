// Shared cover image maps for all categories

// Service covers
import techAiServiceImg from "@/assets/service-covers/tech-ai.jpg";
import gymServiceImg from "@/assets/service-covers/gym.jpg";
import yogaServiceImg from "@/assets/service-covers/yoga.jpg";
import wellnessServiceImg from "@/assets/service-covers/wellness.jpg";
import salonServiceImg from "@/assets/service-covers/salon.jpg";
import beachServiceImg from "@/assets/service-covers/beach-court.jpg";

// Company covers
import techAiCover from "@/assets/company-covers/tech-ai.jpg";
import gymCover from "@/assets/company-covers/gym.jpg";
import yogaCover from "@/assets/company-covers/yoga.jpg";
import wellnessCover from "@/assets/company-covers/wellness.jpg";
import salonCover from "@/assets/company-covers/salon.jpg";
import beachCover from "@/assets/company-covers/beach-court.jpg";

export const categoryCovers: Record<string, string> = {
  'IA para Seguros': techAiServiceImg,
  'IA para Ventas': techAiServiceImg,
  'IA para Atención': techAiServiceImg,
  'Gimnasio': gymServiceImg,
  'Yoga & Bienestar': yogaServiceImg,
  'Spa & Wellness': wellnessServiceImg,
  'Peluquería & Estética': salonServiceImg,
  'Cancha de Playa': beachServiceImg,
};

export const industryCover: Record<string, string> = {
  'IA para Seguros': techAiCover,
  'IA para Ventas': techAiCover,
  'IA para Atención': techAiCover,
  'Gimnasio': gymCover,
  'Yoga & Bienestar': yogaCover,
  'Spa & Wellness': wellnessCover,
  'Peluquería & Estética': salonCover,
  'Cancha de Playa': beachCover,
};
