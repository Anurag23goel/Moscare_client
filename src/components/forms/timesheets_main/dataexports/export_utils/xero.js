const {postData} = require("@/utility/api_utility");

exports.exportTimesheetToXeroApi = (timesheetJSON, userId) => {
    console.log("timesheetJSON", timesheetJSON)
    return postData(`/api/postTimesheetsXero/${userId}`, timesheetJSON);
}

exports.exportKmToXeroApi = (kmJSON, userId) => {
    console.log(kmJSON, "xero.js")
    return postData(`/api/postKMXero/${userId}`, kmJSON);
}

exports.exportInvoiceToXeroApi = (invoiceJSON, userId) => {
    console.log(invoiceJSON, "xero.js")
    return postData(`/api/postInvoicesXero/${userId}`, invoiceJSON);
}

exports.exportExpenseToXeroApi = (expenseJSON, userId) => {
    console.log(expenseJSON, "xero.js")
    return postData(`/api/postExpensesXero/${userId}`, expenseJSON);
}

exports.exportReimbursementToXeroApi = (reimbursementJSON, userId) => {
    console.log(reimbursementJSON, "xero.js")
    return postData(`/api/postReimbursementsXero/${userId}`, reimbursementJSON);
}