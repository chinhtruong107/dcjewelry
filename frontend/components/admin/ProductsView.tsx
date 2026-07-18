"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Boxes, PackageCheck, Pencil, Plus, Star, Trash2, Upload } from "lucide-react";
import { formatVND, productImageUrl } from "@/lib/utils";
import { AdminProduct, ProductFormState, AdminOrder, productInventoryStatus, SectionCard, AdminModal } from "./shared";

export default function ProductsView({
  products,
  orders,
  productForm,
  isProductFormOpen,
  editingProductId,
  productError,
  isSavingProduct,
  deletingProductId,
  productPendingDelete,
  selectedProductImageFile,
  selectedProductImagePreview,
  setProductForm,
  openCreateProduct,
  openEditProduct,
  closeProductForm,
  onProductImageFileChange,
  onRequestDeleteProduct,
  onCloseDeleteProduct,
  onSaveProduct,
  onDeleteProduct,
}: {
  products: AdminProduct[];
  orders: AdminOrder[];
  productForm: ProductFormState;
  isProductFormOpen: boolean;
  editingProductId: number | null;
  productError: string;
  isSavingProduct: boolean;
  deletingProductId: number | null;
  productPendingDelete: AdminProduct | null;
  selectedProductImageFile: File | null;
  selectedProductImagePreview: string;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  openCreateProduct: () => void;
  openEditProduct: (product: AdminProduct) => void;
  closeProductForm: () => void;
  onProductImageFileChange: (file: File | null) => void;
  onRequestDeleteProduct: (product: AdminProduct) => void;
  onCloseDeleteProduct: () => void;
  onSaveProduct: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteProduct: (productId: number) => void;
}) {
  const [productView, setProductView] = useState<"all" | "bestSeller" | "topSold" | "lowStock" | "outOfStock">("all");
  const imagePreviewSrc = selectedProductImagePreview || productImageUrl(productForm.image);
  const productSales = useMemo(() => {
    return orders.reduce<Record<number, { quantity: number; revenue: number }>>((result, order) => {
      if (order.status === "cancelled") return result;

      (order.items || []).forEach((item) => {
        const productId = item.product_id;
        if (!productId) return;

        result[productId] = {
          quantity: (result[productId]?.quantity || 0) + item.quantity,
          revenue: (result[productId]?.revenue || 0) + item.line_total,
        };
      });

      return result;
    }, {});
  }, [orders]);
  const productsWithStats = useMemo(
    () =>
      products.map((product) => ({
        product,
        sold: productSales[product.id]?.quantity || 0,
        revenue: productSales[product.id]?.revenue || 0,
        isBestSeller: Boolean(product.is_best_seller ?? product.isBestSeller),
        inventoryStatus: productInventoryStatus(product),
      })),
    [productSales, products]
  );
  const bestSellerProducts = productsWithStats.filter((item) => item.isBestSeller);
  const lowStockProducts = productsWithStats.filter((item) => item.inventoryStatus.key === "low");
  const unavailableProducts = productsWithStats.filter((item) =>
    ["out", "hidden"].includes(item.inventoryStatus.key)
  );
  const topSoldProducts = [...productsWithStats]
    .filter((item) => item.sold > 0)
    .sort((left, right) => right.sold - left.sold || right.revenue - left.revenue)
    .slice(0, 3);
  const visibleProductStats = productsWithStats
    .filter((item) => {
      if (productView === "bestSeller") return item.isBestSeller;
      if (productView === "topSold") return item.sold > 0;
      if (productView === "lowStock") return item.inventoryStatus.key === "low";
      if (productView === "outOfStock") return ["out", "hidden"].includes(item.inventoryStatus.key);
      return true;
    })
    .sort((left, right) => {
      if (productView === "topSold") return right.sold - left.sold || right.revenue - left.revenue;
      if (productView === "bestSeller") return right.sold - left.sold;
      if (productView === "lowStock" || productView === "outOfStock") {
        return (left.product.stock ?? 0) - (right.product.stock ?? 0);
      }
      return 0;
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quản lý sản phẩm</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi bán chạy, sản phẩm sắp hết, hết hàng và cập nhật tồn kho.</p>
        </div>
        <button
          type="button"
          onClick={openCreateProduct}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng sản phẩm</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{productsWithStats.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sắp hết hàng</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-200">{lowStockProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hết hàng / tạm ẩn</p>
              <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">{unavailableProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang bán chạy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{bestSellerProducts.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {topSoldProducts.length > 0 ? (
          topSoldProducts.map((item, index) => (
            <SectionCard key={item.product.id} className="p-4">
              <div className="flex gap-3">
                <Image
                  src={productImageUrl(item.product.image)}
                  alt={item.product.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg border border-orange-100 object-cover dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-orange-500">Bán nhiều #{index + 1}</p>
                  <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">{item.product.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Đã bán {item.sold} - {formatVND(item.revenue)}
                  </p>
                </div>
              </div>
            </SectionCard>
          ))
        ) : (
          <SectionCard className="p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Chưa có dữ liệu bán hàng</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Khi có đơn hàng, sản phẩm bán nhiều nhất sẽ hiện tại đây.</p>
          </SectionCard>
        )}
      </div>

      <div className="admin-scroll-strip flex snap-x gap-2 overflow-x-auto rounded-lg border border-orange-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {[
          { id: "all", label: "Tất cả", count: productsWithStats.length },
          { id: "bestSeller", label: "Đang bán chạy", count: bestSellerProducts.length },
          { id: "topSold", label: "Bán nhiều nhất", count: productsWithStats.filter((item) => item.sold > 0).length },
          { id: "lowStock", label: "Sắp hết", count: lowStockProducts.length },
          { id: "outOfStock", label: "Hết hàng / tạm ẩn", count: unavailableProducts.length },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setProductView(item.id as typeof productView)}
            className={`shrink-0 snap-start rounded-md px-3 py-2 text-sm font-semibold transition ${
              productView === item.id
                ? "bg-orange-500 text-white"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {productError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {productError}
        </div>
      )}

      {isProductFormOpen && (
        <AdminModal
          title={editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          description="Ảnh có thể nhập dạng products/product-61.jpg hoặc URL ảnh."
          onClose={closeProductForm}
          size="xl"
        >
          <form className="space-y-3" onSubmit={onSaveProduct}>
            <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-orange-100 bg-orange-50/60 dark:border-slate-700 dark:bg-slate-950">
                  <Image
                    src={imagePreviewSrc}
                    alt="Xem trước ảnh sản phẩm"
                    width={360}
                    height={288}
                    unoptimized={imagePreviewSrc.startsWith("data:")}
                    className="h-36 w-full object-cover"
                  />
                </div>
                <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                  <Upload className="h-4 w-4" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => onProductImageFileChange(event.target.files?.[0] || null)}
                  />
                </label>
                {selectedProductImageFile && (
                  <button
                    type="button"
                    onClick={() => onProductImageFileChange(null)}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Bỏ ảnh đã chọn
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 xl:col-span-2">
                  Tên sản phẩm
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Nhẫn vàng đính đá"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Giá bán
                  <input
                    type="number"
                    min={0}
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="1200000"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tồn kho
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Bảo hành (tháng)
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={productForm.warranty_months}
                    onChange={(event) => setProductForm((current) => ({ ...current, warranty_months: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Danh mục
                  <select
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="Dây chuyền">Dây chuyền</option>
                    <option value="Bông tai">Bông tai</option>
                    <option value="Vòng tay">Vòng tay</option>
                    <option value="Trang sức đôi">Trang sức đôi</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Đường dẫn ảnh
                <input
                  value={productForm.image}
                  onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="products/product-61.jpg"
                />
                  {selectedProductImageFile && (
                    <span className="mt-1 block truncate text-xs text-emerald-600 dark:text-emerald-300">
                      Ảnh mới: {selectedProductImageFile.name}
                    </span>
                  )}
              </label>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Trạng thái
                <select
                  value={productForm.status}
                  onChange={(event) => setProductForm((current) => ({ ...current, status: event.target.value as ProductFormState["status"] }))}
                    className="mt-1.5 h-10 w-full rounded-md border border-orange-100 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </label>

              <label className="flex items-end gap-2 rounded-md border border-orange-100 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={productForm.is_best_seller}
                  onChange={(event) => setProductForm((current) => ({ ...current, is_best_seller: event.target.checked }))}
                  className="h-4 w-4 accent-orange-500"
                />
                Bán chạy
              </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2 xl:col-span-4">
                  Mô tả
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                    className="mt-1.5 min-h-16 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950"
                    placeholder="Mô tả ngắn về sản phẩm"
                  />
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 grid grid-cols-2 gap-2 border-t border-orange-100 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:-mx-5 sm:-mb-5 sm:flex sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={closeProductForm}
                className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSavingProduct}
                className="h-10 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProduct ? "Đang lưu..." : editingProductId ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {productPendingDelete && (
        <AdminModal title="Xác nhận xóa sản phẩm" onClose={onCloseDeleteProduct} size="md">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
              <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-200" />
              <div>
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-100">
                  Bạn chắc chắn muốn xóa sản phẩm này?
                </p>
                <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-100/80">
                  Sản phẩm {productPendingDelete.name} sẽ bị xóa khỏi danh sách.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={onCloseDeleteProduct}
                className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onDeleteProduct(productPendingDelete.id)}
                disabled={deletingProductId === productPendingDelete.id}
                className="h-10 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingProductId === productPendingDelete.id ? "Đang xóa..." : "Xóa sản phẩm"}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProductStats.map(({ product, sold, revenue, isBestSeller, inventoryStatus }) => {
          return (
            <SectionCard key={product.id} className="p-4">
              <div className="flex gap-4">
                <Image
                  src={productImageUrl(product.image)}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-lg border border-orange-100 object-cover dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{product.name}</h3>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${inventoryStatus.tone}`}>
                      {inventoryStatus.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{product.category || "Chưa phân loại"}</p>
                  <p className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatVND(product.price)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {isBestSeller && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                        <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                        Bán chạy
                      </span>
                    )}
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      Đã bán {sold}
                    </span>
                    <span className="rounded-md bg-sky-50 px-2 py-1 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                      BH {product.warranty_months ?? 12} tháng
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {formatVND(revenue)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProduct(product)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-orange-100 px-3 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-200 dark:hover:bg-orange-500/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDeleteProduct(product)}
                      disabled={deletingProductId === product.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-100 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingProductId === product.id ? "Đang xóa" : "Xóa"}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
      {visibleProductStats.length === 0 && (
        <SectionCard className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {productView === "bestSeller"
            ? "Chưa có sản phẩm nào được đánh dấu bán chạy."
            : productView === "topSold"
              ? "Chưa có sản phẩm nào phát sinh số lượng bán."
              : productView === "lowStock"
                ? "Không có sản phẩm nào sắp hết hàng."
                : productView === "outOfStock"
                  ? "Không có sản phẩm nào hết hàng hoặc tạm ẩn."
              : "Không tìm thấy sản phẩm phù hợp."}
        </SectionCard>
      )}
    </div>
  );
}
