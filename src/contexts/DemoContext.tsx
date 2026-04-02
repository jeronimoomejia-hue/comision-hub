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
  CommissionTier,
  VendorCommissionAssignment,
  sales as initialSales,
  commissions as initialCommissions,
  vendorPayments as initialVendorPayments,
  companyPayments as initialCompanyPayments,
  trainingProgress as initialTrainings,
  services as initialServices,
  companies as initialCompanies,
  subscriptions as initialSubscriptions,
  refundRequests as initialRefunds,
  serviceRequests as initialServiceRequests,
  commissionTiers as initialCommissionTiers,
  vendorCommissionAssignments as initialVCA
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
  commissionTiers: CommissionTier[];
  vendorCommissionAssignments: VendorCommissionAssignment[];
  pinnedServices: string[];
  demoMode: boolean;
  isTutorialMode: boolean;
  currentVendorId: string;
  currentCompanyId: string;
  currentRole: 'vendor' | 'company' | 'admin';
  currentCompanyPlan: CompanyPlan;
  setIsTutorialMode: (v: boolean) => void;
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
  addCommissionTier: (tier: Omit<CommissionTier, 'id' | 'createdAt'>) => void;
  updateCommissionTier: (tierId: string, updates: Partial<CommissionTier>) => void;
  removeCommissionTier: (tierId: string) => void;
  assignVendorTier: (vendorId: string, serviceId: string, tierId: string) => void;
  getVendorTier: (vendorId: string, serviceId: string) => CommissionTier | null;
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
  const [commissionTiersState, setCommissionTiers] = useState<CommissionTier[]>(initialCommissionTiers);
  const [vcaState, setVCA] = useState<VendorCommissionAssignment[]>(initialVCA);
  
  const [currentRole, setCurrentRole] = useState<'vendor' | 'company' | 'admin'>('vendor');
  const [currentVendorId, setCurrentVendorId] = useState('vendor-001');
  const [currentCompanyId, setCurrentCompanyId] = useState('company-009');
  const [currentCompanyPlan, setCurrentCompanyPlan] = useState<CompanyPlan>('premium');
  
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
    } else if (status === 'COMPLETED') {
      setCommissions(prev => prev.map(comm =>
        comm.saleId === saleId ? { ...comm, status: 'COMPLETED' as const } : comm
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
  
  const addActivationCodes = (serviceId: string, codes: string[]) => {
    setServices(prev => prev.map(service => {
      if (service.id !== serviceId) return service;
      const newCodes = codes.map((code, i) => ({
        id: `ac-${Date.now()}-${i}`,
        code,
        status: 'available' as const,
      }));
      return { ...service, activationCodes: [...service.activationCodes, ...newCodes] };
    }));
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

  // Commission Tiers CRUD
  const addCommissionTier = (tierData: Omit<CommissionTier, 'id' | 'createdAt'>) => {
    const newTier: CommissionTier = {
      ...tierData,
      id: `tier-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCommissionTiers(prev => [...prev, newTier]);
  };

  const updateCommissionTier = (tierId: string, updates: Partial<CommissionTier>) => {
    setCommissionTiers(prev => prev.map(t =>
      t.id === tierId ? { ...t, ...updates } : t
    ));
  };

  const removeCommissionTier = (tierId: string) => {
    setCommissionTiers(prev => prev.filter(t => t.id !== tierId));
    setVCA(prev => prev.filter(a => a.tierId !== tierId));
  };

  const assignVendorTier = (vendorId: string, serviceId: string, tierId: string) => {
    setVCA(prev => {
      const existing = prev.find(a => a.vendorId === vendorId && a.serviceId === serviceId);
      if (existing) {
        return prev.map(a => a.id === existing.id ? { ...a, tierId, assignedAt: new Date().toISOString().split('T')[0] } : a);
      }
      return [...prev, { id: `vca-${Date.now()}`, vendorId, serviceId, tierId, assignedAt: new Date().toISOString().split('T')[0] }];
    });
  };

  const getVendorTier = (vendorId: string, serviceId: string): CommissionTier | null => {
    const assignment = vcaState.find(a => a.vendorId === vendorId && a.serviceId === serviceId);
    if (assignment) {
      return commissionTiersState.find(t => t.id === assignment.tierId) || null;
    }
    // Default: return the public tier for this service
    return commissionTiersState.find(t => t.serviceId === serviceId && t.isPublic) || null;
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
    setCommissionTiers(initialCommissionTiers);
    setVCA(initialVCA);
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
      commissionTiers: commissionTiersState,
      vendorCommissionAssignments: vcaState,
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
      addActivationCodes,
      addRefundRequest,
      updateRefundRequest,
      addServiceRequest,
      updateServiceRequest,
      addCommissionTier,
      updateCommissionTier,
      removeCommissionTier,
      assignVendorTier,
      getVendorTier,
      resetDemoData
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    // Return a safe fallback during error recovery renders
    console.warn('useDemo called outside DemoProvider — returning fallback');
    return {
      sales: [], commissions: [], vendorPayments: [], companyPayments: [],
      trainingProgress: [], services: [], companies: [], subscriptions: [],
      refundRequests: [], serviceRequests: [], commissionTiers: [],
      vendorCommissionAssignments: [], pinnedServices: [],
      demoMode: true, currentVendorId: 'vendor-001', currentCompanyId: 'company-009',
      currentRole: 'vendor' as const, currentCompanyPlan: 'premium' as const,
      setCurrentRole: () => {}, setCurrentCompanyPlan: () => {},
      setCurrentVendorId: () => {}, setCurrentCompanyId: () => {},
      addSale: () => {}, updateSaleStatus: () => {}, updateCommissionStatus: () => {},
      updateTrainingProgress: () => {}, startTraining: () => {}, completeTraining: () => {},
      togglePinService: () => {}, addService: () => {}, updateService: () => {},
      addActivationCodes: () => {}, addRefundRequest: () => {}, updateRefundRequest: () => {},
      addServiceRequest: () => {}, updateServiceRequest: () => {},
      addCommissionTier: () => {}, updateCommissionTier: () => {}, removeCommissionTier: () => {},
      assignVendorTier: () => {}, getVendorTier: () => null, resetDemoData: () => {},
    } as DemoContextType;
  }
  return context;
}
