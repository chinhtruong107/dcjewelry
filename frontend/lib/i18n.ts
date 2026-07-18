export type Language = "vi" | "en";

type TranslationPair = readonly [vietnamese: string, english: string];

const translationPairs: TranslationPair[] = [
  ["Đức Chính Jewelry - Trang sức cao cấp", "Duc Chinh Jewelry - Fine Jewelry"],
  ["Trang sức cao cấp", "Fine jewelry"],
  ["Di sản mới", "The new heirloom"],
  ["Khám phá", "Discover"],
  ["Những món đồ được yêu", "Objects of affection"],
  ["Di sản hiện đại", "Modern heirlooms"],
  ["Chế tác đầy dụng ý", "Made with intention"],
  ["Tuyển tập dấu ấn", "The signature edit"],
  ["Tuyển tập dây chuyền", "Necklace edit"],
  ["Tuyển chọn bông tai", "Earring selection"],
  ["Câu chuyện vòng tay", "Bracelet stories"],
  ["Sắp ra mắt", "Coming soon"],
  ["Lịch sử đơn hàng", "Order history"],
  ["Miễn phí tư vấn · Hotline 0389794445", "Complimentary consultation · Hotline 0389794445"],
  ["Đức Chính Jewelry - Trang chủ", "Duc Chinh Jewelry - Home"],
  ["Điều hướng chính", "Main navigation"],
  ["Điều hướng di động", "Mobile navigation"],
  ["Dây chuyền", "Necklaces"],
  ["Bông tai", "Earrings"],
  ["Vòng tay", "Bracelets"],
  ["Liên hệ", "Contact"],
  ["Tài khoản", "Account"],
  ["Đăng xuất", "Sign out"],
  ["Tìm kiếm", "Search"],
  ["Mở menu", "Open menu"],
  ["Đóng menu", "Close menu"],
  ["Trang chủ", "Home"],
  ["Danh mục", "Categories"],
  ["Sản phẩm", "Products"],
  ["Tìm kiếm thiết kế, chất liệu...", "Search designs, materials..."],
  ["Bộ sưu tập", "Collections"],
  ["Chăm sóc khách hàng", "Client care"],
  ["Đặt lịch tư vấn", "Book a consultation"],
  ["Đặc quyền riêng", "Private access"],
  ["Những câu chuyện mới, gửi riêng đến bạn.", "New stories, delivered just for you."],
  ["Những câu chuyện mới,", "New stories,"],
  ["gửi riêng đến bạn.", "delivered just for you."],
  ["Email đăng ký nhận tin", "Newsletter email"],
  ["Email của bạn", "Your email"],
  ["Đăng ký nhận tin", "Subscribe"],
  ["Chưa thể đăng ký nhận tin.", "Unable to subscribe right now."],
  ["Những thiết kế mang tinh thần đương đại, được chọn lựa để đồng hành cùng bạn qua nhiều thế hệ.", "Contemporary designs selected to stay with you for generations."],
  ["Hà Nội", "Hanoi"],
  ["Việt Nam", "Vietnam"],
  ["Tuyển chọn tinh hoa", "Curated excellence"],
  ["Mỗi thiết kế được tuyển chọn bằng tiêu chuẩn khắt khe về tỷ lệ, chất liệu và vẻ đẹp trường tồn.", "Every design is selected for its proportions, materials and enduring beauty."],
  ["Chế tác tinh xảo", "Refined craftsmanship"],
  ["Từng chi tiết hoàn thiện trên vàng và đá quý đều được chăm chút để tỏa sáng vừa đủ.", "Every detail in gold and gemstones is carefully finished for an elegant glow."],
  ["Dịch vụ riêng tư", "Personal service"],
  ["Trải nghiệm mua sắm chỉn chu, minh bạch và tư vấn theo dấu ấn riêng của từng khách hàng.", "A thoughtful, transparent shopping experience tailored to every client."],
  ["Thiết kế nổi bật", "Signature designs"],
  ["Xem bộ sưu tập", "Explore the collection"],
  ["Xem tất cả", "View all"],
  ["Xem thêm", "Load more"],
  ["Hiển thị", "Showing"],
  ["sản phẩm", "products"],
  ["Bộ sưu tập đang được hoàn thiện", "The collection is being completed"],
  ["Những thiết kế mới sẽ sớm xuất hiện tại đây.", "New designs will be available here soon."],
  ["Trang sức dành cho hiện tại, được tạo nên để trở thành một phần của những câu chuyện dài lâu.", "Jewelry for today, created to become part of stories that last."],
  ["Chuyển đến ảnh banner", "Go to banner image"],
  ["Chưa có hình ảnh", "Image unavailable"],
  ["Hết hàng", "Out of stock"],
  ["Yêu thích", "Favorite"],
  ["Đã yêu thích", "Favorited"],
  ["Thêm yêu thích", "Add to favorites"],
  ["Thêm vào giỏ", "Add to bag"],
  ["Đang thêm", "Adding"],
  ["Đã thêm", "Added"],
  ["Đã thêm vào giỏ", "Added to bag"],
  ["Không thể thêm vào giỏ hàng.", "Unable to add this item to your bag."],
  ["Bộ lọc sản phẩm", "Product filters"],
  ["Lọc theo nhu cầu mua sắm", "Filter for your needs"],
  ["Xóa bộ lọc", "Clear filters"],
  ["Khoảng giá", "Price range"],
  ["Từ", "From"],
  ["Đến", "To"],
  ["Giá thấp nhất", "Minimum price"],
  ["Giá cao nhất", "Maximum price"],
  ["Hàm lượng vàng", "Gold purity"],
  ["Trạng thái", "Status"],
  ["Chỉ hiển thị sản phẩm bán chạy", "Show best sellers only"],
  ["Sắp xếp", "Sort by"],
  ["Nổi bật", "Featured"],
  ["Giá thấp đến cao", "Price: low to high"],
  ["Giá cao đến thấp", "Price: high to low"],
  ["Tên A-Z", "Name: A-Z"],
  ["Nhẹ giá, dễ đeo hằng ngày", "Accessible and easy to wear every day"],
  ["Cân bằng độ bền và sắc vàng", "A balance of durability and gold tone"],
  ["Hàm lượng vàng cao, sang hơn", "Higher gold content with a richer look"],
  ["Vàng nguyên chất", "Pure gold"],
  ["Không có sản phẩm phù hợp", "No matching products"],
  ["Không có sản phẩm nào khớp với bộ lọc hiện tại.", "No products match the current filters."],
  ["Trở về trang chủ", "Return home"],
  ["Đang tải sản phẩm...", "Loading product..."],
  ["Không tải được sản phẩm.", "Unable to load this product."],
  ["Không tải được đánh giá.", "Unable to load reviews."],
  ["Thiết kế được tuyển chọn dành cho những khoảnh khắc cần một điểm sáng tinh tế.", "A curated design for moments that deserve a refined touch of light."],
  ["Chưa có đánh giá", "No reviews yet"],
  ["Số lượng", "Quantity"],
  ["Giảm số lượng", "Decrease quantity"],
  ["Tăng số lượng", "Increase quantity"],
  ["Đánh giá sản phẩm", "Product reviews"],
  ["Chỉ khách hàng đã mua và nhận hàng mới có thể gửi đánh giá.", "Only verified customers who received this item can submit a review."],
  ["Đang tải đánh giá...", "Loading reviews..."],
  ["Sản phẩm này chưa có đánh giá nào.", "This product has no reviews yet."],
  ["Khách hàng", "Customer"],
  ["Bảo hành", "Warranty"],
  ["tháng", "months"],
  ["Giỏ hàng đang trống", "Your bag is empty"],
  ["Bạn chưa thêm thiết kế trang sức nào vào giỏ hàng.", "You have not added any jewelry designs to your bag yet."],
  ["Trở lại cửa hàng", "Continue shopping"],
  ["Miễn phí vận chuyển từ 500.000đ", "Free shipping from 500,000 VND"],
  ["Miễn phí vận chuyển từ", "Free shipping from"],
  ["Thêm", "Add"],
  ["để nhận ưu đãi.", "to unlock this offer."],
  ["Thanh toán an toàn", "Secure payment"],
  ["Tóm tắt đơn hàng", "Order summary"],
  ["Tạm tính", "Subtotal"],
  ["Vận chuyển", "Shipping"],
  ["Miễn phí", "Free"],
  ["Thuế", "Tax"],
  ["Thành viên (giảm 5%)", "Member discount (5%)"],
  ["Đăng nhập để nhận ưu đãi thành viên.", "Sign in to receive the member discount."],
  ["Tổng cộng", "Total"],
  ["Tiến hành thanh toán", "Proceed to checkout"],
  ["Giao hàng nhanh và cẩn trọng", "Fast and careful delivery"],
  ["Thông tin giao hàng", "Shipping information"],
  ["Thông tin người nhận", "Recipient information"],
  ["Phương thức thanh toán", "Payment method"],
  ["Đặt hàng", "Place order"],
  ["Đang đặt hàng...", "Placing order..."],
  ["Họ và tên", "Full name"],
  ["Số điện thoại", "Phone number"],
  ["Địa chỉ giao hàng", "Shipping address"],
  ["Số nhà, tên đường...", "House number, street..."],
  ["Tỉnh/Thành phố", "Province/City"],
  ["Phường/Xã", "Ward/Commune"],
  ["Chọn tỉnh/thành", "Select a province/city"],
  ["Chọn phường/xã", "Select a ward/commune"],
  ["Chọn tỉnh trước", "Select a province first"],
  ["Ghi chú đơn hàng", "Order notes"],
  ["Không bắt buộc", "Optional"],
  ["Đăng nhập", "Sign in"],
  ["Đăng nhập thành công.", "Signed in successfully."],
  ["Email hoặc mật khẩu không chính xác.", "The email or password is incorrect."],
  ["Đăng nhập thất bại. Vui lòng thử lại.", "Sign in failed. Please try again."],
  ["Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.", "Unable to connect to the server. Please try again later."],
  ["Mật khẩu", "Password"],
  ["Nhập mật khẩu", "Enter your password"],
  ["Quên mật khẩu?", "Forgot password?"],
  ["Đang đăng nhập...", "Signing in..."],
  ["Chưa có tài khoản?", "New here?"],
  ["Tạo tài khoản", "Create an account"],
  ["Đăng ký", "Register"],
  ["Xác nhận mật khẩu", "Confirm password"],
  ["Đã có tài khoản?", "Already have an account?"],
  ["Đăng nhập ngay", "Sign in now"],
  ["Khôi phục mật khẩu", "Reset password"],
  ["Gửi mật khẩu mới", "Send new password"],
  ["Đổi mật khẩu", "Change password"],
  ["Mật khẩu hiện tại", "Current password"],
  ["Mật khẩu mới", "New password"],
  ["Lưu thay đổi", "Save changes"],
  ["Không gian tài khoản", "Your account"],
  ["Hồ sơ thành viên", "Member profile"],
  ["Quản lý thông tin giao hàng, theo dõi đơn mua và lưu lại những thiết kế bạn yêu thích.", "Manage delivery details, track orders and save the designs you love."],
  ["Thông tin cá nhân", "Personal details"],
  ["Đơn hàng của tôi", "My orders"],
  ["Sản phẩm yêu thích", "Favorite products"],
  ["Cập nhật số điện thoại và địa chỉ để quá trình đặt hàng lần sau nhanh hơn.", "Keep your phone number and address updated for a faster checkout next time."],
  ["Đang tải đơn hàng...", "Loading orders..."],
  ["Không có đơn hàng nào trong nhóm này.", "There are no orders in this group."],
  ["Mã đơn", "Order ID"],
  ["Thanh toán", "Payment"],
  ["Chi tiết đơn hàng", "Order details"],
  ["Thành tiền", "Item total"],
  ["Ưu đãi", "Discount"],
  ["Bạn chưa có sản phẩm yêu thích nào.", "You do not have any favorite products yet."],
  ["Liên hệ với chúng tôi", "Contact us"],
  ["Gửi yêu cầu tư vấn", "Send a consultation request"],
  ["Nội dung", "Message"],
  ["Gửi liên hệ", "Send message"],
  ["Đang gửi...", "Sending..."],
  ["Theo dõi đơn hàng", "Track your order"],
  ["Mã vận đơn", "Tracking number"],
  ["Tra cứu", "Track"],
  ["Chứng nhận bảo hành", "Warranty certificate"],
  ["Mã chứng nhận", "Certificate code"],
  ["Ngày bắt đầu", "Start date"],
  ["Ngày hết hạn", "Expiry date"],
  ["Quay lại", "Go back"],
  ["Hủy", "Cancel"],
  ["Xác nhận", "Confirm"],
  ["Đóng", "Close"],
  ["Gửi", "Send"],
  ["Tiếp tục", "Continue"],
  ["Đang tải...", "Loading..."],
  ["Có lỗi xảy ra", "Something went wrong"],
  ["Vui lòng thử lại", "Please try again"],
  ["Không tìm thấy trang", "Page not found"],
  ["Không tìm thấy sản phẩm", "Product not found"],
  ["Cần tư vấn trang sức?", "Need jewelry advice?"],
  ["Tư vấn trang sức riêng tư", "Private jewelry consultation"],
  ["Nhập tin nhắn cần tư vấn", "Enter your message"],
  ["Bạn đang tìm thiết kế nào?", "What design are you looking for?"],
  ["Gửi tin nhắn", "Send message"],
  ["Mở chatbot tư vấn", "Open consultation chat"],
  ["Thu nhỏ chatbot", "Minimize chat"],
  ["Đóng chatbot", "Close chat"],
];

