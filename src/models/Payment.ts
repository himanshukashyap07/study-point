import mongoose, { Document, Schema, model, models } from "mongoose";

export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    
    // Paytm Specific Fields
    orderId: string;       // Unique generated order ID sent to Paytm
    txnId?: string;        // Paytm Transaction ID
    bankTxnId?: string;    // Bank Transaction ID
    
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    
    paymentMode?: string;  // e.g., UPI, CC (Credit Card), DC (Debit Card), NB (Net Banking)
    gatewayName?: string;  // e.g., Paytm
    respCode?: string;     // Paytm response code for debugging 
    respMsg?: string;      // Paytm response message (e.g., "Txn Success")

    txnDate?: Date;        // Timestamp when the transaction completed on Paytm's end
}

const PaymentSchema = new Schema<IPayment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

    orderId: { type: String, required: true, unique: true },
    txnId: { type: String },
    bankTxnId: { type: String },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], 
        default: 'PENDING' 
    },

    paymentMode: { type: String },
    gatewayName: { type: String, default: 'Paytm' },
    respCode: { type: String },
    respMsg: { type: String },

    txnDate: { type: Date }
}, { timestamps: true });

export const Payment = models.Payment || model<IPayment>('Payment', PaymentSchema);
