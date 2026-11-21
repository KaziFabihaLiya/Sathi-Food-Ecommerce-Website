export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export type Product = {
  id: string; slug: string; name: string; tagline: string; description: string;
  features: string[]; price: number; weightGrams: number; stock: number;
  imageUrl: string; badge?: string | null; active: boolean; inStock?: boolean;
};
export type Review = { id: string; imageUrl: string; caption?: string | null; active: boolean; sortOrder: number };
export type DashboardData = {
  ordersToday: number; pendingOrders: number; revenueThisMonth: number;
  recentOrders: { id: string; invoiceNo: string; customerName: string; phone: string; itemsSummary: string; total: number; status: OrderStatus }[];
};
export type OrderDetailData = {
  id: string; invoiceNo: string; customerName: string; phone: string; address: string; district: string;
  note?: string | null; paymentMethod: string; status: OrderStatus; total: number; createdAt: string;
  items: { id: string; productName: string; unitPrice: number; quantity: number }[];
};
