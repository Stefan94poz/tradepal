import { MedusaService } from "@medusajs/framework/utils"
import EscrowTransaction from "./models/escrow-transaction"

class EscrowModuleService extends MedusaService({
  EscrowTransaction,
}) {
  async createEscrow(data: {
    order_id: string
    buyer_id: string
    seller_id: string
    amount: number
    currency: string
    payment_intent_id: string
  }) {
    return await this.createEscrowTransactions({
      ...data,
      status: 'held',
      held_at: new Date()
    })
  }
  
  async releaseEscrow(orderId: string) {
    const escrows = await this.listEscrowTransactions({
      filters: { order_id: orderId }
    })
    
    if (!escrows || escrows.length === 0) {
      throw new Error("Escrow transaction not found")
    }
    
    return await this.updateEscrowTransactions({
      id: escrows[0].id,
      status: 'released',
      released_at: new Date()
    })
  }
  
  async disputeEscrow(orderId: string, reason: string) {
    const escrows = await this.listEscrowTransactions({
      filters: { order_id: orderId }
    })
    
    if (!escrows || escrows.length === 0) {
      throw new Error("Escrow transaction not found")
    }
    
    return await this.updateEscrowTransactions({
      id: escrows[0].id,
      status: 'disputed',
      dispute_reason: reason
    })
  }
  
  async refundEscrow(orderId: string) {
    const escrows = await this.listEscrowTransactions({
      filters: { order_id: orderId }
    })
    
    if (!escrows || escrows.length === 0) {
      throw new Error("Escrow transaction not found")
    }
    
    return await this.updateEscrowTransactions({
      id: escrows[0].id,
      status: 'refunded'
    })
  }
}

export default EscrowModuleService
