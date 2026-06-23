# AGENTS.md — Hướng Dẫn AI Agent Làm Việc Với Repo Atelier Handbag App

Tài liệu này được biên soạn nhằm hướng dẫn các AI Agent khác hiểu nhanh về cấu trúc, quy tắc phát triển, phong cách viết code và các chỉ dẫn an toàn khi làm việc trong kho lưu trữ (repository) này.

## Project Overview
**Atelier** là ứng dụng di động cao cấp (Luxury Handbag App) hỗ trợ tìm kiếm, khám phá và nhận đề xuất phong cách túi xách sang trọng. Ứng dụng tích hợp các tính năng:
- Trang chủ khám phá sản phẩm (HomeScreen) hỗ trợ tìm kiếm (debounced), lọc theo hãng, sắp xếp.
- Trang chi tiết sản phẩm (ProductDetailScreen) hiển thị ảnh, thông số, giá bán và đánh giá.
- Trang xem tất cả đánh giá (ReviewsScreen) hỗ trợ lọc theo số sao và sắp xếp đánh giá.
- Trang lưu trữ danh sách yêu thích (FavoritesScreen) lưu trữ offline hỗ trợ xóa đơn lẻ/hàng loạt.
- Trang Stylist cá nhân bằng AI (AIStylistScreen) gồm bộ câu hỏi Style Quiz và Image Search (quét phong cách từ ảnh).
- Trang định vị cửa hàng (StoreLocatorScreen) tích hợp bản đồ Leaflet hiển thị qua WebView, tính khoảng cách GPS, gọi điện và chỉ đường qua Google/Apple Maps.

## Tech Stack
- **Core**: React Native (v0.83.6), React (v19.2.0)
- **Language**: TypeScript (v5.9.2)
- **Navigation**: React Navigation v7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Animation**: React Native Reanimated (v4.2.1)
- **Persistent Storage**: AsyncStorage (`@react-native-async-storage/async-storage` v2.2.0)
- **Sensors & Hardware**: Expo Location (v55.1.10), Expo ImagePicker (v55.0.20)
- **Layout & CSS**: React Native StyleSheet (Vanilla CSS-in-JS style sheet)

## App Type: Expo or React Native CLI
- Dự án chạy trên nền **Expo (v55)** (sử dụng Expo Prebuild/Development Build với thư mục `/android` có sẵn trong root).
- Không phải React Native CLI thuần túy, nhưng hỗ trợ build native app qua lệnh `expo run:android` / `expo run:ios`.

## Folder Structure
```
handbag-app/
├── App.tsx                        # Root Component khởi tạo Providers (SafeAreaProvider, NavigationContainer...)
├── app.json                       # File cấu hình Expo (tên ứng dụng, permissions, plugins...)
├── package.json                   # Khai báo dependencies và scripts
├── tsconfig.json                  # Cấu hình TypeScript & path aliases (@/* -> src/*)
├── babel.config.js                # Cấu hình babel preset expo
└── src/
    ├── types/                     # Ràng buộc kiểu dữ liệu TypeScript (handbag.ts, navigation.ts, review.ts, store.ts)
    ├── constants/                 # Biến hằng số thiết kế (colors.ts, spacing.ts, brands.ts)
    ├── utils/                     # Hàm tiện ích helper (formatCurrency.ts, formatPercent.ts, sort.ts)
    ├── data/                      # Dữ liệu tĩnh cục bộ dự phòng (mockReviews.ts, stores.ts)
    ├── services/                  # Lớp xử lý I/O gọi API & local storage (handbagApi.ts, aiService.ts, favoriteStorage.ts, reviewLikesStorage.ts)
    ├── hooks/                     # Custom Hooks xử lý logic nghiệp vụ và quản lý state (useHandbags.ts, useFavorites.ts, useReviewLikes.ts, useDebounce.ts)
    ├── components/                # UI Components tái sử dụng
    │   ├── common/                # Components chung (AppHeader, CustomTabBar, LoadingState, ErrorState, EmptyState, PrimaryButton)
    │   ├── product/               # Components liên quan sản phẩm (ProductCard, SearchBar, BrandFilter, ProductImage...)
    │   ├── reviews/               # Components liên quan đánh giá (RatingStars, RatingGroup, ReviewCard)
    │   └── ai/                    # Components liên quan AI (StyleQuiz, OccasionSelector, RecommendationCard)
    └── screens/                   # Các màn hình chính (HomeScreen, ProductDetailScreen, ReviewsScreen, FavoritesScreen, AIStylistScreen, StoreLocatorScreen)
```

## Screen & Navigation Rules
- **Navigation Library**: Sử dụng `React Navigation v7`.
- **Navigator**:
  - `RootNavigator` (`src/navigation/RootNavigator.tsx`): Sử dụng Stack Navigator chứa màn `MainTabs`, `ProductDetail`, `Reviews`, và `Favorites`.
  - `BottomTabNavigator` (`src/navigation/BottomTabNavigator.tsx`): Sử dụng Custom Tab Bar (`CustomTabBar.tsx`), chứa `Home`, `AIStylist`, và `StoreLocator`.
