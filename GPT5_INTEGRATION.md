# Tích hợp GPT-5 vào Grammar Studio

## Tổng quan
Hệ thống Grammar Studio đã được cập nhật để sử dụng GPT-5 làm model mặc định, với khả năng fallback tự động về các model khác nếu GPT-5 không khả dụng.

## Các thay đổi chính

### 1. Model mặc định
- **Trước**: `gpt-4o-mini`
- **Sau**: `gpt-5`

### 2. Fallback Logic
Hệ thống sẽ tự động thử các model theo thứ tự:
1. `gpt-5` (model được chọn)
2. `gpt-4o` (fallback 1)
3. `gpt-4-turbo` (fallback 2)
4. `gpt-4o-mini` (fallback 3)

### 3. Giao diện người dùng
- **Settings Modal**: Thêm tùy chọn chọn model với GPT-5 ở đầu danh sách
- **Lesson Header**: Hiển thị model đang sử dụng
- **Mô tả**: Thêm thông tin về khả năng của GPT-5

## Cách sử dụng

### 1. Chọn AI Service
Trong form tạo bài học, bạn có thể chọn:
- **🤖 ChatGPT**: Sử dụng OpenAI models (GPT-5, GPT-4o, etc.)
- **✨ Gemini**: Sử dụng Google Gemini Pro

### 2. Cài đặt Model (cho ChatGPT)
1. Mở **Cài đặt** từ header
2. Chọn model từ dropdown:
   - `gpt-5 (Mới nhất)` - Model mới nhất với khả năng đa phương tiện
   - `gpt-4o` - Model đa phương tiện ổn định
   - `gpt-4-turbo` - Model nhanh và mạnh
   - `gpt-4o-mini` - Model nhẹ và tiết kiệm

### 3. Tạo bài học
- Chọn AI service từ dropdown
- Nhập tên bài học
- Bấm "Tạo bằng AI"
- AI service đang sử dụng sẽ được hiển thị trong header bài học

### 3. Xử lý lỗi
- Nếu GPT-5 không khả dụng, hệ thống sẽ tự động thử các model khác
- Thông báo lỗi sẽ hiển thị nếu tất cả model đều không khả dụng

## Lợi ích của GPT-5

### 1. Khả năng xử lý đa phương tiện
- Xử lý văn bản, hình ảnh, âm thanh
- Hiểu ngữ cảnh tốt hơn

### 2. Hiệu suất cải thiện
- Tốc độ xử lý nhanh hơn
- Độ chính xác cao hơn
- Giảm thiểu "ảo giác" (hallucination)

### 3. Khả năng suy luận
- Tư duy có cấu trúc tốt hơn
- Giải quyết vấn đề phức tạp
- Hiểu ngữ cảnh sâu hơn

## Cấu trúc code

### Hàm callAI
```typescript
async function callAI(prompt: string) {
  // Fallback logic với GPT-5 làm mặc định
  const fallbackModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  // Thử từng model cho đến khi thành công
}
```

### Settings Modal
```typescript
// Dropdown với GPT-5 ở đầu danh sách
<option value="gpt-5">gpt-5 (Mới nhất)</option>
```

### UI Display
```typescript
// Hiển thị model đang sử dụng
<span className="px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-xs">
  Model: {localStorage.getItem(STORAGE.MODEL) || 'gpt-5'}
</span>
```

## Lưu ý quan trọng

1. **API Key**: Cần có OpenAI API key hợp lệ
2. **Tính khả dụng**: GPT-5 có thể chưa khả dụng cho tất cả người dùng
3. **Chi phí**: GPT-5 có thể có giá cao hơn các model khác
4. **Fallback**: Hệ thống sẽ tự động chuyển sang model khác nếu cần

## Gemini Integration

### Tự động Fallback
Hệ thống tự động sử dụng Google Gemini khi:
- Tất cả OpenAI models bị rate limit
- OpenAI models không khả dụng  
- Lỗi kết nối với OpenAI

### Cấu hình Gemini
1. Lấy API key từ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Thêm vào Settings → Gemini API Key
3. Hệ thống sẽ tự động sử dụng Gemini 2.5 Flash khi cần
4. Model: `gemini-2.5-flash` (mới nhất, nhanh và hiệu quả)

### UI Indicators
- Bài học tạo bằng Gemini sẽ có badge "✨ Powered by Gemini"
- Console sẽ hiển thị "All OpenAI models failed, trying Gemini..."

## Troubleshooting

### Lỗi "Model không khả dụng"
- Hệ thống sẽ tự động thử các model khác
- Nếu tất cả OpenAI models lỗi, sẽ tự động chuyển sang Gemini
- Kiểm tra API key có quyền truy cập GPT-5

### Lỗi "Không thể kết nối"
- Kiểm tra kết nối internet
- Xác minh API key hợp lệ
- Hệ thống sẽ tự động thử Gemini nếu OpenAI lỗi

### Hiệu suất chậm
- GPT-5 có thể chậm hơn trong thời gian đầu
- Có thể chuyển sang gpt-4o hoặc gpt-4o-mini để tăng tốc
- Gemini có thể chậm hơn OpenAI nhưng đáng tin cậy hơn

### Lỗi "Tất cả AI services đều không khả dụng"
- Kiểm tra cả OpenAI và Gemini API keys
- Đảm bảo có ít nhất một service khả dụng
- Kiểm tra quota của cả hai services