const vietnameseToEnglish = new Map(translationPairs);
const englishToVietnamese = new Map(translationPairs.map(([vi, en]) => [en, vi]));

function translateDynamic(value: string, language: Language): string {
  if (language === "en") {
    return value
      .replace(/Giỏ hàng có (\d+) sản phẩm/gi, "Shopping bag with $1 items")
      .replace(/Hiển thị (\d+) \/ (\d+) sản phẩm/gi, "Showing $1 of $2 products")
      .replace(/(\d+) bộ lọc đang bật/gi, "$1 active filters")
      .replace(/Tạm tính \((\d+) sản phẩm\)/gi, "Subtotal ($1 items)")
      .replace(/Còn (\d+) sản phẩm/gi, "$1 items in stock")
      .replace(/Bảo hành (\d+) tháng/gi, "$1-month warranty")
      .replace(/^(.+) \/ 5 từ (\d+) đánh giá$/gi, "$1 / 5 from $2 reviews")
      .replace(/(\d+) đánh giá/gi, "$1 reviews")
      .replace(/Chuyển đến ảnh banner (\d+)/gi, "Go to banner image $1")
      .replace(/^Thành phố (.+)$/i, "$1 City")
      .replace(/^Tỉnh (.+)$/i, "$1 Province")
      .replace(/^Phường (.+)$/i, "$1 Ward")
      .replace(/^Xã (.+)$/i, "$1 Commune")
      .replace(/^Thị trấn (.+)$/i, "$1 Township");
  }

  return value
    .replace(/Shopping bag with (\d+) items/gi, "Giỏ hàng có $1 sản phẩm")
    .replace(/Showing (\d+) of (\d+) products/gi, "Hiển thị $1 / $2 sản phẩm")
    .replace(/(\d+) active filters/gi, "$1 bộ lọc đang bật")
    .replace(/Subtotal \((\d+) items\)/gi, "Tạm tính ($1 sản phẩm)")
    .replace(/(\d+) items in stock/gi, "Còn $1 sản phẩm")
    .replace(/(\d+)-month warranty/gi, "Bảo hành $1 tháng")
    .replace(/^(.+) \/ 5 from (\d+) reviews$/gi, "$1 / 5 từ $2 đánh giá")
    .replace(/(\d+) reviews/gi, "$1 đánh giá")
    .replace(/Go to banner image (\d+)/gi, "Chuyển đến ảnh banner $1")
    .replace(/^(.+) City$/i, "Thành phố $1")
    .replace(/^(.+) Province$/i, "Tỉnh $1")
    .replace(/^(.+) Ward$/i, "Phường $1")
    .replace(/^(.+) Commune$/i, "Xã $1")
    .replace(/^(.+) Township$/i, "Thị trấn $1");
}

export function translateText(input: string, language: Language): string {
  if (!input.trim()) return input;

  const leadingWhitespace = input.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = input.match(/\s*$/)?.[0] ?? "";
  const value = input.slice(leadingWhitespace.length, input.length - trailingWhitespace.length);
  const directTranslation = language === "en"
    ? vietnameseToEnglish.get(value)
    : englishToVietnamese.get(value);

  if (directTranslation) {
    return `${leadingWhitespace}${directTranslation}${trailingWhitespace}`;
  }

  return `${leadingWhitespace}${translateDynamic(value, language)}${trailingWhitespace}`;
}
