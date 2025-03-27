export interface Transaction {
    sender: string;      // Ví gửi
    receiver: string;    // Ví nhận
    amount: number;      // Số lượng token
    fee: number;         // Phí giao dịch
    timestamp: number;   // Thời gian giao dịch
  }
  