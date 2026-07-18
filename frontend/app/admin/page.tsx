"use client";

import { formatVND } from "@/lib/utils";
import { fetchProvinces, type ProvinceOption } from "@/lib/locations";
import { readStoredValue, removeStoredValue } from "@/lib/storageKeys";
import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, LogOut, PackageCheck, PanelLeft, Search, ShieldCheck, Star, Users, WalletCards } from "lucide-react";

import OverviewView from "@/components/admin/OverviewView";
import ProductsView from "@/components/admin/ProductsView";
import OrdersView from "@/components/admin/OrdersView";
import CustomersView from "@/components/admin/CustomersView";
import ReviewsView from "@/components/admin/ReviewsView";
import ReturnsView from "@/components/admin/ReturnsView";
import SettingsView from "@/components/admin/SettingsView";
import { AdminTab, RevenueMode, AdminProduct, ProductFormState, ProductPayload, AdminOrder, DashboardData, API_URL, TOKEN_KEY, ADMIN_KEY, emptyProductForm, navItems, statusLabels, toDateInputValue, monthLabel, fileToDataUrl, orderProvinceName } from "@/components/admin/shared";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loginError, setLoginError] = useState("");
  const [dataError, setDataError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [creatingShipmentOrderId, setCreatingShipmentOrderId] = useState<number | null>(null);
  const [updatingReturnId, setUpdatingReturnId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("day");
  const [revenueStartDate, setRevenueStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return toDateInputValue(date);
  });
  const [revenueEndDate, setRevenueEndDate] = useState(() => toDateInputValue(new Date()));
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [productError, setProductError] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<AdminProduct | null>(null);
  const [selectedProductImageFile, setSelectedProductImageFile] = useState<File | null>(null);
  const [selectedProductImagePreview, setSelectedProductImagePreview] = useState("");
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);

  useEffect(() => {
    setMounted(true);
    setToken(readStoredValue(TOKEN_KEY));
  }, []);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!selectedProductImageFile) {
      setSelectedProductImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedProductImageFile);
    setSelectedProductImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedProductImageFile]);

  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      setIsLoadingData(true);
      setDataError("");

      try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Không thể tải dữ liệu quản trị.");
        }

        setData(payload as DashboardData);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : "Không thể tải dữ liệu.");
        removeStoredValue(TOKEN_KEY);
        removeStoredValue(ADMIN_KEY);
        setToken(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboard();
  }, [token]);

  const searchText = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.products;
    return data.products.filter((product) =>
      [product.name, product.category, product.status]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.orders;
    return data.orders.filter((order) =>
      [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.customer_address,
        order.recipient_address,
        orderProvinceName(order),
        statusLabels[order.status],
      ]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data.users;
    return data.users.filter((user) =>
      [user.name, user.email, user.phone, user.address, user.province_name, user.ward_name]
        .filter(Boolean)
        .some((item) => item?.toLowerCase().includes(searchText))
    );
  }, [data, searchText]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Doanh thu hôm nay",
        value: formatVND(data.summary.revenue_today),
        change: `Tổng doanh thu ${formatVND(data.summary.revenue_total)}`,
        icon: CircleDollarSign,
      },
      {
        label: "Việc cần xử lý",
        value: String(data.summary.orders_pending + data.summary.return_requests_pending),
        change: `${data.summary.orders_pending} đơn · ${data.summary.return_requests_pending} hậu mãi`,
        icon: PackageCheck,
      },
      {
        label: "Khách hàng mới",
        value: String(data.summary.new_customers),
        change: `${data.users.length} tài khoản khách hàng`,
        icon: Users,
      },
      {
        label: "Sản phẩm sắp hết",
        value: String(data.summary.low_stock),
        change: `${data.products.length} sản phẩm trong kho`,
        icon: WalletCards,
      },
    ];
  }, [data]);

  const revenueBars = useMemo(() => {
    if (!data) return [];

    const start = revenueStartDate ? new Date(`${revenueStartDate}T00:00:00`) : null;
    const end = revenueEndDate ? new Date(`${revenueEndDate}T23:59:59`) : null;
    const totals = data.orders.reduce<Record<string, { label: string; total: number }>>((result, order) => {
      if (order.status === "cancelled") return result;
      const orderDate = new Date(order.created_at);
      if (start && orderDate < start) return result;
      if (end && orderDate > end) return result;

      const key =
        revenueMode === "day"
          ? toDateInputValue(orderDate)
          : `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
      const label =
        revenueMode === "day"
          ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(orderDate)
          : monthLabel(orderDate);

      result[key] = {
        label,
        total: (result[key]?.total || 0) + order.total,
      };
      return result;
    }, {});

    const entries = Object.entries(totals)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value)
      .slice(-10);
    const max = Math.max(...entries.map((item) => item.total), 1);

    return entries.map((item) => ({
      ...item,
      value: Math.max((item.total / max) * 100, 3),
    }));
  }, [data, revenueEndDate, revenueMode, revenueStartDate]);

  const selectedRevenue = useMemo(
    () => revenueBars.reduce((sum, item) => sum + item.total, 0),
    [revenueBars]
  );
  const revenueMax = useMemo(() => Math.max(...revenueBars.map((item) => item.total), 0), [revenueBars]);
  const revenueTicks = useMemo(() => {
    if (revenueMax <= 0) return [0, 0, 0, 0, 0];
    return [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(revenueMax * ratio));
  }, [revenueMax]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Tài khoản hoặc mật khẩu không đúng.");
      }

      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(payload.admin));
      setToken(payload.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Không thể đăng nhập.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    removeStoredValue(TOKEN_KEY);
    removeStoredValue(ADMIN_KEY);
    setToken(null);
    setData(null);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: AdminOrder["status"]) => {
    if (!token) return;

    if (status === "cancelled" && !window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...(status === "completed" ? { payment_status: "paid" } : {}),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Không thể cập nhật trạng thái đơn hàng.");
      }

      const updatedOrder = payload as AdminOrder;

      setData((current) =>
        current
          ? {
              ...current,
              orders: current.orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
              summary: {
                ...current.summary,
                orders_pending: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => ["pending", "processing"].includes(order.status)).length,
                orders_shipping: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => order.status === "shipping").length,
                orders_completed: current.orders
                  .map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                  .filter((order) => order.status === "completed").length,
              },
            }
          : current
      );
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCreateShipment = async (orderId: number, carrier: "ghn" | "ghtk") => {
    if (!token) return;
    setCreatingShipmentOrderId(orderId);
    setDataError("");
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/shipment`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ carrier }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Không thể tạo vận đơn demo.");
      setData((current) => current ? {
        ...current,
        orders: current.orders.map((order) => order.id === orderId ? { ...order, ...payload } : order),
        summary: {
          ...current.summary,
          orders_pending: current.orders.filter((order) => order.id !== orderId && ["pending", "processing"].includes(order.status)).length,
          orders_shipping: current.orders.filter((order) => order.status === "shipping" || order.id === orderId).length,
        },
      } : current);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không thể tạo vận đơn demo.");
    } finally {
      setCreatingShipmentOrderId(null);
    }
  };

  const handleUpdateReturn = async (returnId: number, status: string, adminNote: string) => {
    if (!token) return;
    setUpdatingReturnId(returnId);
    setDataError("");
    try {
      const response = await fetch(`${API_URL}/admin/return-requests/${returnId}`, {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, admin_note: adminNote.trim() || null }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Không thể cập nhật yêu cầu hậu mãi.");
      setData((current) => current ? {
        ...current,
        returns: current.returns.map((item) => item.id === returnId ? payload : item),
        summary: {
          ...current.summary,
          return_requests_pending: current.returns.filter((item) => item.id !== returnId && item.status === "pending").length + (payload.status === "pending" ? 1 : 0),
        },
      } : current);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không thể cập nhật yêu cầu hậu mãi.");
    } finally {
      setUpdatingReturnId(null);
    }
  };

  const openCreateProduct = () => {
    const nextId = data?.products.length ? Math.max(...data.products.map((product) => product.id)) + 1 : 1;
    setEditingProductId(null);
    setProductForm({
      ...emptyProductForm,
      image: `products/product-${String(nextId).padStart(2, "0")}.jpg`,
    });
    setSelectedProductImageFile(null);
    setProductError("");
    setIsProductFormOpen(true);
    setActiveTab("products");
  };

  const openEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "Dây chuyền",
      stock: String(product.stock ?? 0),
      status: product.status === "inactive" ? "inactive" : "active",
      image: product.raw_image || product.image || "",
      description: product.description || "",
      is_best_seller: Boolean(product.is_best_seller ?? product.isBestSeller),
      warranty_months: String(product.warranty_months ?? 12),
    });
    setSelectedProductImageFile(null);
    setProductError("");
    setIsProductFormOpen(true);
    setActiveTab("products");
  };

  const closeProductForm = () => {
    setIsProductFormOpen(false);
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setSelectedProductImageFile(null);
    setProductError("");
  };

  const productPayload = async (): Promise<ProductPayload> => {
    const payload: ProductPayload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      category: productForm.category.trim(),
      stock: Number(productForm.stock),
      status: productForm.status,
      image: productForm.image.trim() || null,
      description: productForm.description.trim() || null,
      is_best_seller: productForm.is_best_seller,
      warranty_months: Number(productForm.warranty_months),
    };

    if (selectedProductImageFile) {
      payload.image_data = await fileToDataUrl(selectedProductImageFile);
    }

    return payload;
  };

  const handleProductImageFileChange = (file: File | null) => {
    setProductError("");

    if (!file) {
      setSelectedProductImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProductError("Vui lòng chọn đúng file ảnh.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setProductError("Ảnh tối đa 4MB.");
      return;
    }

    setSelectedProductImageFile(file);
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductError("");

    setIsSavingProduct(true);

    try {
      const payload = await productPayload();
      if (!payload.name || !payload.category || Number.isNaN(payload.price) || Number.isNaN(payload.stock) || payload.warranty_months < 1 || payload.warranty_months > 120) {
        setProductError("Vui lòng nhập đầy đủ tên, danh mục, giá và tồn kho.");
        return;
      }

      const response = await fetch(
        editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`,
        {
          method: editingProductId ? "PUT" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );
      const savedProduct = {
        ...((await response.json()) as AdminProduct & { message?: string }),
        raw_image: payload.image,
      };

      if (!response.ok) {
        throw new Error(savedProduct?.message || "Không thể lưu sản phẩm.");
      }

      setData((current) => {
        if (!current) return current;
        const nextProducts = editingProductId
          ? current.products.map((product) => (product.id === savedProduct.id ? savedProduct : product))
          : [savedProduct, ...current.products];

        return {
          ...current,
          products: nextProducts,
          summary: {
            ...current.summary,
            low_stock: nextProducts.filter((product) => (product.stock ?? 0) <= 10).length,
            best_sellers: nextProducts.filter((product) => product.is_best_seller || product.isBestSeller).length,
          },
        };
      });

      closeProductForm();
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Không thể lưu sản phẩm.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProductId(productId);
    setProductError("");

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể xóa sản phẩm.");
      }

      setData((current) => {
        if (!current) return current;
        const nextProducts = current.products.filter((product) => product.id !== productId);

        return {
          ...current,
          products: nextProducts,
          summary: {
            ...current.summary,
            low_stock: nextProducts.filter((product) => (product.stock ?? 0) <= 10).length,
            best_sellers: nextProducts.filter((product) => product.is_best_seller || product.isBestSeller).length,
          },
        };
      });

      if (editingProductId === productId) {
        closeProductForm();
      }
      setProductPendingDelete(null);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Không thể xóa sản phẩm.");
    } finally {
      setDeletingProductId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f0e7] text-[#7a2130]">
        Đang khởi tạo trang quản trị...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="dc-admin-redesign min-h-screen bg-[#f5f0e7] text-[#28171a]">
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)]">
          <section className="hidden border-r border-[#d6bd7a]/20 bg-[#070607] p-8 text-[#f7efe1] lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 border border-[#d6bd7a]/30 bg-[#d6bd7a]/8 px-4 py-2">
                <span className="flex h-9 w-9 items-center justify-center bg-[#7a2130] text-sm font-black text-[#fffaf2]">ĐC</span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">Đức Chính Jewelry Admin</p>
                  <p className="text-xs text-[#cfc4ad]/70">Bảng điều phối cửa hàng</p>
                </div>
              </div>
              <div className="mt-20 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d6bd7a]">Khu vực quản trị</p>
                <h1 className="mt-5 font-serif text-6xl font-light leading-tight tracking-normal text-[#f7efe1]">
                  Điều hành Đức Chính Jewelry rõ ràng, nhanh và gọn hơn.
                </h1>
                <p className="mt-6 text-base leading-7 text-[#cfc4ad]/78">
                  Theo dõi doanh thu, sản phẩm, đơn hàng và khách hàng trong một không gian quản trị mới.
                </p>
              </div>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {["Doanh thu", "Đơn hàng", "Tồn kho"].map((item) => (
                <div key={item} className="border border-[#d6bd7a]/18 bg-[#0d0b0a] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6bd7a]">{item}</p>
                  <p className="mt-2 text-sm text-[#cfc4ad]/75">Sẵn sàng kiểm tra</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-md border border-[#d6bd7a]/25 bg-[#0d0b0a] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-[#d6bd7a] text-black">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-light tracking-normal text-[#f7efe1]">Đăng nhập quản trị</h1>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6bd7a]">Đức Chính Jewelry Admin</p>
                </div>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Tài khoản
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-black/25 px-4 text-sm text-[#f7efe1] outline-none transition placeholder:text-[#cfc4ad]/45 focus:border-[#d6bd7a]/65 focus:ring-2 focus:ring-[#d6bd7a]/25"
                  placeholder="admin hoặc admin@ducchinhjewelry.local"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#f7efe1]">
                Mật khẩu
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#d6bd7a]/25 bg-black/25 px-4 text-sm text-[#f7efe1] outline-none transition placeholder:text-[#cfc4ad]/45 focus:border-[#d6bd7a]/65 focus:ring-2 focus:ring-[#d6bd7a]/25"
                  placeholder="Nhập mật khẩu quản trị"
                />
              </label>

              {loginError && (
                <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex h-12 w-full items-center justify-center border border-[#d6bd7a] bg-[#d6bd7a] text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-[#f4df9b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </section>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="dc-admin-redesign min-h-screen bg-[#f5f0e7] text-[#28171a]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#d6bd7a]/18 bg-[#070607] px-5 py-6 text-[#f7efe1] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start lg:flex-col lg:overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[#d6bd7a] text-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-serif text-2xl font-light tracking-normal">
                ĐỨC CHÍNH <span className="italic text-[#d6bd7a]">JEWELRY</span>
              </p>
              <p className="text-xs text-[#cfc4ad]/65">Quản trị cửa hàng Đức Chính Jewelry</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-[#d6bd7a]/45 bg-[#d6bd7a]/12 text-[#d6bd7a]"
                      : "text-[#cfc4ad]/75 hover:bg-[#d6bd7a]/8 hover:text-[#f7efe1]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border border-[#d6bd7a]/18 bg-[#0d0b0a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#d6bd7a]">
              <Star className="h-4 w-4 fill-[#d6bd7a] text-[#d6bd7a]" />
              Kế hoạch hôm nay
            </div>
            <p className="mt-2 text-sm leading-6 text-[#cfc4ad]/75">
              Kiểm tra {data?.summary.best_sellers ?? 0} sản phẩm bán chạy và các mẫu sắp hết hàng.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#d6bd7a]/18 bg-[#070607]/94 shadow-[0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setIsMobileNavigationOpen((current) => !current)}
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d6bd7a]/25 bg-black/35 text-[#f7efe1] transition hover:border-[#d6bd7a]/55 hover:text-[#d6bd7a] lg:hidden"
                aria-controls="admin-mobile-navigation"
                aria-expanded={isMobileNavigationOpen}
                aria-label={isMobileNavigationOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
              >
                <PanelLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6bd7a]">
                  {navItems.find((item) => item.id === activeTab)?.label}
                </p>
                <h1 className="truncate font-serif text-2xl font-light tracking-normal text-[#f7efe1] sm:text-3xl">
                  Đức Chính Jewelry Admin
                </h1>
              </div>

              <div className="order-3 flex h-10 w-full items-center gap-2 border border-[#d6bd7a]/25 bg-black/30 px-3 shadow-sm lg:order-none lg:w-80">
                <Search className="h-4 w-4 text-[#d6bd7a]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-[#f7efe1] outline-none placeholder:text-[#cfc4ad]/50"
                  placeholder="Tìm trong mục hiện tại..."
                  aria-label="Tìm trong mục quản trị hiện tại"
                />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 border border-[#d6bd7a]/25 bg-black/30 px-2 text-sm font-medium text-[#f7efe1] transition hover:border-[#d6bd7a]/55 hover:text-[#d6bd7a]"
              >
                <span className="flex h-7 w-7 items-center justify-center bg-[#d6bd7a] text-xs font-bold text-black">
                  AD
                </span>
                <span className="hidden sm:inline">Admin</span>
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <nav
              id="admin-mobile-navigation"
              aria-label="Điều hướng quản trị trên thiết bị di động"
              className={`${isMobileNavigationOpen ? "grid" : "hidden"} grid-cols-2 gap-2 border-t border-[#d6bd7a]/18 px-4 py-3 sm:grid-cols-4 sm:px-6 lg:hidden`}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileNavigationOpen(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "border border-[#d6bd7a]/45 bg-[#d6bd7a]/12 text-[#d6bd7a]"
                        : "border border-transparent text-[#cfc4ad]/80 hover:border-[#d6bd7a]/25 hover:text-[#d6bd7a]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {isLoadingData && (
              <div className="rounded-lg border border-orange-100 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Đang tải dữ liệu từ cơ sở dữ liệu...
              </div>
            )}

            {dataError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {dataError}
              </div>
            )}

            {data && activeTab === "overview" && (
              <OverviewView
                data={data}
                stats={stats}
                revenueBars={revenueBars}
                revenueTicks={revenueTicks}
                selectedRevenue={selectedRevenue}
                revenueMode={revenueMode}
                setRevenueMode={setRevenueMode}
                revenueStartDate={revenueStartDate}
                revenueEndDate={revenueEndDate}
                setRevenueStartDate={setRevenueStartDate}
                setRevenueEndDate={setRevenueEndDate}
              />
            )}

            {data && activeTab === "products" && (
              <ProductsView
                products={filteredProducts}
                orders={data.orders}
                productForm={productForm}
                isProductFormOpen={isProductFormOpen}
                editingProductId={editingProductId}
                productError={productError}
                isSavingProduct={isSavingProduct}
                deletingProductId={deletingProductId}
                productPendingDelete={productPendingDelete}
                selectedProductImageFile={selectedProductImageFile}
                selectedProductImagePreview={selectedProductImagePreview}
                setProductForm={setProductForm}
                openCreateProduct={openCreateProduct}
                openEditProduct={openEditProduct}
                closeProductForm={closeProductForm}
                onProductImageFileChange={handleProductImageFileChange}
                onRequestDeleteProduct={setProductPendingDelete}
                onCloseDeleteProduct={() => setProductPendingDelete(null)}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {data && activeTab === "orders" && (
              <OrdersView
                orders={filteredOrders}
                provinces={provinces}
                updatingOrderId={updatingOrderId}
                creatingShipmentOrderId={creatingShipmentOrderId}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onCreateShipment={handleCreateShipment}
              />
            )}

            {data && activeTab === "returns" && (
              <ReturnsView
                requests={data.returns || []}
                updatingReturnId={updatingReturnId}
                onUpdateReturn={handleUpdateReturn}
              />
            )}

            {data && activeTab === "customers" && <CustomersView users={filteredUsers} orders={data.orders} />}

            {data && activeTab === "reviews" && <ReviewsView reviews={data.reviews || []} />}

            {data && activeTab === "settings" && <SettingsView />}
          </main>
        </div>
      </div>
    </div>
  );
}