- **Navigation Types**: Mọi màn hình và tham số truyền nhận phải được định nghĩa nghiêm ngặt trong `src/types/navigation.ts` (`RootStackParamList` và `BottomTabParamList`). Khi thêm màn hình mới hoặc route mới, **bắt buộc** phải cập nhật file types này.
- **Quy tắc điều hướng**: Không được tự ý thay đổi cấu trúc navigation (ví dụ: chuyển đổi giữa Stack và Tab) trừ khi được yêu cầu rõ ràng.
- **Kiểm tra route**: Nếu thêm screen mới, phải đăng ký và kiểm tra route/navigation tương ứng trong file định nghĩa kiểu và file Navigator.

## Component Rules
- **Tách biệt logic & giao diện**: Giữ code giao diện tại `src/screens` sạch sẽ. Chuyển các logic xử lý trạng thái phức tạp, gọi API, thao tác dữ liệu sang **Custom Hooks** (`src/hooks`) hoặc **Services** (`src/services`).
- **Tái sử dụng**: Hãy tìm kiếm và tái sử dụng các components có sẵn trong `src/components/common` (như `PrimaryButton`, `AppHeader`, `LoadingState`, `ErrorState`, `EmptyState`) trước khi tạo mới. Ưu tiên dùng component/style pattern có sẵn trong dự án.
- **Performance**:
  - Đối với danh sách dài (như danh sách sản phẩm ở HomeScreen), luôn sử dụng `<FlatList>` thay vì `<ScrollView>` cùng `.map()` để tối ưu hóa bộ nhớ.
  - Sử dụng `React.memo` cho các components con phức tạp và `useCallback`/`useMemo` để giữ tham chiếu không bị tạo lại thừa thãi khi render.

## Styling Rules
- **No Tailwind CSS**: Dự án sử dụng vanilla React Native `StyleSheet`. Tuyệt đối không cài đặt hoặc sử dụng Tailwind CSS/NativeWind.
- **Design Tokens**: Sử dụng các giá trị định sẵn từ:
  - `Colors` (`src/constants/colors.ts`): Bảng màu chủ đạo (`Colors.primary`, `Colors.secondary`, `Colors.text.primary`...).
  - `Spacing`, `BorderRadius`, `FontSize`, `FontWeight` (`src/constants/spacing.ts`): Các khoảng cách đệm, bo góc và font chữ đồng bộ.
- **Responsive**: 
  - Không hard-code kích thước màn hình quá cứng.
  - Sử dụng phần trăm (`%`), `flexbox` (flex: 1, justifyContent, alignItems), hoặc sử dụng `useWindowDimensions()` của React Native để đảm bảo giao diện co giãn tốt trên nhiều kích thước thiết bị Android/iOS khác nhau.
- **UI Form & Input**: Khi phát triển form/input, luôn chú ý bọc trong `KeyboardAvoidingView` và `SafeAreaView` để tránh bị bàn phím che khuất nội dung hoặc bị lẹm bởi tai thỏ/nút Home hệ thống.

## State Management Rules
- **State Pattern**: Dự án không dùng thư viện quản lý state toàn cục (như Redux, Zustand, Recoil).
- **State Logic**: 
  - State được quản lý cục bộ (Local state) trong các custom hooks (`src/hooks`) và đồng bộ offline thông qua `AsyncStorage` (qua các Service tương ứng).
  - Tránh truyền props quá sâu (prop-drilling). Nếu cần, có thể đề xuất sử dụng React Context, nhưng hiện tại hãy tuân thủ mô hình Custom Hooks + AsyncStorage hiện tại.

## API & Service Rules
- **MockAPI.io**: Dữ liệu sản phẩm được lấy từ Mock API trực tuyến qua `BASE_URL` trong `src/services/handbagApi.ts`. Nếu chưa cấu hình Mock API (chứa `'YOUR_PROJECT_ID'`), app sẽ tự động fallback về dữ liệu local tĩnh `FALLBACK_HANDBAGS`.
- **API Base URL / Config**: Không tự ý thay đổi `BASE_URL` mặc định, biến môi trường (env) hoặc cấu hình deploy của API trừ khi có yêu cầu cụ thể.
- **Service Layer**: Mọi tương tác mạng (fetch) và lưu trữ (AsyncStorage) phải được viết trong các hàm thuần túy tại `src/services/` (`handbagApi.ts`, `favoriteStorage.ts`, `reviewLikesStorage.ts`, `aiService.ts`).

