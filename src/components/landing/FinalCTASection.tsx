import { motion } from "framer-motion";
import { ArrowRight, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FinalCTASection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F4F0FA] relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Monta tu <span className="text-primary">red de vendedores</span> hoy
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Empieza gratis. Personaliza tu plataforma. Invita a tus vendedores. Sin compromiso.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/auth?mode=register&role=company">
              <Button size="lg" className="px-8 group w-full sm:w-auto">
                <Building2 className="mr-2 w-4 h-4" />
                Registrar mi empresa gratis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <a
            href="#planes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
          >
            <Zap className="w-4 h-4" />
            Comparar planes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
