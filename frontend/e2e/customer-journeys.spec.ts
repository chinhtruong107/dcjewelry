import { expect, test } from "@playwright/test";

const product = {
  id: 1,
  name: "Dây chuyền vàng 18K Aurora",
  price: 1200000,
  image: "/images/NoImage.jpg",
  description: "Thiết kế thanh lịch dành cho những khoảnh khắc đặc biệt.",
  category: "Dây chuyền",
  stock: 8,
  status: "active",
  is_best_seller: true,
};

test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/products(?:\?.*)?$/, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
});

test("contact và newsletter gửi dữ liệu thật qua API", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe("client@example.com");
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Đức Chính Jewelry đã nhận được tin nhắn.", reference: "LH-000123" }),
    });
  });
  await page.route("**/api/newsletter", async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe("newsletter@example.com");
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Đăng ký thành công.", already_subscribed: false }),
    });
  });

  await page.goto("/contact");
  await page.getByLabel("Tên của bạn").fill("Nguyễn Minh Anh");
  await page.getByLabel("Email của bạn").fill("client@example.com");
  await page.getByLabel("Chủ đề").fill("Tư vấn dây chuyền");
  await page.getByLabel("Tin nhắn").fill("Tôi muốn được tư vấn một mẫu dây chuyền làm quà tặng.");
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();
  await expect(page.getByRole("status")).toContainText("LH-000123");

  await page.getByLabel("Email đăng ký nhận tin").fill("newsletter@example.com");
  await page.getByRole("button", { name: "Đăng ký nhận tin" }).click();
  await expect(page.getByText("Đăng ký thành công.")).toBeVisible();
});

test("khách có thể mua sản phẩm COD từ trang chi tiết đến khi tạo đơn", async ({ page }) => {
  await page.route("**/api/products/1/reviews", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/products/1", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(product) }),
  );
  await page.route("**/api/locations/provinces", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ code: "01", name: "Hà Nội", full_name: "Thành phố Hà Nội" }]),
    }),
  );
  await page.route("**/api/locations/provinces/01/wards", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { code: "00001", name: "Hoàn Kiếm", full_name: "Phường Hoàn Kiếm", province_code: "01" },
      ]),
    }),
  );
  await page.route("**/api/orders", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const payload = route.request().postDataJSON();
    expect(payload.payment_method).toBe("cod");
    expect(payload.items).toEqual([{ id: 1, quantity: 1 }]);
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: 99, order_number: "DH-E2E-001", ...payload }),
    });
  });

  await page.goto("/product/1");
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await page.getByRole("button", { name: "Mua ngay" }).click();

  await expect(page).toHaveURL(/\/cart$/);
  await page.getByRole("link", { name: /Tiến hành thanh toán/ }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByPlaceholder("Nguyễn Văn A").fill("Nguyễn Minh Anh");
  await page.getByPlaceholder("0901234567").fill("0389794445");
  await page.getByPlaceholder("nguyenvana@example.com").fill("client@example.com");
  await page.getByPlaceholder("Số nhà, tên đường").fill("12 Tràng Tiền, Hà Nội");
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Thành phố Hà Nội" }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Phường Hoàn Kiếm" }).click();
  await page.getByRole("button", { name: /Thanh toán khi nhận hàng/ }).click();
  await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();

  await expect(page.getByRole("heading", { name: "Cảm ơn bạn đã mua sắm" })).toBeVisible();
  await expect(page.getByText("DH-E2E-001")).toBeVisible();
});
