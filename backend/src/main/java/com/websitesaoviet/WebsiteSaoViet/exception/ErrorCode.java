package com.websitesaoviet.WebsiteSaoViet.exception;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    TOKEN_NOT_EXITED(4449, "Token không tồn tại!", HttpStatus.OK),
    UNCATEGORIZED_EXCEPTION(1001, "Uncategorized error!", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(1002, "Unauthenticated!", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1003, "Unauthorized!", HttpStatus.FORBIDDEN),
    TOKEN_INVALID(1004, "Token invalid!", HttpStatus.BAD_REQUEST),
    PHONENUMBER_EXISTED(1005, "Số điện thoại đã tồn tại!", HttpStatus.OK),
    EMAIL_EXISTED(1006, "Email đã tồn tại!", HttpStatus.OK),

    PASSWORD_INVALID(1007, "Mật khẩu có độ dài từ 8 ký tự trở lên!", HttpStatus.OK),

    PHONENUMBER_INVALID(1008, "Số điện thoại phải có đúng 10 chữ số!", HttpStatus.OK),

    EMAIL_INVALID(1009, "Email phải đúng định dạng 'example@example.com'!", HttpStatus.OK),

    FULLNAME_INVALID (1010,"Họ tên không chứa số hoặc ký tự đặc biệt!", HttpStatus.OK),

    FULLNAME_LENGTH_INVALID(1011, "Họ tên có độ dài trong khoảng 5 đến 50 ký tự!", HttpStatus.OK),
    NOT_NULL_LOGIN(1012, "Vui lòng nhập thông tin để đăng nhập!", HttpStatus.OK),
    ACCOUNT_NOT_EXITED(1013, "Tài khoản không tồn tại!", HttpStatus.OK),
    LOGIN_FAILED(1014, "Tài khoản hoặc mật khẩu không đúng!", HttpStatus.OK),
    INVALID_PASSWORD(1015, "Mật khẩu không hợp lệ!", HttpStatus.OK),
    ADMIN_NOT_EXITED(1016, "Quản trị viên không tồn tại!", HttpStatus.OK),
    USER_NOT_EXITED(1017, "Khách hàng không tồn tại!", HttpStatus.OK),
    INACTIVATE(1018, "Tài khoản chưa kích hoạt!", HttpStatus.OK),
    BLOCKED(1019, "Tài khoản đã bị khóa!", HttpStatus.OK),
    EMAIL_SEND_FAILED(1020, "Lỗi gửi email!", HttpStatus.OK),

    DAY_INVALID(1021, "Số ngày phải lớn hơn không!", HttpStatus.OK),
    TOUR_NOT_EXITED(1022, "Tour không tồn tại!", HttpStatus.OK),

    STARTDATE_NOT_NULL(1023, "Ngày khởi hành không được bỏ trống!", HttpStatus.OK),

    ENDDATE_NOT_NULL(1024, "Ngày kết thúc không được bỏ trống!", HttpStatus.OK),

    PEOPLE_INVALID(1025, "Số người phải lớn hơn 0!", HttpStatus.OK),

    PRICE_INVALID(1026, "Giá tiền phải lớn hơn 0!", HttpStatus.OK),
    STARTDATE_INVALID(1027, "Ngày khởi hành không được trước ngày " +
            LocalDate.now().plusDays(3).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "!",
            HttpStatus.OK),
    SCHEDULE_NOT_EXITED(1028, "Lịch trình không tồn tại!", HttpStatus.OK),
    SCHEDULE_IN_PROGRESS(1029, "Lịch trình đang diễn ra!", HttpStatus.OK),

    DISCOUNT_INVALID(1030, "Giá khuyến mãi phải lớn hơn 0!", HttpStatus.OK),

    PROMOTION_STARTDATE_NOT_NULL(1031, "Ngày bắt đầu không được bỏ trống!", HttpStatus.OK),

    QUANTITY_INVALID(1032, "Số lượng phải lớn hơn 0!", HttpStatus.OK),
    PROMOTION_STARTDATE_INVALID(1033, "Ngày bắt đầu không được trước ngày " +
            LocalDate.now().plusDays(1).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "!",
            HttpStatus.OK),
    PROMOTION_ENDDATE_INVALID(1034, "Ngày kết thúc không được trước ngày bắt đầu!", HttpStatus.OK),
    PROMOTION_NOT_EXITED(1035, "Khuyến mãi không tồn tại!", HttpStatus.OK),
    PROMOTION_CODE_AVAILABLE(1036, "Mã khuyến mãi đã tồn tại!", HttpStatus.OK),
    SCHEDULE_PEOPLE_INVALID(1037, "Số lượng người vượt quá số lượng người tối đa!", HttpStatus.OK),

    DATE_INVALID(1038, "Thời gian không hợp lệ!" , HttpStatus.OK),

    PAYMENT_MOMO_FAILED(1039, "Không thể thanh toán bằng Momo!", HttpStatus.OK),
    PAYMENT_VNPAY_FAILED(1040, "Không thể thanh toán bằng Vnpay!", HttpStatus.OK),
    SIGNATURE_INVALID(1041, "Chữ ký không hợp lệ!", HttpStatus.OK),
    DATA_INVALID(1042, "Dữ liệu không hợp lệ!", HttpStatus.OK),
    CHECKOUT_EXITED(1043, "Thanh toán đã tồn tại!", HttpStatus.OK),
    INTERNAL_SERVER_ERROR(1044, "Lỗi máy chủ nội bộ!", HttpStatus.INTERNAL_SERVER_ERROR),
    CHECKOUT_NOT_EXITED(1045, "Thanh toán không tồn tại!", HttpStatus.OK),

    QUANTITY_ADULT(1046, "Số người lớn nằm trong khoảng 0-99!", HttpStatus.OK),

    QUANTITY_CHILDREN(1047, "Số trẻ em nằm trong khoảng 0-99!", HttpStatus.OK),

    BOOKING_NOT_EXITED(1048, "Lịch đặt không tồn tại!", HttpStatus.OK),
    BOOKING_PROCESSING(1049, "Lịch đặt đang xử lý!", HttpStatus.OK),

    RATING_INVALID(1050, "Đánh giá nằm trong khoảng 1-5!", HttpStatus.OK),

    COMMENT_INVALID(1051, "Nội dung phản hồi khoảng 500 từ!", HttpStatus.OK),

    REVIEW_NOT_EXITED(1052, "Đánh giá không tồn tại!", HttpStatus.OK),
    REVIEW_INVALID(1053, "Đánh giá không hợp lệ!", HttpStatus.OK),
    NEWS_NOT_EXITED(1054, "Tin tức không tồn tại!", HttpStatus.OK),
    QUANTITY_PEOPLE_INVALID(1055, "Số lượng hành khách phải lớn hơn 0!", HttpStatus.OK),
    METHOD_PAYMENT_INVALID(1056, "Vui lòng thay đổi phương thức thanh toán khác!", HttpStatus.OK),
    DATETIME_INVALID(1057, "Thời gian sai định dạng!", HttpStatus.OK),
    SCHEDULE_EXITED(1058, "Lịch trình đã tồn tại!", HttpStatus.OK),
    SCHEDULE_INVALID(1059, "Số người tối đa không hợp lệ!", HttpStatus.OK),
    TOTAL_PEOPLE_INVALID(1060, "Số người tối đa nằm trong khoảng từ 1-99!", HttpStatus.OK),
    BOOKING_SUCCESSFULLY(1061, "Lịch trình đang có lịch đặt!", HttpStatus.OK),
    TOUR_NOT_STARTED(1062, "Tour có lịch trình chưa diễn ra!", HttpStatus.OK),
    HOTTOUR_NOT_EXITED(1063, "Hot tour không tồn tại!", HttpStatus.OK),
    CHATBOT_ERROR(1064, "Đã xảy ra lỗi không xác định! Vui lòng thử lại sau.", HttpStatus.OK),
    CHATBOT_DATE_INVALID(1065, "Vui lòng nhập thời gian đúng định dạng. Ví dụ: 25/05/2025 hoặc 05/2025.", HttpStatus.OK),

    NOT_NULL(1066, "Vui lòng không bỏ trống!", HttpStatus.OK),
    RECAPTCHA_FAILED(1067, "Xác thực reCAPTCHA thất bại!", HttpStatus.OK),
    REFRESH_TOKEN_INVALID(1068, "Refresh token invalid!", HttpStatus.OK),
    REFRESH_TOKEN_NOT_EXITED(1069, "Refresh token not exited!", HttpStatus.OK),
    ;
    
    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}