## Assets Rules
- **Đúng thư mục**: Tất cả hình ảnh cục bộ, icon, splash screen phải được đặt trong thư mục `/assets` ở thư mục root. Nếu thêm ảnh/icon, phải đặt đúng thư mục assets hiện tại này.
- **Sử dụng ảnh/icon**: 
  - Sử dụng Expo Vector Icons (`@expo/vector-icons`) cho các icon vector.
  - Đối với hình ảnh sản phẩm, sử dụng Expo Image (`expo-image`) thay thế cho thẻ `<Image>` gốc của React Native để tận dụng khả năng tự động lưu bộ đệm (caching) hiệu năng cao.

## Native Module Safety Rules
- **Android/iOS Native Files**: Tuyệt đối **không tự ý chỉnh sửa** các file cấu hình hệ thống nằm trong thư mục `/android` hoặc bất kỳ file native code nào (Java, Kotlin, Objective-C, Swift) nếu nhiệm vụ không yêu cầu rõ ràng.
- **Native Packages**: Tuyệt đối **không tự ý cài đặt thêm** các thư viện có liên kết native (Native Modules/native dependency) mà không hỏi ý kiến người dùng trước. Với Expo, ưu tiên sử dụng `npx expo install` để đảm bảo phiên bản thư viện tương thích tuyệt đối với Expo SDK hiện tại.

## Files/Folders Agent Should Not Modify
- Thư mục `/android` (trừ khi có yêu cầu cấu hình native đặc biệt)
- Thư mục `.expo`
- Cấu hình biên dịch `/tsconfig.json` và `/babel.config.js` (trừ khi nâng cấp SDK/thêm plugins cấu hình)
- Tệp định nghĩa kiểu dữ liệu `src/types/` nếu không có thay đổi về schema hay API endpoint.

## Common Tasks Guide
- **Thêm Màn Hình Mới**:
  1. Định nghĩa tham số Route mới trong `src/types/navigation.ts`.
  2. Tạo screen component trong `src/screens/<NewScreen>.tsx`.
  3. Đăng ký screen vào Stack tương ứng trong `src/navigation/RootNavigator.tsx` hoặc `src/navigation/BottomTabNavigator.tsx`.
  4. Cập nhật route điều hướng ở các screen hiện tại.
- **Cập Nhật API / Schema Dữ Liệu**:
  1. Cập nhật TypeScript Interface tương ứng trong `src/types/handbag.ts` hoặc các tệp khác tại `src/types/`.
  2. Đồng bộ schema mới lên MockAPI.io hoặc file dữ liệu local tại `src/data/`.
  3. Cập nhật hàm map/sanitize trong file service tương ứng (e.g. `sanitizeHandbag` trong `handbagApi.ts`).
- **Sửa Đổi Giao Diện (UI/Styling)**:
  1. Kiểm tra hằng số màu sắc tại `src/constants/colors.ts` và khoảng cách tại `src/constants/spacing.ts`.
  2. Áp dụng styling thông qua `StyleSheet.create`. Đảm bảo responsive.

## Verification Commands
Tất cả các lệnh kiểm tra và chạy ứng dụng được lấy trực tiếp từ `package.json`:
- **Chạy Expo Dev Server**: `npm start` (hoặc `yarn start`, chạy `expo start`)
- **Chạy trên giả lập Android**: `npm run android` (chạy `expo run:android`)
- **Chạy trên giả lập iOS**: `npm run ios` (chạy `expo run:ios`)
- **Chạy phiên bản web**: `npm run web` (chạy `expo start --web`)
- **Lệnh Lints/Linting**: `chưa xác định`
- **Lệnh Tests/Testing**: `chưa xác định`
- **Lệnh Typecheck**: `chưa xác định`

## Done Criteria
1. Mã nguồn không bị lỗi biên dịch TypeScript (`tsconfig` không báo lỗi đỏ).
2. Ứng dụng khởi động thành công mà không bị crash hay hiển thị màn hình đỏ (Red Screen Error).
3. Logic nghiệp vụ chạy đúng thiết kế (ví dụ: Debounced search hoạt động ổn định, dữ liệu yêu thích đồng bộ đúng với AsyncStorage).
4. Layout hiển thị đúng thiết kế, hỗ trợ SafeAreaView cho tai thỏ và KeyboardAvoidingView cho ô nhập dữ liệu.
5. Không để lại code debug thừa (console.log vô tội vạ) hoặc comment thừa thãi không liên quan.

## Safety Rules
- **An Toàn Native**: Luôn kiểm tra tính tương thích của thư viện bằng `npx expo install` thay vì `npm install` đối với các package của hệ sinh thái Expo.
- **Bảo Mật API**: Không commit trực tiếp mã API key thật (ví dụ: `GEMINI_API_KEY`) lên git. Hãy để placeholder rõ ràng hoặc sử dụng biến môi trường nếu dự án cấu hình thêm.
- **Nguyên Trạng Bình Luận**: Giữ nguyên mọi bình luận (comments), tài liệu hướng dẫn (docstrings) không liên quan đến phạm vi chỉnh sửa của task để đảm bảo tính toàn vẹn thông tin cho nhóm phát triển.
