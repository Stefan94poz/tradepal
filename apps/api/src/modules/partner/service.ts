import { MedusaService } from "@medusajs/framework/utils"
import PartnerProfile from "./models/partner-profile"

class PartnerModuleService extends MedusaService({
  PartnerProfile,
}) {
  async searchPartners(filters: {
    country?: string
    industry?: string[]
    looking_for?: string[]
    offers?: string[]
    skip?: number
    take?: number
  }) {
    return await this.listPartnerProfiles({
      filters: {
        ...filters,
        is_verified: true
      },
      skip: filters.skip || 0,
      take: filters.take || 20
    })
  }
}

export default PartnerModuleService
