import { MedusaService } from "@medusajs/framework/utils"
import SellerProfile from "./models/seller-profile"

class SellerModuleService extends MedusaService({
  SellerProfile,
}) {
  // Custom methods beyond auto-generated CRUD
  async submitVerification(userId: string, documents: string[]) {
    const profiles = await this.listSellerProfiles({
      filters: { user_id: userId }
    })
    
    if (!profiles || profiles.length === 0) {
      throw new Error("Seller profile not found")
    }
    
    return await this.updateSellerProfiles({
      id: profiles[0].id,
      verification_documents: documents,
      verification_status: 'pending'
    })
  }
  
  async approveVerification(userId: string) {
    const profiles = await this.listSellerProfiles({
      filters: { user_id: userId }
    })
    
    if (!profiles || profiles.length === 0) {
      throw new Error("Seller profile not found")
    }
    
    return await this.updateSellerProfiles({
      id: profiles[0].id,
      verification_status: 'verified'
    })
  }
  
  async rejectVerification(userId: string, reason: string) {
    const profiles = await this.listSellerProfiles({
      filters: { user_id: userId }
    })
    
    if (!profiles || profiles.length === 0) {
      throw new Error("Seller profile not found")
    }
    
    return await this.updateSellerProfiles({
      id: profiles[0].id,
      verification_status: 'rejected'
    })
  }
}

export default SellerModuleService
