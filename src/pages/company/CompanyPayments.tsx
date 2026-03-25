import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { companies, vendors, CURRENT_COMPANY_ID, formatCOP, services as allServices } from "@/data/mockData";
import type { CompanyPayment } from "@/data/mockData";
import TransactionCard from "@/components/TransactionCard";

export default function CompanyPayments() {
  const { companyPayments } = useDemo();
  const company = companies.find(c => c.id === CURRENT_COMPANY_ID);
  
  const myPayments = companyPayments.filter(p => p.companyId === CURRENT_COMPANY_ID);

  return (
    <DashboardLayout role="company" userName={company?.name}>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Pagos recibidos</h1>

        <div className="space-y-2">
          {myPayments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin transferencias aún</p>
          ) : myPayments.slice(0, 30).map(payment => {
            const service = allServices.find(s => s.id === payment.serviceId);
            const vendor = vendors.find(v => v.id === payment.vendorId);
            return (
              <TransactionCard
                key={payment.id}
                id={payment.id}
                clientName={payment.clientName}
                serviceName={service?.name}
                serviceCategory={service?.category}
                vendorName={vendor?.name}
                amount={payment.amountCOP}
                commission={payment.vendorCommission}
                platformFee={payment.mensualistaFee}
                netAmount={payment.amountCOP}
                status={payment.status}
                statusType="payment"
                date={payment.scheduledDate}
                failureReason={payment.failureReason}
                role="company"
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
