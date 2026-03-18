import { motion } from "framer-motion";
import { ArrowRight, Ticket, Trophy, TrendingUp, Calendar, Flame, Target, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const features = [
  {
    icon: Calendar,
    title: "Eventos activos",
    description: "Accede a eventos en tu ciudad listos para vender.",
  },
  {
    icon: Ticket,
    title: "Comisiones por ticket",
    description: "Gana por cada boleta vendida con tu link personal.",
  },
  {
    icon: TrendingUp,
    title: "Rankings en tiempo real",
    description: "Compite con otros promotores y sube de posición.",
  },
  {
    icon: Clock,
    title: "Cierres y pagos",
    description: "Pagos automáticos después de cada evento.",
  },
];

export const CrewsSection = () => {
  return (
    <section id="crews" className="py-24 px-4 sm:px-6 lg:px-8 crews-bg relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, hsl(280 100% 65%), transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, hsl(320 100% 60%), transparent)" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full badge-crews mb-4">
            <Ticket className="w-3.5 h-3.5 inline mr-1.5" />
            Mensualista Crews
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Vende boletas por comisión con{" "}
            <span className="text-primary">estructura, metas y ranking</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Únete a crews de promotores, vende tickets de eventos y gana por cada boleta con gamificación real.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-crews p-6 text-center group hover:glow-neon-strong transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl crews-gradient flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {/* Ranking Preview */}
          <div className="card-crews p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-crews-glow" />
                Ranking del evento
              </h4>
              <span className="text-xs text-gray-500">En vivo</span>
            </div>
            <div className="space-y-4">
              {[
                { rank: 1, name: "María G.", sales: 87, badge: "🔥" },
                { rank: 2, name: "Carlos R.", sales: 72, badge: null },
                { rank: 3, name: "Tú", sales: 65, badge: "⬆️", isYou: true },
                { rank: 4, name: "Andrea M.", sales: 58, badge: null },
              ].map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    item.isYou ? "bg-crews-purple/20 border border-crews-purple/30" : "bg-white/5"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.rank === 1
                        ? "crews-gradient text-white"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className={`flex-1 font-medium ${item.isYou ? "text-crews-glow" : "text-white"}`}>
                    {item.name}
                  </span>
                  <span className="text-gray-400 text-sm">{item.sales} tickets</span>
                  {item.badge && <span>{item.badge}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Progress to Goal Preview */}
          <div className="card-crews p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-crews-glow" />
                Tu progreso
              </h4>
              <span className="badge-crews text-xs flex items-center gap-1">
                <Flame className="w-3 h-3" />
                En fuego
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Meta mensual</span>
                  <span className="text-white font-medium">65 / 100 tickets</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full crews-gradient transition-all duration-500"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-xs mb-1">Comisión acumulada</p>
                  <p className="text-2xl font-bold text-white">$487.500</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-xs mb-1">Bono por meta</p>
                  <p className="text-2xl font-bold text-crews-glow">+$150.000</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-crews-purple/10 border border-crews-purple/20">
                <Zap className="w-5 h-5 text-crews-glow" />
                <span className="text-sm text-gray-300">
                  ¡35 tickets más para desbloquear el bono!
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/crews">
            <Button
              size="lg"
              className="crews-gradient text-white hover:opacity-90 px-10 group glow-neon"
            >
              Entrar a Crews
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CrewsSection;
