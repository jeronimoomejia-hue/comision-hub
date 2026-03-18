import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Users, Building2, UserCheck, UserX, Calendar, Search, Eye, Pause, Play, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminUser, vendors, companyUsers, companies, sales, commissions, formatCurrency, formatDate } from "@/data/mockData";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const allUsers = [adminUser, ...companyUsers, ...vendors];
  
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesCountry = countryFilter === "all" || user.country === countryFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesCountry;
  });

  const countries = [...new Set(allUsers.map(u => u.country))];
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const activeCompanies = companyUsers.filter(c => c.status === 'active').length;
  const blockedUsers = allUsers.filter(u => u.status === 'blocked').length;
  const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7);
  const newUsers = allUsers.filter(u => new Date(u.createdAt) >= last7Days).length;

  const getUserStats = (userId: string, role: string) => {
    if (role === 'vendor') {
      const userSales = sales.filter(s => s.vendorId === userId);
      const gmv = userSales.reduce((sum, s) => sum + s.amountCOP, 0);
      const userComms = commissions.filter(c => c.vendorId === userId);
      const totalComm = userComms.reduce((sum, c) => sum + c.amountCOP, 0);
      return { sales: userSales.length, gmv, commission: totalComm };
    }
    if (role === 'company') {
      const company = companies.find(c => c.id === companyUsers.find(cu => cu.id === userId)?.companyId);
      const companySalesList = sales.filter(s => s.companyId === company?.id);
      return { sales: companySalesList.length, gmv: companySalesList.reduce((sum, s) => sum + s.amountCOP, 0), commission: 0 };
    }
    return { sales: sales.length, gmv: sales.reduce((sum, s) => sum + s.amountCOP, 0), commission: 0 };
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      paused: "bg-yellow-500/10 text-yellow-500",
      blocked: "bg-red-500/10 text-red-500"
    };
    return <Badge className={colors[status]}>{status === 'active' ? 'Activo' : status === 'paused' ? 'Pausado' : 'Bloqueado'}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-500/10 text-purple-500",
      vendor: "bg-blue-500/10 text-blue-500",
      company: "bg-primary/10 text-primary"
    };
    return <Badge className={colors[role]}>{role === 'admin' ? 'Admin' : role === 'vendor' ? 'Vendedor' : 'Empresa'}</Badge>;
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center"><Users className="w-8 h-8 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{allUsers.length}</p><p className="text-sm text-muted-foreground">Total usuarios</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="text-2xl font-bold">{activeVendors}</p><p className="text-sm text-muted-foreground">Vendedores activos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Building2 className="w-8 h-8 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{activeCompanies}</p><p className="text-sm text-muted-foreground">Empresas activas</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" /><p className="text-2xl font-bold">{newUsers}</p><p className="text-sm text-muted-foreground">Nuevos (7 días)</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><UserX className="w-8 h-8 mx-auto mb-2 text-red-500" /><p className="text-2xl font-bold">{blockedUsers}</p><p className="text-sm text-muted-foreground">Bloqueados</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Rol" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="vendor">Vendedor</SelectItem><SelectItem value="company">Empresa</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Activo</SelectItem><SelectItem value="paused">Pausado</SelectItem><SelectItem value="blocked">Bloqueado</SelectItem></SelectContent></Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="País" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Rol</TableHead><TableHead>País</TableHead><TableHead>Estado</TableHead><TableHead>Registro</TableHead><TableHead className="text-right">Ventas</TableHead><TableHead className="text-right">GMV</TableHead><TableHead className="text-right">Comisión</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const stats = getUserStats(user.id, user.role);
                return (
                  <TableRow key={user.id}>
                    <TableCell><div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">{stats.sales}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stats.gmv)}</TableCell>
                    <TableCell className="text-right">{user.role === 'vendor' ? formatCurrency(stats.commission) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Pause className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Ban className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Modal */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detalle de Usuario</DialogTitle></DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{selectedUser.name[0]}</div>
                  <div><p className="font-bold text-lg">{selectedUser.name}</p><p className="text-muted-foreground">{selectedUser.email}</p>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">País</p><p className="font-medium">{selectedUser.country}</p></div>
                  <div><p className="text-muted-foreground">Estado</p>{getStatusBadge(selectedUser.status)}</div>
                  <div><p className="text-muted-foreground">Registro</p><p className="font-medium">{formatDate(selectedUser.createdAt)}</p></div>
                  <div><p className="text-muted-foreground">Ventas</p><p className="font-medium">{getUserStats(selectedUser.id, selectedUser.role).sales}</p></div>
                </div>
                <div className="pt-4 border-t"><p className="font-medium mb-2">Últimos movimientos</p>
                  {sales.filter(s => s.vendorId === selectedUser.id || (selectedUser.role === 'company' && s.companyId === companyUsers.find(cu => cu.id === selectedUser.id)?.companyId)).slice(0, 5).map(s => (
                    <div key={s.id} className="flex justify-between py-1 text-sm"><span>{s.clientName}</span><span>{formatCurrency(s.amountCOP)}</span></div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
