const Sequelize = require('sequelize');
const db = require('./db');
const Model = Sequelize.Model;
const Op = Sequelize.Op;

const Notification = require('./notification');

class Transfer extends Model {


    // hàm này để lấy lịch sử giao dich theo thời gian nhất định của 1 user
    static async getActivityByDate(id, page, limit, fromDate, toDate) {

        // console.log(fromDate);

        return this.findAll({
            where: {
                [Op.or]: [
                    {
                        from: id
                    },
                    {
                        to: id
                    }
                ],
                createdAt: {
                    [Op.and]: [
                        {
                            [Op.gte]: fromDate
                        },
                        {
                            [Op.lte]: toDate
                        }
                    ]

                }



            },
            limit,
            offset: page * limit,
        })
    }

    static async addNew(fromUser, toUser, fromSTK, toSTK, amount, message, currencyUnit, bankCode) {
        const newTf = {
            from: fromSTK,
            to: toSTK,
            amount,
            message,
            currencyUnit,
            bankCode,
            fromUser,
            toUser,
        }
        return this.create(newTf).then(value => value);
    }


    static async addNewExternal(fromSTK, toSTK, amount, message, currencyUnit, bankCode) {
        const newTf = {
            from: fromSTK,
            to: toSTK,
            amount,
            message,
            currencyUnit,
            bankCode,
        }
        return this.create(newTf).then(value => {

            Notification.addNotifyForTransfer(fromSTK, toSTK);
            return value;
        });
    }

    static async addNewInExternal(fromSTK, toSTK, amount, message, currencyUnit, bankCode) {
        const newTf = {
            from: fromSTK,
            to: toSTK,
            amount,
            message,
            currencyUnit,
            bankCode,
        }
        return this.create(newTf).then(value => {
            Notification.addNotifyForTransfer(fromSTK, toSTK);
            Notification.addNotifyForReceive(fromSTK, toSTK);

            return value;
        });
    }

    static async addError(fromSTK, toSTK) {
        return this.create({
            from: fromSTK,
            to: toSTK,
            message: 'Đã xảy ra lỗi',
            status: -1,
        })
    }
    static async staffAddNew(staffID, toUser, toSTK, amount, message, currencyUnit) {
        const newTf = {
            to: toSTK,
            amount,
            message,
            currencyUnit,
            fromUser: staffID,
            toUser,
        }
        return this.create(newTf).then(value => value);
    }


    // hàm này để lấy thông tin giao dịch của 1 user có phân trang
    static async getActivityLimit(id, page, limit) {
        return this.findAll({
            where: {
                [Op.or]: [
                    {
                        from: id
                    },
                    {
                        to: id
                    }
                ]
            },
            limit,
            offset: page * limit,
        })
    }
    static async getActivity(id) {
        return this.findAll({
            where: {
                [Op.or]: [
                    {
                        from: id
                    },
                    {
                        to: id
                    }
                ]
            }
        })
    }
}

Transfer.init({
    //attributes
    from: { // STK
        type: Sequelize.INTEGER,
    },
    to: { //STK
        type: Sequelize.INTEGER,
    },
    amount: {
        type: Sequelize.DOUBLE,
    },
    message: {
        type: Sequelize.STRING,
    },
    bankCode: {
        type: Sequelize.STRING,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW(),
    },
    currencyUnit: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "USD",
    },
    fromUser: {
        type: Sequelize.INTEGER,
    },
    toUser: {
        type: Sequelize.INTEGER,
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
    }

}, {
    sequelize: db,
    modelName: 'transfer',
})



module.exports = Transfer;

