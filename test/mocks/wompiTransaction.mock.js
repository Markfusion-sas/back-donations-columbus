export const wompiTransactionMock = {
  event: 'transaction.updated',
  data: {
    transaction: {
      id: '0000000-0000000000-00006',
      amount_in_cents: 5000000,
      status: 'APPROVED',
      reference: 'ASN{"customer":"example@domain.com","OrderID":1234567890,"Date":"01-Jan-2024 00:00:00"}',
      customer_email: 'example@domain.com',
      currency: 'COP',
      payment_method_type: 'PSE',
      redirect_url: 'https://app.example.com/',
      payment_method: {
        user_legal_id: '1234567890',
        user_legal_id_type: 'CC',
      },
      customer_data: {
        full_name: 'John Doe',
        phone_number: '+570000000000',
      },
    },
  },
  signature: {
    properties: [
      'transaction.id',
      'transaction.status',
      'transaction.amount_in_cents'
    ],
    checksum: '216f20912b68de0850ff5233e1a86e0fc6ffe7df8dbe69a84eaabb94e4aadefc',
  },
  timestamp: 1704067200,
  sent_at: '2024-01-01T00:00:02.000Z',
  environment: 'test',
};
