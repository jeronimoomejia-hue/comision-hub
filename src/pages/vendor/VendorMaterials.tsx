import DashboardLayout from "@/components/layout/DashboardLayout";
import { Download, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { services, vendors, CURRENT_VENDOR_ID } from "@/data/mockData";
import { EmptyState } from "@/components/dashboard/DashboardComponents";
import { toast } from "sonner";

export default function VendorMaterials() {
  const { trainingProgress } = useDemo();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const vendor = vendors.find(v => v.id === CURRENT_VENDOR_ID);

  // Get completed trainings for this vendor
  const completedTrainings = trainingProgress.filter(
    tp => tp.vendorId === CURRENT_VENDOR_ID && tp.status === 'declared_completed'
  );
  const completedServiceIds = completedTrainings.map(tp => tp.serviceId);
  
  // Get services with completed training that have materials
  const availableServices = services.filter(
    s => completedServiceIds.includes(s.id) && s.materials.length > 0
  );

  // Filter materials
  const filteredServices = availableServices.filter(service => {
    if (serviceFilter !== "all" && service.id !== serviceFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchLower) ||
        service.materials.some(m => m.title.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleDownload = (material: { title: string; url: string }) => {
    toast.success(`Descargando: ${material.title}`);
  };

  const totalMaterials = availableServices.reduce((acc, s) => acc + s.materials.length, 0);

  return (
    <DashboardLayout role="vendor" userName={vendor?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Materiales del gig</h1>
          <p className="text-muted-foreground">
            Descarga materiales de los gigs con capacitación completada
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold">{availableServices.length}</p>
            <p className="text-sm text-muted-foreground">Gigs disponibles</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold">{totalMaterials}</p>
            <p className="text-sm text-muted-foreground">Materiales totales</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-2xl font-bold">PDF</p>
            <p className="text-sm text-muted-foreground">Formato disponible</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materiales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por gig" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los gigs</SelectItem>
              {availableServices.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials by Service */}
        {filteredServices.length === 0 ? (
          <div className="card-premium">
            <EmptyState
              icon={FileText}
              title="No hay materiales disponibles"
              description={completedTrainings.length === 0 
                ? "Completa una capacitación para acceder a los materiales de venta"
                : "No se encontraron materiales con los filtros aplicados"
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {filteredServices.map(service => (
              <div key={service.id} className="card-premium overflow-hidden">
                <div className="p-4 bg-muted/30 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {service.materials.length} archivo{service.materials.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {service.materials.map(material => (
                    <div key={material.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-xs text-muted-foreground">PDF • Subido el {material.uploadedAt}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
