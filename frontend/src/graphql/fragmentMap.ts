// Bill & Payment GraphQL fragments (stub)
export const BillFragment = `
  fragment BillFields on Bill {
    id
    amount
    dueDate
    status
    payee
  }
`;

export const PaymentFragment = `
  fragment PaymentFields on Payment {
    id
    billId
    amount
    date
    status
  }
`;
