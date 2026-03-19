import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Sale, 
  Commission,
  VendorPayment,
  CompanyPayment,
  TrainingProgress,
  Service,
  Company,
  CompanyPlan,
  Subscription,
  RefundRequest,
  ServiceRequest,
  TransactionStatus,
  sales as initialSales,
  commissions as initialCommissions,
  vendorPayments as initialVendorPayments,
  companyPayments as initialCompanyPayments,
  trainingProgress as initialTrainings,
  services as initialServices,
  companies as initialCompanies,
  subscriptions as initialSubscriptions,
  refundRequests as initialRefunds,
  serviceRequests as initialServiceRequests
} from '@/data/mockData';

interface DemoContextType {
  sales: Sale[];
  commissions: Commission[];
  vendorPayments: VendorPayment[];
  companyPayments: CompanyPayment[];
  trainingProgress: TrainingProgress[];
  services: Service[];
  companies: Company[];
  subscriptions: Subscription[];
  refundRequests: RefundRequest[];
  serviceRequests: ServiceRequest[];
  pinnedServices: string[];
  demoMode: boolean;
  currentVendorId: string;
  currentCompanyId: string;
  currentRole: 'vendor' | 'company' | 'admin';
  currentCompanyPlan: CompanyPlan;
  setCurrentRole: (role: 'vendor' | 'company' | 'admin') => void;
  setCurrentCompanyPlan: (plan: CompanyPlan) => void;
  setCurrentVendorId: (id: string) => void;
  setCurrentCompanyId: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSaleStatus: (saleId: string, status: TransactionStatus) => void;
  updateCommissionStatus: (commissionId: string, status: Commission['status']) => void;
  updateTrainingProgress: (trainingId: string, updates: Partial<TrainingProgress>) => void;
  startTraining: (vendorId: string, serviceId: string) => void;
  completeTraining: (vendorId: string, serviceId: string) => void;
  togglePinService: (serviceId: string) => void;
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  addActivationCodes: (serviceId: string, codes: string[]) => void;
  addRefundRequest: (refund: Omit<RefundRequest, 'id' | 'createdAt'>) => void;
  updateRefundRequest: (refundId: string, updates: Partial<RefundRequest>) => void;
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceRequest: (requestId: string, updates: Partial<ServiceRequest>) => void;
  resetDemoData: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(initialVendorPayments);
  const [companyPayments, setCompanyPayments] = useState<CompanyPayment[]>(initialCompanyPayments);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>(initialTrainings);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [companiesState] = useState<Company[]>(initialCompanies);
  const [subs] = useState<Subscription[]>(initialSubscriptions);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(initialRefunds);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(initialServiceRequests);
  
  const [currentRole, setCurrentRole] = useState<'vendor' | 'company' | 'admin'>('vendor');
  const [currentVendorId, setCurrentVendorId] = useState('vendor-001');
  const [currentCompanyId, setCurrentCompanyId] = useState('company-001');
  const [currentCompanyPlan, setCurrentCompanyPlan] = useState<CompanyPlan>('enterprise');
  
  // Pinned services - initial: services where vendor has training (completed or in progress)
  const [pinnedServices, setPinnedServices] = useState<string[]>(() => {
    return initialTrainings
      .filter(tp => tp.vendorId === 'vendor-001')
      .map(tp => tp.serviceId);
  });
  
