
var socket = io("http://localhost:5000");

const addError = content => {
    $(`
    <div class="form-group mt-10 error">
    <p class="red">* ${content}</p>
</div>
    `).appendTo('form');
}
$(function () {
    $('#btnContinue').click(async function (e) {
        e.preventDefault();
        // http://localhost:5000/api/account/info

        const money = $('#txtMoney').val();
        const currencyUnit = $('#currencyUnit').val();
        const bankCode = $('#bankCode').val();
        const stk = $('#txtCardNumber').val();
        const message = $('#txtMessage').val();

        if (!money || !currencyUnit || !bankCode || !stk || !message) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        let tmp = money;
        if (currencyUnit == "VND") {
            tmp = Number(money) / 23000;
        }
        $('.error').remove();
        if (!Number(money) || Number(money) <= 0) {
            addError('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        $.get("api/account/info", function (data, textStatus, jqXHR) {

            if (!data) {
                addError('Bạn chưa có chưa có tài khoản ngân hàng <a href="/">Thêm tài khoản</a>');
            }
            // else if (data.isActive == 0) {
            //     addError('Tài khoản ngân hàng của bạn đã bị khóa');
            // }
            else if (Number(data.balance) < Number(tmp)) {
                addError('Số dư tài khoản không đủ');
            }
            else {
                const from = data.STK;
                $.post("api/account/addMoney", {
                    money: money,
                    currencyUnit: currencyUnit,
                    bankCode: bankCode,
                    stk: stk,
                    message: message,
                    from,
                },
                    function (data, textStatus, jqXHR) {
                        if (data == '-1') {
                            addError('Không thể gửi tiền cho chính mình');
                        }
                        if (data == '-2') {
                            addError('Lỗi không xác định');
                        }
                        if (data == '0') {
                            addError('Số tài khoản thụ hưởng hoặc ngân hàng không hợp lệ');
                        }
                        if (data == '1') {
                            const activity = {
                                stk,
                                money,
                                currencyUnit
                            }
                            localStorage.setItem('activityTransfer', JSON.stringify(activity));
                            $(location).attr('href', '/transfer-success');
                        }
                    },
                );
                // console.log('Số dư tài khoản đủ');
            }
            return;
        },
        );




        // $.post("/api/account/addMoney", newObj,
        //     function (data, textStatus, jqXHR) {
        //         console.log(data);

        //         // console.log($(location).attr('href', '/transfer-success'));

        //     },
        // );

        // socket.emit("transfer", newObj);
    })
});
socket.on("server-said", data => {
    //demo
    $('#txtCardNumber').val(data);
});