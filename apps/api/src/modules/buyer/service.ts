import { MedusaService } from "@medusajs/framework/utils"
import BuyerProfile from "./models/buyer-profile"

class BuyerModuleService extends MedusaService({
  BuyerProfile,
}) {
  async submitVerification(userId: string, documents: string[]) {
    const profiles = await this.listBuyerProfiles({
      filters: { user_id: userId }
    })
    
    if (!profiles || profiles.length === 0) {
      throw new Error("Buyer profile not found")
    }
    
    return await this.updateBuyerProfiles({
      id: profiles[0].id,
      verification_documents: documents,
      verification_status: 'pending'
    })
  }
  
  async approveVerification(userId: string) {
    const profiles = await this.listBuyerProfiles({
      filters: { user_id: userId }
    })
    
    if (!profiles || profiles.length === 0) {
      throw new Error("Buyer profile not found")
    }
    
    return await this.updateBuyerProfiles({
      id: profiles[0].id,
      verification_status: 'verified'
    })
  }
}

export default BuyerModuleService
