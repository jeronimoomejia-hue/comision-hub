import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
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
            Empieza a{" "}
            <span className="text-primary">ganar comisión</span>
            {" "}hoy
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Sin inversión, sin experiencia. Elige un servicio, capacítate y empieza a generar ingresos recurrentes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/auth?mode=register&role=vendor">
              <Button size="lg" className="px-8 group w-full sm:w-auto">
                <Briefcase className="mr-2 w-4 h-4" />
                Quiero vender servicios
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <Link
            to="/auth?mode=register&role=company"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
          >
            <Building2 className="w-4 h-4" />
            Soy empresa de servicios
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;