  const togglePinService = (serviceId: string) => {
    setPinnedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const demoMode = true;
  
  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const saleId = `sale-${Date.now()}`;
    const newSale: Sale = {
      ...saleData,
      id: saleId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // Auto-deliver activation code from the service's pool
    const service = services.find(s => s.id === saleData.serviceId);
    if (service) {
      const availableCode = service.activationCodes.find(c => c.status === 'available');
      if (availableCode) {
        newSale.activationCode = availableCode.code;
        setServices(prev => prev.map(s => 
          s.id === saleData.serviceId 
            ? { ...s, activationCodes: s.activationCodes.map(c => 
                c.id === availableCode.id 
                  ? { ...c, status: 'delivered' as const, assignedToSaleId: saleId, deliveredAt: newSale.createdAt }
                  : c
              )}
            : s
        ));
      }
    }
    
    setSales(prev => [newSale, ...prev]);
    
    const commission: Commission = {
      id: `comm-${Date.now()}`,
      saleId: newSale.id,
      vendorId: saleData.vendorId,
      amountCOP: saleData.sellerCommissionAmount,
      status: 'HELD',
      createdAt: newSale.createdAt
    };
    setCommissions(prev => [commission, ...prev]);
  };
  
  const updateSaleStatus = (saleId: string, status: TransactionStatus) => {
    setSales(prev => prev.map(sale => 
      sale.id === saleId ? { ...sale, status } : sale
    ));
    
    if (status === 'REFUNDED') {
      setCommissions(prev => prev.map(comm =>
        comm.saleId === saleId ? { ...comm, status: 'REFUNDED' as const } : comm
      ));
    } else if (status === 'RELEASED') {
      setCommissions(prev => prev.map(comm =>
        comm.saleId === saleId ? { ...comm, status: 'RELEASED' as const } : comm
      ));
    }
  };
  
  const updateCommissionStatus = (commissionId: string, status: Commission['status']) => {
    setCommissions(prev => prev.map(comm =>
      comm.id === commissionId ? { ...comm, status } : comm
    ));
  };
  
  const updateTrainingProgress = (trainingId: string, updates: Partial<TrainingProgress>) => {
    setTrainingProgress(prev => prev.map(tp =>
      tp.id === trainingId ? { ...tp, ...updates } : tp
    ));
  };
  
  const startTraining = (vendorId: string, serviceId: string) => {
    const existing = trainingProgress.find(tp => tp.vendorId === vendorId && tp.serviceId === serviceId);
    
    if (existing) {
      setTrainingProgress(prev => prev.map(tp =>
        tp.id === existing.id
          ? { ...tp, status: 'in_progress' as const, lastAccessedAt: new Date().toISOString().split('T')[0] }
          : tp
      ));
    } else {
      const newTraining: TrainingProgress = {
        id: `tp-${Date.now()}`,
        vendorId,
        serviceId,
        status: 'in_progress',
        lastAccessedAt: new Date().toISOString().split('T')[0]
      };
      setTrainingProgress(prev => [...prev, newTraining]);
    }
  };
  
  const completeTraining = (vendorId: string, serviceId: string) => {
    setTrainingProgress(prev => prev.map(tp =>
      tp.vendorId === vendorId && tp.serviceId === serviceId
        ? { 
            ...tp, 
            status: 'declared_completed' as const, 
            completedAt: new Date().toISOString().split('T')[0],
            lastAccessedAt: new Date().toISOString().split('T')[0]
          }
        : tp
    ));
  };
  
  const addService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: `service-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setServices(prev => [...prev, newService]);
  };
  
  const updateService = (serviceId: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId ? { ...service, ...updates } : service
    ));
  };
  
  const addRefundRequest = (refundData: Omit<RefundRequest, 'id' | 'createdAt'>) => {
    const newRefund: RefundRequest = {
      ...refundData,
      id: `refund-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRefundRequests(prev => [newRefund, ...prev]);
    
    const service = services.find(s => s.id === refundData.serviceId);
    if (service?.refundPolicy.autoRefund) {
      setRefundRequests(prev => prev.map(r => 
        r.id === newRefund.id 
          ? { ...r, status: 'automático', decisionBy: 'sistema', decidedAt: newRefund.createdAt }
          : r
      ));
      updateSaleStatus(refundData.saleId, 'REFUNDED');
    }
  };
  
  const updateRefundRequest = (refundId: string, updates: Partial<RefundRequest>) => {
    setRefundRequests(prev => prev.map(r =>
      r.id === refundId ? { ...r, ...updates } : r
    ));
    
    if (updates.status === 'aprobado') {
      const refund = refundRequests.find(r => r.id === refundId);
      if (refund) {
        updateSaleStatus(refund.saleId, 'REFUNDED');
      }
    }
  };
  
  const addServiceRequest = (requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newRequest: ServiceRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setServiceRequests(prev => [newRequest, ...prev]);
  };
  
  const updateServiceRequest = (requestId: string, updates: Partial<ServiceRequest>) => {
    setServiceRequests(prev => prev.map(r =>
      r.id === requestId 
        ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } 
        : r
    ));
  };
  
  const resetDemoData = () => {
    setSales(initialSales);
    setCommissions(initialCommissions);
    setVendorPayments(initialVendorPayments);
    setCompanyPayments(initialCompanyPayments);
    setTrainingProgress(initialTrainings);
    setServices(initialServices);
    setRefundRequests(initialRefunds);
    setServiceRequests(initialServiceRequests);
  };
  
  return (
    <DemoContext.Provider value={{
      sales,
      commissions,
      vendorPayments,
      companyPayments,
      trainingProgress,
      services,
      companies: companiesState,
      subscriptions: subs,
      refundRequests,
      serviceRequests,
      pinnedServices,
      demoMode,
      currentVendorId,
      currentCompanyId,
      currentRole,
      currentCompanyPlan,
      setCurrentRole,
      setCurrentCompanyPlan,
      setCurrentVendorId,
      setCurrentCompanyId,
      addSale,
      updateSaleStatus,
      updateCommissionStatus,
      updateTrainingProgress,
      startTraining,
      completeTraining,
      togglePinService,
      addService,
      updateService,
      addRefundRequest,
      updateRefundRequest,
      addServiceRequest,
      updateServiceRequest,
      resetDemoData
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
