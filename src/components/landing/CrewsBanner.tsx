import { motion } from "framer-motion";
import { ArrowRight, Ticket, Trophy, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CrewsBanner = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-2xl overflow-hidden" style={{ background: "#0F0A1A" }}>
            {/* Inner glow effects */}
            <div
              className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #5007FA, transparent)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-15"
              style={{ background: "radial-gradient(circle, #FF3399, transparent)" }}
            />

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              {/* Left content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(80,7,250,0.15)", color: "#5007FA" }}>
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Nuevo producto</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  ¿Vendes{" "}
                  <span className="text-primary">boletas de eventos?</span>
                </h3>
                <p className="text-[#9B94AD] text-sm mb-6 max-w-md">
                  Crews es nuestra plataforma de venta de boletas con rankings, metas y comisiones gamificadas. Ideal para promotores y productoras de eventos.
                </p>

                {/* Mini features */}
                <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
                  {[
                    { icon: Trophy, text: "Rankings" },
                    { icon: TrendingUp, text: "Metas" },
                    { icon: Zap, text: "Pagos auto" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <item.icon className="w-3.5 h-3.5" style={{ color: "#5007FA" }} />
                      <span className="text-xs text-[#9B94AD]">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Link to="/crews">
                  <Button className="group">
                    Conocer Crews
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Right - Mini ranking preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full md:w-64 shrink-0"
              >
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4" style={{ color: "#5007FA" }} />
                    <span className="text-xs font-medium text-white">Ranking evento</span>
                  </div>
                  {[
                    { rank: 1, name: "María G.", sales: 87 },
                    { rank: 2, name: "Carlos R.", sales: 72 },
                    { rank: 3, name: "Andrea M.", sales: 58 },
                  ].map((item) => (
                    <div key={item.rank} className="flex items-center gap-3 py-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.rank === 1 ? "text-white" : "text-[#9B94AD]"
                        }`}
                        style={item.rank === 1 ? { background: "#5007FA" } : { background: "rgba(255,255,255,0.1)" }}
                      >
                        {item.rank}
                      </span>
                      <span className="flex-1 text-sm text-[#9B94AD]">{item.name}</span>
                      <span className="text-xs text-[#524D63]">{item.sales}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CrewsBanner;