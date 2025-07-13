module "network" {
  source = "../../modules/network"

  project_settings = var.project_settings
  network_settings = var.network_settings
}
